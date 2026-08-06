import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

export default function JuegoLetras({ perfil, onVolver }) {
  const [nivel, setNivel] = useState(0)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [estadoRespuesta, setEstadoRespuesta] = useState(null) // 'correcto' | 'incorrecto'
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const palabras = [
    { letra: 'A', palabra: 'Avión', emoji: '✈️', opciones: ['A', 'E', 'O'], color: '#FF5E62' },
    { letra: 'E', palabra: 'Elefante', emoji: '🐘', opciones: ['I', 'E', 'U'], color: '#4facfe' },
    { letra: 'I', palabra: 'Iglú', emoji: '❄️', opciones: ['A', 'I', 'O'], color: '#FFD166' },
    { letra: 'O', palabra: 'Oso', emoji: '🐻', opciones: ['O', 'E', 'A'], color: '#FF9966' },
    { letra: 'U', palabra: 'Uvas', emoji: '🍇', opciones: ['U', 'I', 'E'], color: '#a18cd1' }
  ]

  const coloresBotones = [
    { bg: '#FF5E62', shadow: '#C0392B', text: '#FFFFFF' },
    { bg: '#4facfe', shadow: '#005580', text: '#FFFFFF' },
    { bg: '#FFD166', shadow: '#CCAC00', text: '#7A5C00' },
  ]

  const actual = palabras[nivel]

  const verificar = (letraElegida) => {
    if (seleccionado) return // Evitar múltiples clics rápidos
    setSeleccionado(letraElegida)
    
    if (letraElegida === actual.letra) {
      setEstadoRespuesta('correcto')
      setMensaje('¡Súper! 🌟')
      
      setTimeout(() => {
        setSeleccionado(null)
        setEstadoRespuesta(null)
        setMensaje('')
        
        if (nivel + 1 < palabras.length) {
          setNivel(prev => prev + 1)
        } else {
          setVictoria(true)
          guardarProgreso()
        }
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
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'letras_vocabulario', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

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
        
        .anim-flotar { animation: flotar 3s ease-in-out infinite; }
        @keyframes flotar {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
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
          width: 100px; height: 100px;
          border-radius: 30px;
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

        /* Glassmorphism panel */
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

        {/* Indicador de progreso con el avatar del niño */}
        {!victoria && (
          <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '15px', border: '4px solid white', borderRadius: '25px' }}>
            <span style={{ fontSize: '24px' }}>{perfil?.avatar || '👦'}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {palabras.map((_, idx) => (
                <div key={idx} style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  backgroundColor: idx < nivel ? '#43e97b' : idx === nivel ? '#FFD166' : '#E2E8F0',
                  border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transform: idx === nivel ? 'scale(1.3)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {!victoria ? (
        <div className="anim-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '550px', marginTop: '40px' }}>
          
          {/* Tarjeta de Pregunta */}
          <div className="glass-panel" style={{
            padding: '35px 40px',
            marginBottom: '35px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div className="anim-flotar" style={{ 
              fontSize: '100px', 
              filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.2))',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%', padding: '20px'
            }}>
              {actual.emoji}
            </div>
            <h2 style={{ color: '#334155', fontSize: '2.2rem', margin: 0, fontWeight: '900', lineHeight: '1.2' }}>
              ¿Con qué letra empieza <br/>
              <span style={{ color: actual.color, fontSize: '2.8rem', textShadow: '0 4px 0 rgba(0,0,0,0.1)' }}>{actual.palabra}</span>?
            </h2>
          </div>

          {/* Opciones de letras (Botones Arcilla 3D) */}
          <div className={estadoRespuesta === 'incorrecto' ? 'anim-shake' : ''} style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {actual.opciones.map((letra, idx) => {
              const estiloColor = coloresBotones[idx % coloresBotones.length]
              const esSeleccionado = seleccionado === letra
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
                  key={letra}
                  className="btn-arcilla"
                  onClick={() => verificar(letra)}
                  disabled={seleccionado !== null}
                  style={{
                    backgroundColor: bg,
                    color: estiloColor.text,
                    boxShadow: `inset 0px -8px 0px ${shadow}, inset 0px 4px 0px rgba(255,255,255,0.4), 0px 15px 25px rgba(0,0,0,0.2)`,
                    transform: transform
                  }}
                >
                  {letra}
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
              color: '#4facfe', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 40px 0', 
              backgroundColor: 'white', padding: '12px 35px', borderRadius: '35px', 
              border: '4px solid #E0F2FE', boxShadow: '0 8px 0 #bae6fd' 
            }}>
              ¡Reto de letras completado!
            </p>
            
            <button 
              onClick={onVolver}
              style={{ 
                padding: '18px 50px', fontSize: '1.8rem', fontWeight: '900',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', 
                border: '4px solid white', borderRadius: '40px', cursor: 'pointer',
                boxShadow: '0 10px 0 #27ae60, 0 20px 30px rgba(0,0,0,0.25)',
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
