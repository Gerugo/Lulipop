import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import NivelSelector from './NivelSelector'
import useMejoresNiveles from './useMejoresNiveles'

const NIVELES = [
  { id: 'facil', nombre: 'Fácil', descripcion: 'Cuenta del 1 al 5', emoji: '🌱', color: '#43e97b', sombra: '#27ae60', rangoMax: 5, numOpciones: 3, rondas: 5 },
  { id: 'medio', nombre: 'Medio', descripcion: 'Cuenta del 1 al 10', emoji: '🌿', color: '#4facfe', sombra: '#005580', rangoMax: 10, numOpciones: 3, rondas: 6 },
  { id: 'dificil', nombre: 'Difícil', descripcion: 'Cuenta del 1 al 15', emoji: '🌳', color: '#FF9966', sombra: '#D9534F', rangoMax: 15, numOpciones: 4, rondas: 7 },
]

export default function JuegoNumeros({ perfil, onVolver }) {
  const [nivelId, setNivelId] = useState(null)
  const [ronda, setRonda] = useState(1)
  const [retoActual, setRetoActual] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [estadoRespuesta, setEstadoRespuesta] = useState(null) // 'correcto' | 'incorrecto'
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const { mejores, guardarMejorNivel } = useMejoresNiveles('numeros', perfil?.id)
  const nivel = NIVELES.find((n) => n.id === nivelId)

  const baseUrl = import.meta.env.BASE_URL
  const itemsDisponibles = [
    { id: 'manzana', src: `${baseUrl}assets/manzana.png`, fallback: '🍎' },
    { id: 'estrella', src: `${baseUrl}assets/estrella.png`, fallback: '⭐️' },
    { id: 'globo', src: `${baseUrl}assets/globo.png`, fallback: '🎈' },
    { id: 'pez', src: `${baseUrl}assets/pez.png`, fallback: '🐟' },
    { id: 'gato', src: `${baseUrl}assets/gato.png`, fallback: '🐱' },
    { id: 'platano', src: `${baseUrl}assets/platano.png`, fallback: '🍌' },
    { id: 'dino', src: `${baseUrl}assets/dino.png`, fallback: '🦖' }
  ]

  const coloresBotones = [
    { bg: '#FF5E62', shadow: '#C0392B', text: '#FFFFFF' },
    { bg: '#4facfe', shadow: '#005580', text: '#FFFFFF' },
    { bg: '#FFD166', shadow: '#CCAC00', text: '#7A5C00' },
    { bg: '#a18cd1', shadow: '#6b4c9a', text: '#FFFFFF' },
  ]

  useEffect(() => {
    if (nivel) generarNuevoReto()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivelId])

  const empezarNivel = (id) => {
    setNivelId(id)
    setRonda(1)
    setVictoria(false)
  }

  const generarNuevoReto = () => {
    const cantidad = Math.floor(Math.random() * nivel.rangoMax) + 1
    const itemAleatorio = itemsDisponibles[Math.floor(Math.random() * itemsDisponibles.length)]

    const opcionesSet = new Set([cantidad])
    while (opcionesSet.size < nivel.numOpciones) {
      const aleatorio = Math.floor(Math.random() * nivel.rangoMax) + 1
      opcionesSet.add(aleatorio)
    }
    const opciones = Array.from(opcionesSet).sort(() => Math.random() - 0.5)

    setRetoActual({
      cantidad,
      item: itemAleatorio,
      opciones,
      correcto: cantidad,
      titulo: '¿Cuántos hay?'
    })
  }

  const verificarRespuesta = (opcion) => {
    if (seleccionado !== null || victoria) return
    setSeleccionado(opcion)

    if (opcion === retoActual.correcto) {
      setEstadoRespuesta('correcto')
      setMensaje('¡Súper! 🌟')

      setTimeout(() => {
        setSeleccionado(null)
        setEstadoRespuesta(null)
        setMensaje('')

        setRonda(prevRonda => {
          const siguienteRonda = prevRonda + 1
          if (siguienteRonda <= nivel.rondas) {
            generarNuevoReto()
            return siguienteRonda
          } else {
            setVictoria(true)
            guardarMejorNivel(nivelId, 3)
            guardarProgreso()
            return prevRonda
          }
        })
      }, 1200)
    } else {
      setEstadoRespuesta('incorrecto')
      setMensaje('¡Casi! Inténtalo de nuevo 💪')

      setTimeout(() => {
        setSeleccionado(null)
        setEstadoRespuesta(null)
        setMensaje('')
      }, 1000)
    }
  }

  const guardarProgreso = async () => {
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_numeros', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  if (!nivel) {
    return (
      <NivelSelector
        onVolver={onVolver}
        emojiJuego="🔢"
        titulo="Contando Números"
        subtitulo="Elige tu reto"
        niveles={NIVELES}
        mejores={mejores}
        onSeleccionar={empezarNivel}
      />
    )
  }

  if (!retoActual) return null

  return (
    <div style={{ 
      minHeight: '100vh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', padding: '20px', boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');
        
        .anim-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        
        @keyframes flotarElemento {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(4deg); }
        }
        
        .anim-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }

        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .anim-estrella { animation: rotaEstrella 3s linear infinite; }
        @keyframes rotaEstrella { 100% { transform: rotate(360deg); } }

        .btn-arcilla {
          width: 90px; height: 90px;
          border-radius: 28px;
          font-size: 3rem;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          border: 4px solid rgba(255,255,255,0.5);
          display: flex; justify-content: center; align-items: center;
        }
        .btn-arcilla:active {
          transform: translateY(8px) scale(0.92) !important;
          box-shadow: 0 0 0 transparent !important;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(15px);
          border: 6px solid white;
          border-radius: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .grafico-juego {
          width: 65px;
          height: 65px;
          object-fit: contain;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
          animation: flotarElemento 3s ease-in-out infinite;
        }
      `}</style>

      {/* HEADER: Botón Volver, Nivel y Progreso */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', right: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button 
          onClick={onVolver}
          style={{ 
            width: '60px', height: '60px', borderRadius: '20px',
            backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
            fontSize: '26px', cursor: 'pointer',
            boxShadow: '0 8px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ❮
        </button>

        {/* Indicador de progreso con el avatar del niño */}
        {!victoria && (
          <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '4px solid white', borderRadius: '25px' }}>
            <span style={{ fontSize: '20px', backgroundColor: nivel.color, borderRadius: '10px', padding: '4px 8px' }}>{nivel.emoji}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: nivel.rondas }).map((_, idx) => (
                <div key={idx} style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  backgroundColor: idx < ronda - 1 ? '#43e97b' : idx === ronda - 1 ? '#FFD166' : '#E2E8F0',
                  border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transform: idx === ronda - 1 ? 'scale(1.3)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {!victoria ? (
        <div className="anim-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '550px', marginTop: '30px' }}>
          
          {/* Tarjeta del Reto */}
          <div className="glass-panel" style={{
            padding: '25px 30px',
            marginBottom: '30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <h2 style={{ color: '#334155', fontSize: '2.2rem', margin: 0, fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              {retoActual.titulo}
            </h2>

            {/* Lienzo central con imágenes dinámicas */}
            <div style={{
              width: '100%',
              minHeight: '180px',
              backgroundColor: 'rgba(255, 255, 255, 0.5)',
              borderRadius: '25px',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              padding: '20px',
              boxSizing: 'border-box',
              border: '3px dashed #CBD5E1',
              marginTop: '10px'
            }}>
              {Array.from({ length: retoActual.cantidad }).map((_, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img 
                    src={retoActual.item.src} 
                    alt={retoActual.item.id}
                    className="grafico-juego"
                    style={{ animationDelay: `${i * 0.15}s` }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextSibling.style.display = 'block';
                    }}
                  />
                  <span 
                    style={{ 
                      display: 'none', 
                      fontSize: '55px', 
                      filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))',
                      animation: `flotarElemento 3s ease-in-out infinite`,
                      animationDelay: `${i * 0.15}s`
                    }}
                  >
                    {retoActual.item.fallback}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Opciones de números (Botones Arcilla 3D) */}
          <div className={estadoRespuesta === 'incorrecto' ? 'anim-shake' : ''} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {retoActual.opciones.map((opcion, idx) => {
              const estiloColor = coloresBotones[idx % coloresBotones.length]
              const esSeleccionado = seleccionado === opcion
              const esCorrecto = esSeleccionado && estadoRespuesta === 'correcto'
              const esIncorrecto = esSeleccionado && estadoRespuesta === 'incorrecto'

              let bg = estiloColor.bg
              let shadow = estiloColor.shadow
              let transform = 'scale(1)'

              if (esCorrecto) {
                bg = '#43e97b'; shadow = '#27ae60'; transform = 'scale(1.1)';
              } else if (esIncorrecto) {
                bg = '#FF6B6B'; shadow = '#C0392B'; transform = 'scale(0.95)';
              }

              return (
                <button 
                  key={opcion}
                  className="btn-arcilla"
                  onClick={() => verificarRespuesta(opcion)}
                  disabled={seleccionado !== null}
                  style={{
                    backgroundColor: bg,
                    color: estiloColor.text,
                    boxShadow: `inset 0px -8px 0px ${shadow}, inset 0px 4px 0px rgba(255,255,255,0.4), 0px 15px 25px rgba(0,0,0,0.2)`,
                    transform: transform
                  }}
                >
                  {opcion}
                </button>
              )
            })}
          </div>

          {/* Feedback Visual Interactivo */}
          <div style={{ height: '60px', marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mensaje && (
              <div className="anim-pop" style={{ 
                backgroundColor: estadoRespuesta === 'correcto' ? '#F0FDF4' : '#FEF2F2', 
                padding: '12px 35px', borderRadius: '30px', border: `4px solid ${estadoRespuesta === 'correcto' ? '#43e97b' : '#FF6B6B'}`,
                fontWeight: '900', fontSize: '1.5rem', color: estadoRespuesta === 'correcto' ? '#16A34A' : '#DC2626',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                {mensaje}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* PANTALLA DE VICTORIA */
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(15px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '120px', filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.3))' }}>🌟</div>
            <h1 style={{
              color: '#FFD166', fontSize: '5rem', margin: '20px 0 10px 0',
              textShadow: '0 8px 0 #CCAC00, 0 15px 25px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '900'
            }}>¡Súper!</h1>
            <p style={{ 
              color: '#4facfe', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 30px 0', 
              backgroundColor: 'white', padding: '12px 35px', borderRadius: '35px', 
              border: '4px solid #E0F2FE', boxShadow: '0 8px 0 #bae6fd' 
            }}>
              ¡Nivel {nivel.nombre} completado!
            </p>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                onClick={() => setNivelId(null)}
                style={{ 
                  padding: '16px 35px', fontSize: '1.4rem', fontWeight: '900',
                  background: 'linear-gradient(135deg, #FFD166 0%, #FFB347 100%)', color: '#7A5C00', 
                  border: '4px solid white', borderRadius: '35px', cursor: 'pointer',
                  boxShadow: '0 8px 0 #CCAC00, 0 16px 25px rgba(0,0,0,0.2)',
                  fontFamily: '"Fredoka", sans-serif'
                }}
              >
                🔁 Otro nivel
              </button>
              <button 
                onClick={onVolver}
                style={{ 
                  padding: '16px 35px', fontSize: '1.4rem', fontWeight: '900',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', 
                  border: '4px solid white', borderRadius: '35px', cursor: 'pointer',
                  boxShadow: '0 8px 0 #27ae60, 0 16px 25px rgba(0,0,0,0.2)',
                  fontFamily: '"Fredoka", sans-serif'
                }}
              >
                {guardando ? 'Guardando... ⏳' : '¡Continuar! 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
