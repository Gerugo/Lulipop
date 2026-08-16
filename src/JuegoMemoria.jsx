import { useState } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import NivelSelector from './NivelSelector'
import useMejoresNiveles from './useMejoresNiveles'

const NIVELES = [
  { id: 'facil', nombre: 'Fácil', descripcion: '4 parejas', emoji: '🌱', color: '#43e97b', sombra: '#27ae60', numParejas: 4, columnas: 4 },
  { id: 'medio', nombre: 'Medio', descripcion: '6 parejas', emoji: '🌿', color: '#4facfe', sombra: '#005580', numParejas: 6, columnas: 4 },
  { id: 'dificil', nombre: 'Difícil', descripcion: '7 parejas', emoji: '🌳', color: '#FF9966', sombra: '#D9534F', numParejas: 7, columnas: 4 },
]

const IMAGENES_CARTAS = [
  { src: `${import.meta.env.BASE_URL}assets/dino.png`, fallback: '🦖' },
  { src: `${import.meta.env.BASE_URL}assets/estrella.png`, fallback: '⭐' },
  { src: `${import.meta.env.BASE_URL}assets/gato.png`, fallback: '🐱' },
  { src: `${import.meta.env.BASE_URL}assets/globo.png`, fallback: '🎈' },
  { src: `${import.meta.env.BASE_URL}assets/manzana.png`, fallback: '🍎' },
  { src: `${import.meta.env.BASE_URL}assets/pez.png`, fallback: '🐟' },
  { src: `${import.meta.env.BASE_URL}assets/platano.png`, fallback: '🍌' },
]

export default function JuegoMemoria({ perfil, onVolver }) {
  const [nivelId, setNivelId] = useState(null)
  const [baraja, setBaraja] = useState([])
  const [cartasVolteadas, setCartasVolteadas] = useState([])
  const [parejasEncontradas, setParejasEncontradas] = useState([])
  const [bloqueado, setBloqueado] = useState(false)
  
  const [puntos, setPuntos] = useState(0)
  const [erroresRonda, setErroresRonda] = useState(0)
  const [nivelSuperado, setNivelSuperado] = useState(false)
  const [cartasError, setCartasError] = useState([]) 
  const [guardando, setGuardando] = useState(false)

  const { mejores, guardarMejorNivel } = useMejoresNiveles('memoria', perfil?.id)
  const nivel = NIVELES.find((n) => n.id === nivelId)

  const iniciarJuego = (nivelActivo = nivel) => {
    if (!nivelActivo) return
    const imagenesNivel = [...IMAGENES_CARTAS].sort(() => Math.random() - 0.5).slice(0, nivelActivo.numParejas)
    const mazo = [...imagenesNivel, ...imagenesNivel]
    
    for (let i = mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[mazo[i], mazo[j]] = [mazo[j], mazo[i]]
    }
    
    const barajaLista = mazo.map((item, index) => ({
      id: index,
      img: item.src,
      fallback: item.fallback,
      imgFailed: false
    }))

    setBaraja(barajaLista)
    setCartasVolteadas([])
    setParejasEncontradas([])
    setCartasError([])
    setPuntos(0)
    setErroresRonda(0)
    setNivelSuperado(false)
    setBloqueado(false)
  }

  const empezarNivel = (id) => {
    const n = NIVELES.find((x) => x.id === id)
    setNivelId(id)
    iniciarJuego(n)
  }

  const updateScore = (nuevosPuntos) => {
    setPuntos(prev => Math.max(0, prev + nuevosPuntos))
  }

  const guardarProgreso = async () => {
    if (!perfil?.id) return
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_memoria', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  const voltearCarta = (index) => {
    if (bloqueado || cartasVolteadas.includes(index) || parejasEncontradas.includes(baraja[index].img)) {
      return
    }

    const nuevasVolteadas = [...cartasVolteadas, index]
    setCartasVolteadas(nuevasVolteadas)

    if (nuevasVolteadas.length === 2) {
      setBloqueado(true)
      const carta1 = baraja[nuevasVolteadas[0]]
      const carta2 = baraja[nuevasVolteadas[1]]

      if (carta1.img === carta2.img) {
        setTimeout(() => {
          setParejasEncontradas(prev => {
            const nuevasParejas = [...prev, carta1.img]
            if (nuevasParejas.length === nivel.numParejas) {
              setTimeout(() => {
                setNivelSuperado(true)
                updateScore(50)
                const estrellas = erroresRonda <= 1 ? 3 : erroresRonda <= 4 ? 2 : 1
                guardarMejorNivel(nivelId, estrellas)
                guardarProgreso()
              }, 500)
            }
            return nuevasParejas
          })
          setCartasVolteadas([])
          setBloqueado(false)
          updateScore(15)
        }, 600)
      } else {
        updateScore(-2) 
        setErroresRonda(prev => prev + 1)
        setCartasError([...nuevasVolteadas]) 
        
        setTimeout(() => {
          setCartasVolteadas([])
          setCartasError([])
          setBloqueado(false)
        }, 1000) 
      }
    }
  }

  const handleBack = () => {
    if (nivelId) {
      setNivelId(null)
      setBaraja([])
    } else {
      onVolver()
    }
  }

  if (!nivel) {
    return (
      <NivelSelector
        onVolver={onVolver}
        emojiJuego="🧠"
        titulo="Memoria de Parejas"
        subtitulo="Elige tu reto"
        niveles={NIVELES}
        mejores={mejores}
        onSeleccionar={empezarNivel}
      />
    )
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;900&display=swap');
        
        .carta-contenedor {
          perspective: 1000px;
          cursor: pointer;
        }
        .carta-inner {
          position: relative;
          width: 100%; height: 100%;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }
        .carta-volteada .carta-inner {
          transform: rotateY(180deg);
        }
        
        .carta-cara {
          position: absolute;
          width: 100%; height: 100%;
          backface-visibility: hidden;
          border-radius: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
          display: flex; justify-content: center; align-items: center;
          border: 4px solid white;
        }
        
        .carta-frente {
          background: linear-gradient(135deg, #B5C6FF 0%, #FFB5E8 100%); 
        }
        
        .carta-dorso {
          background-color: white;
          transform: rotateY(180deg);
        }

        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        
        .anim-estrella { animation: rotaEstrella 3s linear infinite; }
        @keyframes rotaEstrella { 100% { transform: rotate(360deg); } }

        .carta-acierto { animation: aciertoPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; box-shadow: 0 0 20px 5px rgba(255, 209, 102, 0.8); border-color: #FFD166; }
        @keyframes aciertoPop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }

        .carta-error { animation: temblor 0.4s ease-in-out; }
        @keyframes temblor {
          0%, 100% { transform: rotateY(180deg) translateX(0); }
          25% { transform: rotateY(180deg) translateX(-8px) rotate(-3deg); }
          75% { transform: rotateY(180deg) translateX(8px) rotate(3deg); }
        }
        @media (max-height: 550px) {
          .btn-header-memoria {
            width: 42px !important;
            height: 42px !important;
            font-size: 18px !important;
            border-radius: 12px !important;
          }
          .btn-limpiar-memoria {
            height: 42px !important;
            padding: 0 12px !important;
            font-size: 16px !important;
            border-radius: 12px !important;
          }
          .marcador-memoria {
            top: 10px !important;
            padding: 4px 16px !important;
            font-size: 1.1rem !important;
            border-radius: 18px !important;
          }
          .panel-tablero-memoria {
            margin-top: 55px !important;
            padding: 10px 16px !important;
            border-radius: 24px !important;
          }
          .titulo-tablero-memoria {
            font-size: 1.1rem !important;
            margin-bottom: 8px !important;
            padding: 4px 14px !important;
          }
          .grid-cartas-memoria {
            gap: 8px !important;
            max-width: 420px !important;
          }
          .icono-carta-frente {
            font-size: 24px !important;
          }
          .fallback-carta-dorso {
            font-size: 26px !important;
          }
        }
      `}</style>

      {nivelSuperado && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box'
        }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '80px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}>🌟</div>
            <h1 style={{
              color: '#FFD166', fontSize: 'clamp(2.2rem, 7vw, 4rem)', margin: '8px 0',
              textShadow: '0 5px 0 #CCAC00, 0 8px 16px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '2px'
            }}>¡Súper!</h1>
            <p style={{ color: '#4facfe', fontSize: '1.25rem', fontWeight: '900', margin: '0 0 16px 0', backgroundColor: 'white', padding: '8px 24px', borderRadius: '25px', boxShadow: '0 4px 0 #cbd5e1' }}>
              ¡Nivel {nivel.nombre} completado!
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => setNivelId(null)} style={{
                backgroundColor: '#FFD166', color: '#7A5C00', border: 'none',
                padding: '12px 24px', borderRadius: '25px', fontSize: '1.15rem', fontWeight: '900',
                cursor: 'pointer', boxShadow: '0 6px 0 #CCAC00'
              }}>🔁 Otro nivel</button>
              <button onClick={onVolver} style={{
                backgroundColor: '#43e97b', color: 'white', border: 'none',
                padding: '12px 24px', borderRadius: '25px', fontSize: '1.15rem', fontWeight: '900',
                cursor: 'pointer', boxShadow: '0 6px 0 #27ae60'
              }}>{guardando ? 'Guardando...' : '¡Continuar! 🚀'}</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE NAVEGACIÓN */}
      <div style={{ 
        position: 'absolute', top: '15px', left: '15px', right: '15px', 
        display: 'flex', justifyContent: 'space-between', zIndex: 50 
      }}>
        <button onClick={handleBack} className="btn-header-memoria" style={{
          width: '52px', height: '52px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
          fontSize: '22px', cursor: 'pointer',
          boxShadow: '0 5px 0 #E0E0E0, 0 8px 12px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>❮</button>

        <button onClick={iniciarJuego} className="btn-limpiar-memoria" style={{
          height: '52px', padding: '0 18px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#333', border: 'none', 
          fontSize: '20px', fontWeight: '900', cursor: 'pointer',
          boxShadow: '0 5px 0 #E0E0E0, 0 8px 12px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center'
        }}>🧹</button>
      </div>

      <div className="marcador-memoria" style={{
        position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '8px 22px',
        borderRadius: '25px', border: '3px solid white',
        boxShadow: '0 10px 25px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center',
        gap: '8px', zIndex: 20, fontSize: '1.4rem', fontWeight: '900'
      }}>
        {nivel.emoji} ⭐ <span style={{ color: '#FFD166', textShadow: '0 3px 0 #CCAC00', minWidth: '55px', textAlign: 'center', display: 'inline-block' }}>{puntos}</span>
      </div>

      <div className="panel-tablero-memoria" style={{
        marginTop: '80px',
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '16px 20px',
        borderRadius: '32px',
        border: '5px solid rgba(255,255,255,0.85)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        maxHeight: 'calc(100dvh - 95px)',
        overflowY: 'auto',
        boxSizing: 'border-box'
      }}>
        
        <h2 className="titulo-tablero-memoria" style={{ 
          color: '#334155', fontSize: '1.35rem', margin: '0 0 14px 0',
          backgroundColor: 'white', padding: '6px 20px', borderRadius: '20px',
          boxShadow: '0 4px 0 #e2e8f0'
        }}>¡Encuentra las parejas!</h2>

        <div className="grid-cartas-memoria" style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${nivel.columnas}, 1fr)`,
          gap: '10px',
          width: '90vw',
          maxWidth: '460px'
        }}>
          {baraja.map((carta, index) => {
            const estaVolteada = cartasVolteadas.includes(index)
            const estaEmparejada = parejasEncontradas.includes(carta.img)
            const tieneError = cartasError.includes(index)
            
            let clasesExtra = ''
            if (estaVolteada || estaEmparejada) clasesExtra += ' carta-volteada'
            
            let claseDorso = 'carta-cara carta-dorso'
            if (estaEmparejada) claseDorso += ' carta-acierto'
            if (tieneError) claseDorso += ' carta-error'

            return (
              <div 
                key={index} 
                className={`carta-contenedor ${clasesExtra}`}
                style={{ aspectRatio: '1/1' }} 
                onClick={() => voltearCarta(index)}
              >
                <div className="carta-inner">
                  <div className="carta-cara carta-frente">
                    <span className="icono-carta-frente" style={{ fontSize: '30px' }}>🍭</span>
                  </div>
                  
                  <div className={claseDorso}>
                    {carta.imgFailed ? (
                      <span className="fallback-carta-dorso" style={{ fontSize: '32px' }}>{carta.fallback}</span>
                    ) : (
                      <img 
                        src={carta.img} 
                        alt="Carta" 
                        style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                        draggable="false"
                        onError={() => {
                          setBaraja(prev => prev.map((c, i) => i === index ? { ...c, imgFailed: true } : c))
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
