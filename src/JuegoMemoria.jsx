import { useState } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import NivelSelector from './NivelSelector'
import useMejoresNiveles from './useMejoresNiveles'

const NIVELES = [
  { 
    id: 'facil', 
    nombre: 'Fácil', 
    descripcion: '4 parejas (8 cartas)', 
    emoji: '🌱', 
    color: '#43e97b', 
    sombra: '#27ae60', 
    numParejas: 4, 
    colsLand: 4, 
    colsPort: 4 
  },
  { 
    id: 'medio', 
    nombre: 'Medio', 
    descripcion: '6 parejas (12 cartas)', 
    emoji: '🌿', 
    color: '#4facfe', 
    sombra: '#005580', 
    numParejas: 6, 
    colsLand: 6, 
    colsPort: 3 
  },
  { 
    id: 'dificil', 
    nombre: 'Difícil', 
    descripcion: '7 parejas (14 cartas)', 
    emoji: '🌳', 
    color: '#FF9966', 
    sombra: '#D9534F', 
    numParejas: 7, 
    colsLand: 7, 
    colsPort: 4 
  },
]

const IMAGENES_CARTAS = [
  { src: `${import.meta.env.BASE_URL}assets/dino.png`, fallback: '🦖' },
  { src: `${import.meta.env.BASE_URL}assets/estrella.png`, fallback: '⭐' },
  { src: `${import.meta.env.BASE_URL}assets/gato.png`, fallback: '🐱' },
  { src: `${import.meta.env.BASE_URL}assets/globo.png`, fallback: '🎈' },
  { src: `${import.meta.env.BASE_URL}assets/manzana.png`, fallback: '🍎' },
  { src: `${import.meta.env.BASE_URL}assets/pez.png`, fallback: '🐟' },
  { src: `${import.meta.env.BASE_URL}assets/platano.png`, fallback: '🍌' },
  { src: `${import.meta.env.BASE_URL}assets/cohete.png`, fallback: '🚀' },
  { src: `${import.meta.env.BASE_URL}assets/alien.png`, fallback: '👽' },
  { src: `${import.meta.env.BASE_URL}assets/icono-musica.png`, fallback: '🎹' },
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
        }, 550)
      } else {
        updateScore(-2) 
        setErroresRonda(prev => prev + 1)
        setCartasError([...nuevasVolteadas]) 
        
        setTimeout(() => {
          setCartasVolteadas([])
          setCartasError([])
          setBloqueado(false)
        }, 900) 
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
    <div className="juego-memoria-raiz" style={{
      height: '100dvh', minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px', boxSizing: 'border-box', userSelect: 'none'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');
        
        .carta-contenedor {
          perspective: 1000px;
          cursor: pointer;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .carta-inner {
          position: relative;
          width: 100%;
          height: 100%;
          aspect-ratio: 1 / 1;
          max-width: clamp(70px, 18vw, 150px);
          max-height: clamp(70px, 35vh, 150px);
          transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
          margin: auto;
        }
        .carta-volteada .carta-inner {
          transform: rotateY(180deg);
        }
        
        .carta-cara {
          position: absolute;
          width: 100%; height: 100%;
          backface-visibility: hidden;
          border-radius: 22px;
          box-shadow: 0 8px 16px rgba(0,0,0,0.15), 0 3px 0 rgba(0,0,0,0.1);
          display: flex; justify-content: center; align-items: center;
          border: 4px solid white;
          box-sizing: border-box;
          transition: transform 0.15s;
        }
        .carta-contenedor:active .carta-cara {
          transform: scale(0.96);
        }
        
        .carta-frente {
          background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
          border: 4px solid white;
          box-shadow: inset 0 3px 0 rgba(255,255,255,0.8), 0 8px 18px rgba(92, 124, 250, 0.25);
        }
        
        .carta-dorso {
          background-color: #FFFFFF;
          transform: rotateY(180deg);
          box-shadow: inset 0 0 10px rgba(0,0,0,0.05), 0 8px 18px rgba(0,0,0,0.12);
        }

        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        
        .anim-estrella { animation: rotaEstrella 3s linear infinite; }
        @keyframes rotaEstrella { 100% { transform: rotate(360deg); } }

        .carta-acierto { 
          animation: aciertoPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; 
          box-shadow: 0 0 25px 4px #FFD166, 0 6px 12px rgba(0,0,0,0.15) !important; 
          border-color: #FFD166 !important; 
        }
        @keyframes aciertoPop { 0% { transform: scale(1); } 50% { transform: scale(1.12); } 100% { transform: scale(1); } }

        .carta-error { animation: temblor 0.4s ease-in-out; border-color: #FF6B6B !important; }
        @keyframes temblor {
          0%, 100% { transform: rotateY(180deg) translateX(0); }
          25% { transform: rotateY(180deg) translateX(-8px) rotate(-3deg); }
          75% { transform: rotateY(180deg) translateX(8px) rotate(3deg); }
        }

        /* GRID DINÁMICO DISTRIBUIDO */
        .tablero-memoria-grid {
          display: grid;
          width: 100%;
          max-width: 1050px;
          height: 100%;
          gap: clamp(8px, 1.8vw, 18px);
          align-content: center;
          justify-content: center;
          box-sizing: border-box;
          padding: 6px;
        }

        /* ORIENTACIÓN HORIZONTAL (Móviles apaisados y Desktop) */
        @media (orientation: landscape), (max-height: 550px) {
          .juego-memoria-raiz {
            padding: 8px 14px !important;
          }
          .btn-header-memoria {
            width: 42px !important;
            height: 42px !important;
            font-size: 18px !important;
            border-radius: 12px !important;
          }
          .marcador-memoria {
            padding: 4px 16px !important;
            font-size: 1.1rem !important;
            border-radius: 18px !important;
          }
          .grid-cols-facil { grid-template-columns: repeat(4, 1fr) !important; }
          .grid-cols-medio { grid-template-columns: repeat(6, 1fr) !important; }
          .grid-cols-dificil { grid-template-columns: repeat(7, 1fr) !important; }
          
          .carta-inner {
            max-height: clamp(65px, 38vh, 120px) !important;
            max-width: clamp(65px, 38vh, 120px) !important;
          }
          .icono-carta-frente { font-size: 26px !important; }
        }

        /* ORIENTACIÓN VERTICAL (Móviles verticales) */
        @media (orientation: portrait) and (min-height: 551px) {
          .grid-cols-facil { grid-template-columns: repeat(4, 1fr) !important; }
          .grid-cols-medio { grid-template-columns: repeat(3, 1fr) !important; }
          .grid-cols-dificil { grid-template-columns: repeat(4, 1fr) !important; }

          .carta-inner {
            max-height: clamp(75px, 18vh, 140px) !important;
            max-width: clamp(75px, 22vw, 140px) !important;
          }
        }
      `}</style>

      {nivelSuperado && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box'
        }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', maxWidth: '380px' }}>
            <div className="anim-estrella" style={{ fontSize: '80px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}>🌟</div>
            <h1 style={{
              color: '#FFD166', fontSize: 'clamp(2.2rem, 7vw, 3.5rem)', margin: '8px 0',
              textShadow: '0 5px 0 #CCAC00, 0 8px 16px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900'
            }}>¡Súper!</h1>
            <p style={{ color: '#4facfe', fontSize: '1.2rem', fontWeight: '900', margin: '0 0 16px 0', backgroundColor: 'white', padding: '8px 24px', borderRadius: '25px', boxShadow: '0 4px 0 #cbd5e1' }}>
              ¡Nivel {nivel.nombre} completado!
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => setNivelId(null)} style={{
                backgroundColor: '#FFD166', color: '#7A5C00', border: 'none',
                padding: '12px 24px', borderRadius: '25px', fontSize: '1.1rem', fontWeight: '900',
                cursor: 'pointer', boxShadow: '0 6px 0 #CCAC00', fontFamily: '"Fredoka", sans-serif'
              }}>🔁 Otro nivel</button>
              <button onClick={onVolver} style={{
                backgroundColor: '#43e97b', color: 'white', border: 'none',
                padding: '12px 24px', borderRadius: '25px', fontSize: '1.1rem', fontWeight: '900',
                cursor: 'pointer', boxShadow: '0 6px 0 #27ae60', fontFamily: '"Fredoka", sans-serif'
              }}>{guardando ? 'Guardando...' : '¡Continuar! 🚀'}</button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER DE NAVEGACIÓN */}
      <div style={{ 
        width: '100%', maxWidth: '1050px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 50 
      }}>
        <button onClick={handleBack} className="btn-header-memoria" style={{
          width: '52px', height: '52px', borderRadius: '18px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
          fontSize: '22px', cursor: 'pointer',
          boxShadow: '0 5px 0 #E0E0E0, 0 8px 12px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>❮</button>

        <div className="marcador-memoria" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '6px 22px',
          borderRadius: '25px', border: '3px solid white',
          boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center',
          gap: '8px', fontSize: '1.25rem', fontWeight: '900'
        }}>
          <span>{nivel.emoji}</span>
          <span style={{ color: '#FFD166', textShadow: '0 2px 0 #CCAC00', minWidth: '45px', textAlign: 'center' }}>⭐ {puntos}</span>
        </div>

        <button onClick={() => iniciarJuego()} className="btn-header-memoria" title="Reiniciar ronda" style={{
          width: '52px', height: '52px', borderRadius: '18px',
          backgroundColor: '#FFFFFF', color: '#333', border: 'none', 
          fontSize: '22px', fontWeight: '900', cursor: 'pointer',
          boxShadow: '0 5px 0 #E0E0E0, 0 8px 12px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>🧹</button>
      </div>

      {/* ÁREA DE JUEGO: TABLERO DISTRIBUIDO A PANTALLA COMPLETA */}
      <div style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 0,
        zIndex: 20
      }}>
        <div className={`tablero-memoria-grid grid-cols-${nivel.id}`}>
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
                onClick={() => voltearCarta(index)}
              >
                <div className="carta-inner">
                  <div className="carta-cara carta-frente">
                    <span className="icono-carta-frente" style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>🍭</span>
                  </div>
                  
                  <div className={claseDorso}>
                    {carta.imgFailed ? (
                      <span className="fallback-carta-dorso" style={{ fontSize: '38px' }}>{carta.fallback}</span>
                    ) : (
                      <img 
                        src={carta.img} 
                        alt="Carta" 
                        style={{ width: '70%', height: '70%', objectFit: 'contain' }}
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
