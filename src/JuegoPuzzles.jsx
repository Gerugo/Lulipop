import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

export default function JuegoPuzzles({ perfil, onVolver }) {
  const baseUrl = import.meta.env.BASE_URL

  const formasOriginales = [
    { id: 'dino', nombre: 'Dino', src: `${baseUrl}assets/dino.png`, color: '#43e97b', sombra: '#27ae60' },
    { id: 'gato', nombre: 'Gato', src: `${baseUrl}assets/gato.png`, color: '#FFD166', sombra: '#CCAC00' },
    { id: 'globo', nombre: 'Globo', src: `${baseUrl}assets/globo.png`, color: '#4facfe', sombra: '#005580' },
    { id: 'manzana', nombre: 'Manzana', src: `${baseUrl}assets/manzana.png`, color: '#FF5E62', sombra: '#C0392B' }
  ]

  const [completados, setCompletados] = useState([])
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [siluetas, setSiluetas] = useState([])

  // Estados para el arrastre (Drag & Drop nativo táctil/mouse)
  const [piezaArrastrada, setPiezaArrastrada] = useState(null)
  const [posicion, setPosicion] = useState({ x: 0, y: 0 })
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    iniciarJuego()
  }, [])

  const iniciarJuego = () => {
    setSiluetas([...formasOriginales].sort(() => Math.random() - 0.5))
    setCompletados([])
    setVictoria(false)
    setPiezaArrastrada(null)
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
        // ¡ACIERTO!
        const nuevosCompletados = [...completados, piezaArrastrada.id]
        setCompletados(nuevosCompletados)

        if (nuevosCompletados.length === formasOriginales.length) {
          setTimeout(() => {
            setVictoria(true)
            guardarProgreso()
          }, 400)
        }
      } else {
        // ¡FALLO!
        siluetaTarget.classList.add('error-shake')
        setTimeout(() => siluetaTarget.classList.remove('error-shake'), 400)
      }
    }
    setPiezaArrastrada(null)
  }

  const guardarProgreso = async () => {
    setGuardando(true)
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
    setGuardando(false)
  }

  return (
    <div 
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ 
        minHeight: '100dvh', /* Ajustado para App Nativa */
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
        .anim-estrella { animation: rotaEstrella 3s linear infinite; }
        @keyframes rotaEstrella { 100% { transform: rotate(360deg); } }
      `}</style>

      {piezaArrastrada && (
        <div style={{
          position: 'fixed', left: posicion.x - offset.x, top: posicion.y - offset.y,
          width: '100px', height: '100px', backgroundColor: piezaArrastrada.color,
          borderRadius: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 25px 35px rgba(0,0,0,0.3), 0 12px 0 ${piezaArrastrada.sombra}`,
          border: '4px solid white', pointerEvents: 'none', zIndex: 1000,
          transform: 'scale(1.15) translateY(-10px)'
        }}>
          <img src={piezaArrastrada.src} alt={piezaArrastrada.nombre} style={{ width: '70%', height: '70%', objectFit: 'contain' }} />
        </div>
      )}

      <div style={{ position: 'absolute', top: '25px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 50 }}>
        <button onClick={onVolver} style={{
          width: '55px', height: '55px', borderRadius: '18px', backgroundColor: '#FFFFFF', color: '#FF5E62', 
          border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>❮</button>

        <button onClick={iniciarJuego} style={{
          height: '55px', padding: '0 20px', borderRadius: '18px', backgroundColor: '#FFFFFF', color: '#333', 
          border: 'none', fontSize: '22px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center'
        }}>🧹</button>
      </div>

      {victoria && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '100px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}>🌟</div>
            <h1 style={{ color: '#FFD166', fontSize: '4.5rem', margin: '10px 0', textShadow: '0 6px 0 #CCAC00, 0 10px 20px rgba(0,0,0,0.2)', textTransform: 'uppercase', letterSpacing: '2px' }}>¡Súper!</h1>
            <p style={{ color: '#4facfe', fontSize: '1.8rem', fontWeight: '900', margin: 0, backgroundColor: 'white', padding: '10px 30px', borderRadius: '30px', boxShadow: '0 5px 0 #cbd5e1' }}>
              {guardando ? 'Guardando...' : '¡Puzzle superado!'}
            </p>
            <button onClick={onVolver} style={{
              marginTop: '30px', backgroundColor: '#43e97b', color: 'white', border: 'none',
              padding: '15px 40px', borderRadius: '30px', fontSize: '1.5rem', fontWeight: '900',
              cursor: 'pointer', boxShadow: '0 8px 0 #27ae60'
            }}>¡Continuar! 🚀</button>
          </div>
        </div>
      )}

      {!victoria && (
        <div style={{ marginTop: '110px', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '12px 30px', borderRadius: '30px', 
            backdropFilter: 'blur(10px)', marginBottom: '40px', border: '4px solid white',
            boxShadow: '0 15px 30px rgba(0,0,0,0.1)', textAlign: 'center'
          }}>
            <h2 style={{ color: '#475569', fontSize: '1.6rem', margin: 0, fontWeight: '900' }}>
              ¡Arrastra cada figura a su sombra! 🧩
            </h2>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '50px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {formasOriginales.map((forma) => {
              const estaUsada = completados.includes(forma.id)
              const estaSiendoArrastrada = piezaArrastrada?.id === forma.id

              if (estaUsada) return <div key={forma.id} style={{ width: '100px', height: '100px', opacity: 0.1 }} />

              return (
                <div 
                  key={forma.id}
                  className="pieza-3d"
                  onPointerDown={(e) => handlePointerDown(e, forma)}
                  style={{
                    backgroundColor: forma.color,
                    boxShadow: `0 8px 0 ${forma.sombra}, 0 10px 15px rgba(0,0,0,0.1)`,
                    opacity: estaSiendoArrastrada ? 0.3 : 1,
                  }}
                >
                  <img src={forma.src} alt={forma.nombre} draggable="false" />
                </div>
              )
            })}
          </div>

          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.3)', padding: '25px', borderRadius: '40px', border: '6px solid rgba(255,255,255,0.5)'
          }}>
            {siluetas.map((silueta) => {
              const estaCompletado = completados.includes(silueta.id)
              return (
                <div 
                  key={silueta.id} data-id={silueta.id} id={`silueta-${silueta.id}`}
                  className={`silueta-box ${estaCompletado ? 'silueta-completada' : ''}`}
                  style={{
                    borderColor: estaCompletado ? silueta.color : 'rgba(255, 255, 255, 0.7)',
                    boxShadow: estaCompletado ? `0px 8px 0px ${silueta.sombra}` : 'inset 0 5px 15px rgba(0,0,0,0.1)'
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
