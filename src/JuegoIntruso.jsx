import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import NivelSelector from './NivelSelector'
import useMejoresNiveles from './useMejoresNiveles'

// Colección de retos (varios comunes y 1 diferente)
const retosDisponibles = [
  { id: 1, comun: '🍎', intruso: '🍅', color: '#FF5E62', shadow: '#C0392B' },
  { id: 2, comun: '🐶', intruso: '🐱', color: '#FCD34D', shadow: '#CCAC00' },
  { id: 3, comun: '🚗', intruso: '🚌', color: '#4facfe', shadow: '#005580' },
  { id: 4, comun: '☀️', intruso: '🌙', color: '#FFD166', shadow: '#D4A017' },
  { id: 5, comun: '🌳', intruso: '🌻', color: '#4ade80', shadow: '#27ae60' },
  { id: 6, comun: '⚽️', intruso: '🏀', color: '#a18cd1', shadow: '#7052a6' },
  { id: 7, comun: '🐟', intruso: '🐙', color: '#00d2d3', shadow: '#01a3a4' },
]

const NIVELES = [
  { id: 'facil', nombre: 'Fácil', descripcion: '4 elementos, 1 intruso', emoji: '🌱', color: '#43e97b', sombra: '#27ae60', itemsTotal: 4, columnas: 2, rondas: 4 },
  { id: 'medio', nombre: 'Medio', descripcion: '6 elementos, 1 intruso', emoji: '🌿', color: '#4facfe', sombra: '#005580', itemsTotal: 6, columnas: 3, rondas: 5 },
  { id: 'dificil', nombre: 'Difícil', descripcion: '9 elementos, 1 intruso', emoji: '🌳', color: '#FF9966', sombra: '#D9534F', itemsTotal: 9, columnas: 3, rondas: 6 },
]

export default function JuegoIntruso({ perfil, onVolver }) {
  const [nivelId, setNivelId] = useState(null)
  const [ronda, setRonda] = useState(1)
  const [retoActual, setRetoActual] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [estadoRespuesta, setEstadoRespuesta] = useState(null)
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const { mejores, guardarMejorNivel } = useMejoresNiveles('intruso', perfil?.id)
  const nivel = NIVELES.find((n) => n.id === nivelId)

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
    const retoElegido = retosDisponibles[Math.floor(Math.random() * retosDisponibles.length)]

    const opciones = []
    for (let i = 0; i < nivel.itemsTotal - 1; i++) {
      opciones.push({ id: `c${i}`, emoji: retoElegido.comun, esIntruso: false })
    }
    opciones.push({ id: 'i1', emoji: retoElegido.intruso, esIntruso: true })

    const mezcladas = opciones.sort(() => Math.random() - 0.5)

    setRetoActual({
      ...retoElegido,
      opciones: mezcladas,
      titulo: '¡Encuentra al intruso!'
    })
  }

  const verificarRespuesta = (opcion) => {
    if (seleccionado !== null || victoria) return 
    setSeleccionado(opcion.id)

    if (opcion.esIntruso) {
      setEstadoRespuesta('correcto')
      setMensaje('¡Ojo de lince! 👁️✨')
      
      setTimeout(() => {
        setSeleccionado(null)
        setEstadoRespuesta(null)
        setMensaje('')
        
        if (ronda < nivel.rondas) {
          setRonda(prev => prev + 1)
          generarNuevoReto()
        } else {
          setVictoria(true)
          guardarMejorNivel(nivelId, 3)
          guardarProgreso()
        }
      }, 1500)
    } else {
      setEstadoRespuesta('incorrecto')
      setMensaje('¡Sigue buscando! 🔎')
      
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
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_intruso', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  if (!nivel) {
    return (
      <NivelSelector
        onVolver={onVolver}
        emojiJuego="🔎"
        titulo="El Intruso"
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
      minHeight: '100dvh', width: '100vw',
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
        
        .anim-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }

        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }

        .btn-arcilla {
          width: clamp(75px, 22vw, 110px);
          height: clamp(75px, 22vw, 110px);
          border-radius: 26px;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          border: 4px solid rgba(255,255,255,0.7);
          display: flex; justify-content: center; align-items: center;
          font-size: clamp(38px, 11vw, 55px);
          line-height: 1;
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
        <div className="anim-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '550px', marginTop: '40px' }}>
          
          <div className="glass-panel" style={{ padding: '25px', marginBottom: '25px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#334155', fontSize: 'clamp(1.6rem, 6vw, 2.1rem)', margin: 0, fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              {retoActual.titulo}
            </h2>
          </div>

          {/* Cuadrícula de Opciones (tamaño según nivel) */}
          <div className={estadoRespuesta === 'incorrecto' ? 'anim-shake' : ''} style={{ 
            display: 'grid', 
            gridTemplateColumns: `repeat(${nivel.columnas}, 1fr)`, 
            gap: '16px', 
            justifyContent: 'center',
            padding: '10px'
          }}>
            {retoActual.opciones.map((opcion) => {
              const esSeleccionado = seleccionado === opcion.id
              const esCorrecto = esSeleccionado && estadoRespuesta === 'correcto'
              const esIncorrecto = esSeleccionado && estadoRespuesta === 'incorrecto'

              let bg = retoActual.color
              let shadow = retoActual.shadow
              let transform = 'scale(1)'

              if (esCorrecto) {
                bg = '#43e97b'; shadow = '#27ae60'; transform = 'scale(1.1)';
              } else if (esIncorrecto) {
                bg = '#FF6B6B'; shadow = '#C0392B'; transform = 'scale(0.95)';
              }

              return (
                <button 
                  key={opcion.id}
                  className="btn-arcilla"
                  onClick={() => verificarRespuesta(opcion)}
                  disabled={seleccionado !== null}
                  style={{
                    backgroundColor: bg,
                    boxShadow: `inset 0px -8px 0px ${shadow}, inset 0px 4px 0px rgba(255,255,255,0.4), 0px 15px 25px rgba(0,0,0,0.2)`,
                    transform: transform
                  }}
                >
                  <span style={{ filter: 'drop-shadow(0 8px 10px rgba(0,0,0,0.2))' }}>
                    {opcion.emoji}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Feedback Visual Interactivo */}
          <div style={{ height: '60px', marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mensaje && (
              <div className="anim-pop" style={{ 
                backgroundColor: estadoRespuesta === 'correcto' ? '#F0FDF4' : '#FEF2F2', 
                padding: '12px 35px', borderRadius: '30px', border: `4px solid ${estadoRespuesta === 'correcto' ? '#43e97b' : '#FF6B6B'}`,
                fontWeight: '900', fontSize: 'clamp(1.2rem, 5vw, 1.5rem)', color: estadoRespuesta === 'correcto' ? '#16A34A' : '#DC2626',
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
          backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(15px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px', boxSizing: 'border-box', overflowY: 'auto'
        }}>
          <div className="anim-victoria" style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            gap: '20px', width: '100%', maxWidth: '400px'
          }}>
            <div className="anim-estrella" style={{ 
              fontSize: 'clamp(70px, 20vw, 120px)',
              lineHeight: '1',
              filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.3))' 
            }}>🌟</div>
            
            <h1 style={{
              color: '#FFD166', 
              fontSize: 'clamp(2.4rem, 9vw, 4rem)',
              margin: '0', 
              lineHeight: '1.1',
              textShadow: '0 8px 0 #CCAC00, 0 15px 25px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900'
            }}>¡Súper!</h1>
            
            <p style={{ 
              color: '#4facfe', fontSize: 'clamp(1.1rem, 4.5vw, 1.6rem)', fontWeight: '900', margin: '0', 
              backgroundColor: 'white', padding: '15px 25px', borderRadius: '35px', 
              border: '4px solid #E0F2FE', boxShadow: '0 8px 0 #bae6fd',
              width: '100%', boxSizing: 'border-box'
            }}>
              ¡Nivel {nivel.nombre} completado! 🔎
            </p>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                onClick={() => setNivelId(null)}
                style={{ 
                  padding: '14px 28px', fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', fontWeight: '900',
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
                  padding: '14px 28px', 
                  fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', fontWeight: '900',
                  background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: 'white', 
                  border: '4px solid white', borderRadius: '40px', cursor: 'pointer',
                  boxShadow: '0 10px 0 #e67e22, 0 20px 30px rgba(0,0,0,0.25)',
                  fontFamily: '"Fredoka", sans-serif', transition: 'transform 0.1s'
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
