import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

export default function JuegoSombras({ perfil, onVolver }) {
  const [ronda, setRonda] = useState(1)
  const [retoActual, setRetoActual] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [estadoRespuesta, setEstadoRespuesta] = useState(null)
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const baseUrl = import.meta.env.BASE_URL
  
  const itemsDisponibles = [
    { id: 'manzana', src: `${baseUrl}assets/manzana.png`, fallback: '🍎', color: '#FF5E62' },
    { id: 'estrella', src: `${baseUrl}assets/estrella.png`, fallback: '⭐️', color: '#FFD166' },
    { id: 'globo', src: `${baseUrl}assets/globo.png`, fallback: '🎈', color: '#4facfe' },
    { id: 'pez', src: `${baseUrl}assets/pez.png`, fallback: '🐟', color: '#a18cd1' },
    { id: 'gato', src: `${baseUrl}assets/gato.png`, fallback: '🐱', color: '#FF9966' },
    { id: 'platano', src: `${baseUrl}assets/platano.png`, fallback: '🍌', color: '#FCD34D' },
    { id: 'dino', src: `${baseUrl}assets/dino.png`, fallback: '🦖', color: '#4ade80' }
  ]

  const totalRondasMaximas = 5

  useEffect(() => {
    generarNuevoReto()
  }, [])

  const generarNuevoReto = () => {
    const mezclados = [...itemsDisponibles].sort(() => 0.5 - Math.random())
    const opciones = mezclados.slice(0, 3)
    const correcto = opciones[Math.floor(Math.random() * 3)]

    setRetoActual({ correcto, opciones, titulo: '¿De quién es esta sombra?' })
  }

  const verificarRespuesta = (opcion) => {
    if (seleccionado !== null || victoria) return 
    setSeleccionado(opcion)

    if (opcion.id === retoActual.correcto.id) {
      setEstadoRespuesta('correcto')
      setMensaje('¡Lo adivinaste! 🌟')
      
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
      setMensaje('¡Esa no es! Sigue buscando 🔎')
      
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
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_sombras', completado: true, estrellas: 3 }
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
        
        .anim-flotar { animation: flotar 3s ease-in-out infinite; }
        @keyframes flotar { 0%, 100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        
        .anim-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }

        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }

        .anim-revelar { animation: revelarSombra 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes revelarSombra {
          0% { filter: brightness(0) drop-shadow(0 15px 15px rgba(0,0,0,0.4)); transform: scale(1); }
          50% { filter: brightness(1) drop-shadow(0 0px 30px #FFF); transform: scale(1.2); }
          100% { filter: brightness(1) drop-shadow(0 10px 15px rgba(0,0,0,0.2)); transform: scale(1); }
        }

        .btn-imagen-arcilla {
          width: 105px; height: 105px; border-radius: 30px; cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          border: 4px solid rgba(255,255,255,0.7); display: flex; justify-content: center; align-items: center;
          background: rgba(255, 255, 255, 0.9); box-shadow: inset 0px -8px 0px rgba(0,0,0,0.1), 0px 15px 25px rgba(0,0,0,0.15);
        }
        .btn-imagen-arcilla:active { transform: translateY(8px) scale(0.92) !important; box-shadow: 0 0 0 transparent !important; }
        .glass-panel { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(15px); border: 6px solid white; border-radius: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.15); }
      `}</style>

      <div style={{ position: 'absolute', top: '25px', left: '25px', right: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button onClick={onVolver} style={{
          width: '60px', height: '60px', borderRadius: '20px', backgroundColor: '#FFFFFF', color: '#FF5E62', 
          border: 'none', fontSize: '26px', cursor: 'pointer', boxShadow: '0 8px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>❮</button>

        {!victoria && (
          <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '15px', border: '4px solid white', borderRadius: '25px' }}>
            <span style={{ fontSize: '24px' }}>{perfil?.avatar || '👦'}</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: totalRondasMaximas }).map((_, idx) => (
                <div key={idx} style={{
                  width: '18px', height: '18px', borderRadius: '50%',
                  backgroundColor: idx < ronda - 1 ? '#43e97b' : idx === ronda - 1 ? '#FFD166' : '#E2E8F0',
                  border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transform: idx === ronda - 1 ? 'scale(1.3)' : 'scale(1)', transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {!victoria ? (
        <div className="anim-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '550px', marginTop: '30px' }}>
          
          <div className="glass-panel" style={{ padding: '40px 30px', marginBottom: '35px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
            <h2 style={{ color: '#334155', fontSize: '2rem', margin: 0, fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>{retoActual.titulo}</h2>
            <div className="anim-flotar" style={{ width: '180px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.5)', borderRadius: '50%', border: '4px dashed #CBD5E1' }}>
              <img 
                src={retoActual.correcto.src} alt="Sombra misteriosa"
                className={estadoRespuesta === 'correcto' ? 'anim-revelar' : ''}
                style={{ 
                  width: '130px', height: '130px', objectFit: 'contain',
                  filter: estadoRespuesta === 'correcto' ? 'none' : 'brightness(0) drop-shadow(0 15px 15px rgba(0,0,0,0.4))',
                  transition: 'filter 0.5s'
                }}
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
              />
              <span style={{ display: 'none', fontSize: '100px', filter: estadoRespuesta === 'correcto' ? 'none' : 'brightness(0)' }}>{retoActual.correcto.fallback}</span>
            </div>
          </div>

          <div className={estadoRespuesta === 'incorrecto' ? 'anim-shake' : ''} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {retoActual.opciones.map((opcion) => {
              const esSeleccionado = seleccionado?.id === opcion.id
              const esCorrecto = esSeleccionado && estadoRespuesta === 'correcto'
              const esIncorrecto = esSeleccionado && estadoRespuesta === 'incorrecto'

              let borderColor = 'rgba(255,255,255,0.7)'; let transform = 'scale(1)'; let bgColor = 'rgba(255, 255, 255, 0.9)';

              if (esCorrecto) { borderColor = '#43e97b'; transform = 'scale(1.1)'; bgColor = '#F0FDF4'; } 
              else if (esIncorrecto) { borderColor = '#FF6B6B'; transform = 'scale(0.95)'; bgColor = '#FEF2F2'; }

              return (
                <button 
                  key={opcion.id} className="btn-imagen-arcilla" onClick={() => verificarRespuesta(opcion)} disabled={seleccionado !== null}
                  style={{
                    borderColor: borderColor, backgroundColor: bgColor, transform: transform,
                    boxShadow: esCorrecto ? '0 0 20px rgba(67, 233, 123, 0.5), inset 0px -8px 0px rgba(0,0,0,0.05)' : 'inset 0px -8px 0px rgba(0,0,0,0.1), 0px 15px 25px rgba(0,0,0,0.15)'
                  }}
                >
                  <img src={opcion.src} alt={opcion.id} style={{ width: '65px', height: '65px', objectFit: 'contain' }} />
                </button>
              )
            })}
          </div>

          <div style={{ height: '60px', marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mensaje && (
              <div className="anim-pop" style={{ 
                backgroundColor: estadoRespuesta === 'correcto' ? '#F0FDF4' : '#FEF2F2', padding: '12px 35px', borderRadius: '30px', border: `4px solid ${estadoRespuesta === 'correcto' ? '#43e97b' : '#FF6B6B'}`,
                fontWeight: '900', fontSize: '1.4rem', color: estadoRespuesta === 'correcto' ? '#16A34A' : '#DC2626', boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                {mensaje}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(15px)', zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '120px', filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.3))' }}>🌟</div>
            <h1 style={{ color: '#FFD166', fontSize: '4.5rem', margin: '20px 0 10px 0', textShadow: '0 8px 0 #CCAC00, 0 15px 25px rgba(0,0,0,0.2)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>¡Genial!</h1>
            <p style={{ color: '#4facfe', fontSize: '1.6rem', fontWeight: '900', margin: '0 0 40px 0', backgroundColor: 'white', padding: '12px 35px', borderRadius: '35px', border: '4px solid #E0F2FE', boxShadow: '0 8px 0 #bae6fd' }}>
              ¡Eres un detective de sombras! 🕵️‍♂️
            </p>
            <button onClick={onVolver} style={{ padding: '18px 50px', fontSize: '1.8rem', fontWeight: '900', background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', color: 'white', border: '4px solid white', borderRadius: '40px', cursor: 'pointer', boxShadow: '0 10px 0 #8970ba, 0 20px 30px rgba(0,0,0,0.25)', fontFamily: '"Fredoka", sans-serif', transition: 'transform 0.1s' }} onMouseDown={e => e.currentTarget.style.transform = 'translateY(10px)'} onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}>
              {guardando ? 'Guardando... ⏳' : '¡Continuar! 🚀'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
