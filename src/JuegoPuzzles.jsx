import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png' // Mismo fondo de la app

export default function JuegoPuzzles({ perfil, onVolver }) {
  // Rutas seguras para GitHub Pages
  const baseUrl = import.meta.env.BASE_URL

  // Usamos los iconos del juego de memoria adaptados a piezas de puzzle
  const formasOriginales = [
    { id: 'dino', nombre: 'Dino', src: `${baseUrl}assets/dino.png`, color: '#43e97b', sombra: '#27ae60' },
    { id: 'gato', nombre: 'Gato', src: `${baseUrl}assets/gato.png`, color: '#FFD166', sombra: '#CCAC00' },
    { id: 'globo', nombre: 'Globo', src: `${baseUrl}assets/globo.png`, color: '#4facfe', sombra: '#005580' },
    { id: 'manzana', nombre: 'Manzana', src: `${baseUrl}assets/manzana.png`, color: '#FF5E62', sombra: '#C0392B' }
  ]

  const [seleccionado, setSeleccionado] = useState(null)
  const [completados, setCompletados] = useState([])
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Barajamos las siluetas de destino solo una vez al inicio
  const [siluetas, setSiluetas] = useState([])

  useEffect(() => {
    iniciarJuego()
  }, [])

  const iniciarJuego = () => {
    setSiluetas([...formasOriginales].sort(() => Math.random() - 0.5))
    setSeleccionado(null)
    setCompletados([])
    setVictoria(false)
  }

  const manejarClickForma = (forma) => {
    if (completados.includes(forma.id)) return
    
    // Si toca la misma que ya estaba seleccionada, la deselecciona
    if (seleccionado?.id === forma.id) {
      setSeleccionado(null)
    } else {
      setSeleccionado(forma)
    }
  }

  const manejarClickSilueta = (silueta) => {
    if (!seleccionado || completados.includes(silueta.id)) return

    if (seleccionado.id === silueta.id) {
      // ¡ACIERTO!
      const nuevosCompletados = [...completados, silueta.id]
      setCompletados(nuevosCompletados)
      setSeleccionado(null)

      if (nuevosCompletados.length === formasOriginales.length) {
        setTimeout(() => {
          setVictoria(true)
          guardarProgreso()
        }, 500)
      }
    } else {
      // ¡FALLO! Animación de temblor
      const el = document.getElementById(`silueta-${silueta.id}`)
      if (el) {
        el.classList.add('error-shake')
        setTimeout(() => el.classList.remove('error-shake'), 400)
      }
      setSeleccionado(null)
    }
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
    <div style={{ 
      minHeight: '100vh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', 
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;900&display=swap');

        /* Botones superiores */
        .pieza-3d {
          width: 100px;
          height: 100px;
          border-radius: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          border: 4px solid rgba(255,255,255,0.8);
        }
        .pieza-3d img { width: 70%; height: 70%; object-fit: contain; pointer-events: none; }

        /* Siluetas de destino */
        .silueta-box {
          width: 110px;
          height: 110px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          background: rgba(255,255,255,0.4);
          border: 4px dashed rgba(255,255,255,0.7);
        }
        
        /* Imagen negra pura para hacer de silueta */
        .img-silueta {
          width: 65%; height: 65%; object-fit: contain; pointer-events: none;
          filter: brightness(0) opacity(0.2);
          transition: all 0.3s ease;
        }

        /* Cuando la silueta se rellena */
        .silueta-completada {
          background-color: white !important;
          border-style: solid !important;
          animation: aciertoPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .silueta-completada .img-silueta {
          filter: none; /* Recupera el color original */
          width: 80%; height: 80%;
        }

        /* Animaciones */
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

        /* Pantalla Victoria */
        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .anim-estrella { animation: rotaEstrella 3s linear infinite; }
        @keyframes rotaEstrella { 100% { transform: rotate(360deg); } }
        
        /* Animación de pieza seleccionada flotando */
        .flotando { animation: flotar 1.5s ease-in-out infinite alternate; }
        @keyframes flotar { 0% { transform: translateY(-8px) scale(1.1); } 100% { transform: translateY(-15px) scale(1.1); } }
      `}</style>

      {/* BOTONES SUPERIORES */}
      <div style={{ 
        position: 'absolute', top: '25px', left: '20px', right: '20px', 
        display: 'flex', justifyContent: 'space-between', zIndex: 50 
      }}>
        <button onClick={onVolver} style={{
          width: '55px', height: '55px', borderRadius: '18px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
          fontSize: '24px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>❮</button>

        <button onClick={iniciarJuego} style={{
          height: '55px', padding: '0 20px', borderRadius: '18px',
          backgroundColor: '#FFFFFF', color: '#333', border: 'none', 
          fontSize: '22px', fontWeight: '900', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center'
        }}>🧹</button>
      </div>

      {/* PANTALLA DE VICTORIA */}
      {victoria && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '100px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}>🌟</div>
            <h1 style={{
              color: '#FFD166', fontSize: '4.5rem', margin: '10px 0',
              textShadow: '0 6px 0 #CCAC00, 0 10px 20px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '2px'
            }}>¡Súper!</h1>
            <p style={{ color: '#4facfe', fontSize: '1.8rem', fontWeight: '900', margin: 0, backgroundColor: 'white', padding: '10px 30px', borderRadius: '30px', boxShadow: '0 5px 0 #cbd5e1' }}>
              {guardando ? 'Guardando...' : '¡Puzzle superado!'}
            </p>
            <button onClick={iniciarJuego} style={{
              marginTop: '30px', backgroundColor: '#43e97b', color: 'white', border: 'none',
              padding: '15px 40px', borderRadius: '30px', fontSize: '1.5rem', fontWeight: '900',
              cursor: 'pointer', boxShadow: '0 8px 0 #27ae60'
            }}>Jugar de nuevo</button>
          </div>
        </div>
      )}

      {/* ZONA PRINCIPAL DE JUEGO */}
      {!victoria && (
        <div style={{ 
          marginTop: '110px', display: 'flex', flexDirection: 'column', 
          alignItems: 'center', width: '100%', maxWidth: '600px' 
        }}>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: '12px 30px', borderRadius: '30px', backdropFilter: 'blur(10px)',
            marginBottom: '40px', border: '4px solid white',
            boxShadow: '0 15px 30px rgba(0,0,0,0.1)', textAlign: 'center'
          }}>
            <h2 style={{ color: '#475569', fontSize: '1.6rem', margin: 0, fontWeight: '900' }}>
              Toca una ficha y ponla en su sombra 👇
            </h2>
          </div>

          {/* FICHAS PARA SELECCIONAR (ARRIBA) */}
          <div style={{ 
            display: 'flex', gap: '15px', marginBottom: '50px', 
            justifyContent: 'center', flexWrap: 'wrap' 
          }}>
            {formasOriginales.map((forma) => {
              const estaUsada = completados.includes(forma.id)
              const estaSeleccionadoEste = seleccionado?.id === forma.id

              // Si ya se ha colocado, dejamos un hueco vacío
              if (estaUsada) return <div key={forma.id} style={{ width: '100px', height: '100px', opacity: 0.1 }} />

              return (
                <div 
                  key={forma.id}
                  className={`pieza-3d ${estaSeleccionadoEste ? 'flotando' : ''}`}
                  onClick={() => manejarClickForma(forma)}
                  style={{
                    backgroundColor: forma.color,
                    boxShadow: estaSeleccionadoEste 
                      ? `0 15px 25px rgba(0,0,0,0.3), 0 0 0 5px white, 0 15px 0 ${forma.sombra}`
                      : `0 8px 0 ${forma.sombra}, 0 10px 15px rgba(0,0,0,0.1)`,
                    border: estaSeleccionadoEste ? 'none' : '4px solid rgba(255,255,255,0.7)',
                    zIndex: estaSeleccionadoEste ? 10 : 1
                  }}
                >
                  <img src={forma.src} alt={forma.nombre} onError={(e) => e.target.style.display = 'none'} />
                </div>
              )
            })}
          </div>

          {/* SILUETAS DE DESTINO (ABAJO) */}
          <div style={{ 
            display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '20px', justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.3)', padding: '25px',
            borderRadius: '40px', border: '6px solid rgba(255,255,255,0.5)'
          }}>
            {siluetas.map((silueta) => {
              const estaCompletado = completados.includes(silueta.id)
              const esObjetivoActual = seleccionado?.id === silueta.id

              return (
                <div 
                  key={silueta.id}
                  id={`silueta-${silueta.id}`}
                  className={`silueta-box ${estaCompletado ? 'silueta-completada' : ''}`}
                  onClick={() => manejarClickSilueta(silueta)}
                  style={{
                    borderColor: estaCompletado ? silueta.color : (esObjetivoActual ? '#FFF' : 'rgba(255, 255, 255, 0.7)'),
                    boxShadow: estaCompletado ? `0px 8px 0px ${silueta.sombra}` : 'inset 0 5px 15px rgba(0,0,0,0.1)'
                  }}
                >
                  <img 
                    src={silueta.src} 
                    alt="Silueta" 
                    className="img-silueta"
                  />
                </div>
              )
            })}
          </div>

        </div>
      )}
    </div>
  )
}
