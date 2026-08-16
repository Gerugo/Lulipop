import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function AlbumPegatinas({ perfil, onVolver, onSeleccionarParaPegar }) {
  const [estrellasTotales, setEstrellasTotales] = useState(0)
  const [desbloqueadas, setDesbloqueadas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`pegatinas_${perfil?.id}`) || '[1]')
    } catch {
      return [1]
    }
  })
  const [premioModal, setPremioModal] = useState(null)

  const catalogoPegatinas = [
    { id: 1, emoji: '🦄', nombre: 'Unicornio Mágico', costo: 0 },
    { id: 2, emoji: '🦖', nombre: 'Dino Amigo', costo: 3 },
    { id: 3, emoji: '🚀', nombre: 'Cohete Espacial', costo: 6 },
    { id: 4, emoji: '👑', nombre: 'Corona Real', costo: 9 },
    { id: 5, emoji: '🌈', nombre: 'Arcoíris Feliz', costo: 12 },
    { id: 6, emoji: '🏰', nombre: 'Castillo Lulipop', costo: 15 },
    { id: 7, emoji: '🤖', nombre: 'Robotin Amigo', costo: 18 },
    { id: 8, emoji: '🌟', nombre: 'Super Estrella', costo: 25 }
  ]

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      if (!perfil?.id) return

      const { data, error } = await supabase
        .from('progreso_actividades')
        .select('estrellas')
        .eq('perfil_id', perfil.id)

      if (!cancelado && !error && data) {
        const total = data.reduce((acc, curr) => acc + (curr.estrellas || 3), 0)
        setEstrellasTotales(total)
      }

      if (!cancelado) {
        try {
          const guardadas = JSON.parse(localStorage.getItem(`pegatinas_${perfil.id}`) || '[1]')
          setDesbloqueadas(guardadas)
        } catch {
          setDesbloqueadas([1])
        }
      }
    }
    cargar()
    return () => { cancelado = true }
  }, [perfil?.id])

  const manejarClickPegatina = (pegatina) => {
    const desbloqueada = desbloqueadas.includes(pegatina.id)

    if (desbloqueada) {
      if (onSeleccionarParaPegar) {
        onSeleccionarParaPegar(pegatina.emoji)
      }
    } else {
      if (estrellasTotales >= pegatina.costo) {
        const nuevas = [...desbloqueadas, pegatina.id]
        setDesbloqueadas(nuevas)
        if (perfil?.id) {
          try {
            localStorage.setItem(`pegatinas_${perfil.id}`, JSON.stringify(nuevas))
          } catch { /* continuar */ }
        }
        setPremioModal(pegatina)
        setTimeout(() => setPremioModal(null), 3000)
      } else {
        alert(`¡Te faltan estrellas! Necesitas ${pegatina.costo} ⭐ para desbloquear a ${pegatina.nombre}.`)
      }
    }
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      background: 'radial-gradient(circle at 50% 50%, #fbc2eb 0%, #a6c1ee 100%)',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute',
      top: 0, left: 0, zIndex: 10,
      overflowY: 'auto',
      userSelect: 'none',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        .tarjeta-pegatina {
          width: 120px; height: 140px; border-radius: 28px; background: white;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          cursor: pointer; transition: transform 0.2s; box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          border: 4px solid white; position: relative;
        }
        .tarjeta-pegatina:hover { transform: scale(1.05); }

        @media (max-height: 550px) {
          .btn-volver-album {
            top: 10px !important;
            left: 10px !important;
            width: 40px !important;
            height: 40px !important;
            font-size: 18px !important;
            border-radius: 12px !important;
          }
          .badge-cabecera-album {
            margin-top: 8px !important;
            margin-bottom: 12px !important;
            padding: 6px 16px !important;
            border-radius: 18px !important;
          }
          .badge-cabecera-album h2 {
            font-size: 1.15rem !important;
          }
          .badge-cabecera-album p {
            font-size: 0.8rem !important;
          }
          .grid-catalogo-album {
            grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)) !important;
            gap: 10px !important;
          }
          .tarjeta-pegatina {
            width: 92px !important;
            height: 105px !important;
            border-radius: 18px !important;
          }
          .emoji-pegatina-txt {
            font-size: 34px !important;
          }
        }
      `}</style>

      <button 
        onClick={onVolver}
        className="btn-volver-album"
        style={{ 
          position: 'absolute', top: '25px', left: '25px', 
          width: '50px', height: '50px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#764ba2', 
          border: 'none', fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}
      >
        ❮
      </button>

      <div className="badge-cabecera-album" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '12px 30px', borderRadius: '25px', backdropFilter: 'blur(10px)',
        marginBottom: '25px', border: '3px solid white', display: 'flex',
        alignItems: 'center', gap: '15px', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', marginTop: '30px'
      }}>
        <span style={{ fontSize: '32px' }}>📖✨</span>
        <div>
          <h2 style={{ color: '#333', fontSize: '1.5rem', margin: 0 }}>Álbum de Pegatinas</h2>
          <p style={{ color: '#666', fontSize: '0.95rem', margin: '2px 0 0 0' }}>Toca una pegatina desbloqueada para ponerla en el mundo ⭐: <b>{estrellasTotales}</b></p>
        </div>
      </div>

      <div className="grid-catalogo-album" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '20px', width: '100%', maxWidth: '600px', paddingBottom: '30px' }}>
        {catalogoPegatinas.map((pegatina) => {
          const desbloqueada = desbloqueadas.includes(pegatina.id)

          return (
            <div 
              key={pegatina.id}
              className="tarjeta-pegatina"
              onClick={() => manejarClickPegatina(pegatina)}
              style={{
                backgroundColor: desbloqueada ? '#FFFFFF' : '#E9ECEF',
                border: desbloqueada ? '4px solid #FFD166' : '4px dashed #CED4DA'
              }}
            >
              <span style={{ fontSize: '50px', filter: desbloqueada ? 'none' : 'grayscale(100%) opacity(40%)' }}>
                {pegatina.emoji}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#444', marginTop: '8px', textAlign: 'center', padding: '0 5px' }}>
                {pegatina.nombre}
              </span>

              {desbloqueada ? (
                <div style={{ position: 'absolute', bottom: '6px', backgroundColor: '#00CC66', color: 'white', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: '700' }}>
                  ✨ ¡Colocar!
                </div>
              ) : (
                <div style={{ position: 'absolute', bottom: '6px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '600' }}>
                  🔒 {pegatina.costo} ⭐
                </div>
              )}
            </div>
          )
        })}
      </div>

      {premioModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(5px)' }}>
          <div style={{ backgroundColor: 'white', padding: '35px', borderRadius: '35px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '5px solid #FFD166', maxWidth: '320px' }}>
            <div style={{ fontSize: '80px', marginBottom: '10px' }}>{premioModal.emoji}</div>
            <h2 style={{ color: '#333', fontSize: '1.8rem', margin: '0 0 10px 0' }}>¡Nueva Pegatina!</h2>
            <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>Has desbloqueado a <b>{premioModal.nombre}</b> 🎉</p>
          </div>
        </div>
      )}

    </div>
  )
}
