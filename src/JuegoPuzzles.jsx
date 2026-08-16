import { useState } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import NivelSelector from './NivelSelector'
import useMejoresNiveles from './useMejoresNiveles'

const NIVELES = [
  { id: 'facil', nombre: 'Fácil', descripcion: '3 figuras, con pista de color', emoji: '🌱', color: '#43e97b', sombra: '#27ae60', numPiezas: 3, pistaColor: true },
  { id: 'medio', nombre: 'Medio', descripcion: '4 figuras, con pista de color', emoji: '🌿', color: '#4facfe', sombra: '#005580', numPiezas: 4, pistaColor: true },
  { id: 'dificil', nombre: 'Difícil', descripcion: '4 figuras, sin pistas', emoji: '🌳', color: '#FF9966', sombra: '#D9534F', numPiezas: 4, pistaColor: false },
]

const formasBase = [
  { id: 'dino', nombre: 'Dino', src: `${import.meta.env.BASE_URL}assets/dino.png`, color: '#43e97b', sombra: '#27ae60' },
  { id: 'gato', nombre: 'Gato', src: `${import.meta.env.BASE_URL}assets/gato.png`, color: '#FFD166', sombra: '#CCAC00' },
  { id: 'globo', nombre: 'Globo', src: `${import.meta.env.BASE_URL}assets/globo.png`, color: '#4facfe', sombra: '#005580' },
  { id: 'manzana', nombre: 'Manzana', src: `${import.meta.env.BASE_URL}assets/manzana.png`, color: '#FF5E62', sombra: '#C0392B' }
]

export default function JuegoPuzzles({ perfil, onVolver }) {
  const [nivelId, setNivelId] = useState(null)
  const [formasOriginales, setFormasOriginales] = useState([])
  const [completados, setCompletados] = useState([])
  const [victoria, setVictoria] = useState(false)
  const [siluetas, setSiluetas] = useState([])

  const [piezaArrastrada, setPiezaArrastrada] = useState(null)
  const [posicion, setPosicion] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const { mejores, guardarMejorNivel } = useMejoresNiveles('puzzles', perfil?.id)
  const nivel = NIVELES.find((n) => n.id === nivelId)

  const iniciarJuego = (nivelActivo = nivel) => {
    if (!nivelActivo) return
    const piezasNivel = [...formasBase].sort(() => Math.random() - 0.5).slice(0, nivelActivo.numPiezas)
    setFormasOriginales(piezasNivel)
    setSiluetas([...piezasNivel].sort(() => Math.random() - 0.5))
    setCompletados([])
    setVictoria(false)
    setPiezaArrastrada(null)
  }

  const empezarNivel = (id) => {
    const n = NIVELES.find((x) => x.id === id)
    setNivelId(id)
    iniciarJuego(n)
  }

  const guardarProgreso = async () => {
    if (!perfil?.id) return
    const { error } = await supabase
      .from('progreso_actividades')
      .insert([
        {
          perfil_id: perfil?.id,
          padre_id: perfil?.padre_id,
          actividad_id: 'puzzles_formas',
          completado: true,
          estrellas: 3
        }
      ])
    if (error) console.error("Error guardando progreso:", error)
  }

  const handlePointerDown = (e, forma) => {
    if (completados.includes(forma.id) || victoria) return
    e.preventDefault()

    const rect = e.currentTarget.getBoundingClientRect()
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
    setPiezaArrastrada(forma)
    setPosicion({ x: e.clientX, y: e.clientY })
  }

  const handlePointerMove = (e) => {
    if (!piezaArrastrada) return
    e.preventDefault()
    setPosicion({ x: e.clientX, y: e.clientY })
  }

  const handlePointerUp = (e) => {
    if (!piezaArrastrada) return
    e.preventDefault()

    const elementoDebajo = document.elementFromPoint(e.clientX, e.clientY)
    const siluetaTarget = elementoDebajo?.closest('.silueta-box')

    if (siluetaTarget) {
      const targetId = siluetaTarget.getAttribute('data-id')

      if (targetId === piezaArrastrada.id) {
        const nuevosCompletados = [...completados, piezaArrastrada.id]
        setCompletados(nuevosCompletados)

        if (nuevosCompletados.length === formasOriginales.length) {
          setTimeout(() => {
            setVictoria(true)
            guardarMejorNivel(nivelId, 3)
            guardarProgreso()
          }, 400)
        }
      } else {
        siluetaTarget.classList.add('error-shake')
        setTimeout(() => siluetaTarget.classList.remove('error-shake'), 400)
      }
    }
    setPiezaArrastrada(null)
  }


  if (!nivel) {
    return (
      <NivelSelector
        onVolver={onVolver}
        emojiJuego="🧩"
        titulo="Puzzles de Formas"
        subtitulo="Elige tu reto"
        niveles={NIVELES}
        mejores={mejores}
        onSeleccionar={empezarNivel}
      />
    )
  }

  return (
    <div 
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ 
        minHeight: '100dvh',
        width: '100vw',
        backgroundImage: `url(${fondoImg})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', 
        fontFamily: '"Fredoka", sans-serif',
        position: 'absolute', top: 0, left: 0, zIndex: 10,
        overflow: 'hidden', userSelect: 'none', padding: '20px',
        boxSizing: 'border-box',
        touchAction: 'none'
      }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;900&display=swap');

        .pieza-3d {
          width: 100px; height: 100px; border-radius: 25px;
          display: flex; align-items: center; justify-content: center;
          cursor: grab; transition: transform 0.1s ease;
          border: 4px solid rgba(255,255,255,0.8); touch-action: none;
        }
        .pieza-3d:active { cursor: grabbing; }
        .pieza-3d img { width: 70%; height: 70%; object-fit: contain; pointer-events: none; }

        .silueta-box {
          width: 110px; height: 110px; border-radius: 30px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.4); border: 4px dashed rgba(255,255,255,0.7);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .img-silueta {
          width: 65%; height: 65%; object-fit: contain; pointer-events: none;
          filter: brightness(0) opacity(0.2); transition: all 0.3s ease;
        }

        .silueta-completada {
          background-color: white !important; border-style: solid !important;
          animation: aciertoPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .silueta-completada .img-silueta { filter: none; width: 80%; height: 80%; }

        .error-shake { animation: wobble 0.4s ease-in-out; }
        @keyframes wobble {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px) rotate(-5deg); }
          75% { transform: translateX(8px) rotate(5deg); }
        }

        @keyframes aciertoPop { 
          0% { transform: scale(1); } 
          50% { transform: scale(1.15); box-shadow: 0 0 20px rgba(255, 255, 255, 0.8); } 
          100% { transform: scale(1); } 
        }

        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .btn-header-puzzles {
          width: 55px; height: 55px; border-radius: 18px; backgroundColor: #FFFFFF; color: #FF5E62; 
          border: none; font-size: 24px; cursor: pointer; boxShadow: 0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
        }

        .panel-reto-puzzles {
          background-color: rgba(255, 255, 255, 0.85);
          padding: 8px 24px;
          border-radius: 24px; 
          backdrop-filter: blur(10px);
          margin-bottom: 16px;
          border: 4px solid white;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          text-align: center;
        }

        @media (max-height: 550px) {
          .btn-header-puzzles {
            width: 42px !important;
            height: 42px !important;
            font-size: 18px !important;
            border-radius: 12px !important;
          }
          .header-barra-puzzles {
            top: 10px !important;
            left: 12px !important;
            right: 12px !important;
          }
          .area-juego-puzzles {
            margin-top: 48px !important;
            max-width: 600px !important;
          }
          .panel-reto-puzzles {
            padding: 4px 16px !important;
            margin-bottom: 8px !important;
            border-radius: 16px !important;
          }
          .titulo-puzzles-txt {
            font-size: 1.1rem !important;
          }
          .pieza-3d {
            width: 60px !important;
            height: 60px !important;
            border-radius: 16px !important;
          }
          .contenedor-piezas-puzzles {
            gap: 10px !important;
            margin-bottom: 8px !important;
          }
          .grid-siluetas-puzzles {
            gap: 10px !important;
            padding: 10px !important;
            border-radius: 24px !important;
          }
          .silueta-box {
            width: 64px !important;
            height: 64px !important;
            border-radius: 18px !important;
          }
        }
      `}</style>

      {piezaArrastrada && (
        <div style={{
          position: 'fixed', left: posicion.x - offset.x, top: posicion.y - offset.y,
          width: '75px', height: '75px', backgroundColor: piezaArrastrada.color,
          borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 20px 30px rgba(0,0,0,0.3), 0 8px 0 ${piezaArrastrada.sombra}`,
          border: '3px solid white', pointerEvents: 'none', zIndex: 1000,
          transform: 'scale(1.15) translateY(-6px)'
        }}>
          <img src={piezaArrastrada.src} alt={piezaArrastrada.nombre} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
        </div>
      )}

      <div className="header-barra-puzzles" style={{ position: 'absolute', top: '18px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 50 }}>
        <button 
          onClick={nivelId ? () => setNivelId(null) : onVolver} 
          className="btn-header-puzzles"
        >
          ❮
        </button>

        <div style={{
          height: '48px', padding: '0 16px', borderRadius: '16px', backgroundColor: 'rgba(255,255,255,0.9)',
          display: 'flex', alignItems: 'center', gap: '8px', fontSize: '20px', fontWeight: '900',
          boxShadow: '0 5px 0 #E0E0E0, 0 8px 12px rgba(0,0,0,0.12)'
        }}>{nivel.emoji}</div>

        <button 
          onClick={iniciarJuego} 
          className="btn-header-puzzles" 
          style={{ color: '#333', fontSize: '20px' }}
        >
          🧹
        </button>
      </div>

      {victoria && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px', boxSizing: 'border-box'
        }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '80px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}>🌟</div>
            <h1 style={{ color: '#FFD166', fontSize: 'clamp(2.2rem, 7vw, 4rem)', margin: '8px 0', textShadow: '0 5px 0 #CCAC00, 0 8px 16px rgba(0,0,0,0.2)', textTransform: 'uppercase', letterSpacing: '2px' }}>¡Súper!</h1>
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
              }}>¡Continuar! 🚀</button>
            </div>
          </div>
        </div>
      )}

      {!victoria && (
        <div className="area-juego-puzzles" style={{ marginTop: '75px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
          <div className="panel-reto-puzzles">
            <h2 className="titulo-puzzles-txt" style={{ color: '#475569', fontSize: '1.35rem', margin: 0, fontWeight: '900' }}>
              ¡Arrastra cada figura a su sombra! 🧩
            </h2>
          </div>

          <div className="contenedor-piezas-puzzles" style={{ display: 'flex', gap: '12px', marginBottom: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {formasOriginales.map((forma) => {
              const estaUsada = completados.includes(forma.id)
              const estaSiendoArrastrada = piezaArrastrada?.id === forma.id

              if (estaUsada) return <div key={forma.id} className="pieza-3d" style={{ opacity: 0.1 }} />

              return (
                <div 
                  key={forma.id}
                  className="pieza-3d"
                  onPointerDown={(e) => handlePointerDown(e, forma)}
                  style={{
                    backgroundColor: forma.color,
                    boxShadow: `0 6px 0 ${forma.sombra}, 0 8px 12px rgba(0,0,0,0.1)`,
                    opacity: estaSiendoArrastrada ? 0.3 : 1,
                  }}
                >
                  <img src={forma.src} alt={forma.nombre} draggable="false" />
                </div>
              )
            })}
          </div>

          <div className="grid-siluetas-puzzles" style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.4)', padding: '16px', borderRadius: '32px', border: '5px solid rgba(255,255,255,0.6)'
          }}>
            {siluetas.map((silueta) => {
              const estaCompletado = completados.includes(silueta.id)
              const colorPista = nivel.pistaColor ? silueta.color : '#94a3b8'
              const sombraPista = nivel.pistaColor ? silueta.sombra : '#64748b'
              return (
                <div 
                  key={silueta.id} data-id={silueta.id} id={`silueta-${silueta.id}`}
                  className={`silueta-box ${estaCompletado ? 'silueta-completada' : ''}`}
                  style={{
                    borderColor: estaCompletado ? colorPista : 'rgba(255, 255, 255, 0.7)',
                    boxShadow: estaCompletado ? `0px 6px 0px ${sombraPista}` : 'inset 0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  <img src={silueta.src} alt="Silueta" className="img-silueta" draggable="false" />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
