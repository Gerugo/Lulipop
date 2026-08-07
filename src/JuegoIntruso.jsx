import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

export default function JuegoIntruso({ perfil, onVolver }) {
  const [ronda, setRonda] = useState(1)
  const [retoActual, setRetoActual] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [estadoRespuesta, setEstadoRespuesta] = useState(null)
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const totalRondasMaximas = 5

  // Colección de retos (3 iguales y 1 diferente)
  const retosDisponibles = [
    { id: 1, comun: '🍎', intruso: '🍅', color: '#FF5E62', shadow: '#C0392B' }, // Manzanas y un tomate
    { id: 2, comun: '🐶', intruso: '🐱', color: '#FCD34D', shadow: '#CCAC00' }, // Perros y un gato
    { id: 3, comun: '🚗', intruso: '🚌', color: '#4facfe', shadow: '#005580' }, // Coches y un autobús
    { id: 4, comun: '☀️', intruso: '🌙', color: '#FFD166', shadow: '#D4A017' }, // Soles y una luna
    { id: 5, comun: '🌳', intruso: '🌻', color: '#4ade80', shadow: '#27ae60' }, // Árboles y una flor
    { id: 6, comun: '⚽️', intruso: '🏀', color: '#a18cd1', shadow: '#7052a6' }, // Pelotas de fútbol y una de basket
    { id: 7, comun: '🐟', intruso: '🐙', color: '#00d2d3', shadow: '#01a3a4' }  // Peces y un pulpo
  ]

  useEffect(() => {
    generarNuevoReto()
  }, [])

  const generarNuevoReto = () => {
    // Elegir un reto al azar
    const retoElegido = retosDisponibles[Math.floor(Math.random() * retosDisponibles.length)]
    
    // Crear array con 3 comunes y 1 intruso
    const opciones = [
      { id: 'c1', emoji: retoElegido.comun, esIntruso: false },
      { id: 'c2', emoji: retoElegido.comun, esIntruso: false },
      { id: 'c3', emoji: retoElegido.comun, esIntruso: false },
      { id: 'i1', emoji: retoElegido.intruso, esIntruso: true }
    ]
    
    // Mezclar las opciones aleatoriamente
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
        
        if (ronda < totalRondasMaximas) {
          setRonda(prev => prev + 1)
          generarNuevoReto()
        } else {
          setVictoria(true)
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
          width: clamp(100px, 30vw, 130px);
          height: clamp(100px, 30vw, 130px);
          border-radius: 30px;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          border: 4px solid rgba(255,255,255,0.7);
          display: flex; justify-content: center; align-items: center;
          font-size: clamp(50px, 15vw, 70px);
          line-height: 1; /* Previene el aplastamiento del flexbox */
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

      {/* HEADER: Botón Volver y Progreso */}
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
          <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '15px', border: '4px solid white', borderRadius: '25px' }}>
            <span style={{ fontSize: '24px' }}>{perfil?.avatar || '👦'}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: totalRondasMaximas }).map((_, idx) => (
                <div key={idx} style={{
                  width: '18px', height: '18px', borderRadius: '50%',
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
          
          <div className="glass-panel" style={{ padding: '30px', marginBottom: '30px', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#334155', fontSize: 'clamp(1.8rem, 6vw, 2.2rem)', margin: 0, fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              {retoActual.titulo}
            </h2>
          </div>

          {/* Cuadrícula 2x2 de Opciones */}
          <div className={estadoRespuesta === 'incorrecto' ? 'anim-shake' : ''} style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '20px', 
            justifyContent: 'center',
            padding: '10px'
          }}>
            {retoActual.opciones.map((opcion) => {
              const esSeleccionado = seleccionado === opcion.id
              const esCorrecto = esSeleccionado && estadoRespuesta === 'correcto'
              const esIncorrecto = esSeleccionado && estadoRespuesta === 'incorrecto'

              // Por defecto, usamos el color del reto actual
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
        /* PANTALLA DE VICTORIA ARREGLADA Y RESPONSIVE */
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
              fontSize: 'clamp(2.8rem, 10vw, 4.5rem)',
              margin: '0', 
              lineHeight: '1.1',
              textShadow: '0 8px 0 #CCAC00, 0 15px 25px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900'
            }}>¡Súper!</h1>
            
            <p style={{ 
              color: '#4facfe', fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', fontWeight: '900', margin: '0', 
              backgroundColor: 'white', padding: '15px 25px', borderRadius: '35px', 
              border: '4px solid #E0F2FE', boxShadow: '0 8px 0 #bae6fd',
              width: '100%', boxSizing: 'border-box'
            }}>
              ¡Menudo ojo de lince tienes! 🔎
            </p>
            
            <button 
              onClick={onVolver}
              style={{ 
                marginTop: '10px', padding: '15px 40px', 
                fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', fontWeight: '900',
                background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: 'white', 
                border: '4px solid white', borderRadius: '40px', cursor: 'pointer',
                boxShadow: '0 10px 0 #e67e22, 0 20px 30px rgba(0,0,0,0.25)',
                fontFamily: '"Fredoka", sans-serif', transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(10px)'}
              onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {guardando ? 'Guardando... ⏳' : '¡Continuar! 🚀'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
