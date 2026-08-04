import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function AlbumPegatinas({ perfil, onVolver }) {
  const [estrellasTotales, setEstrellasTotales] = useState(0)
  const [desbloqueadas, setDesbloqueadas] = useState([1]) // La primera viene desbloqueada por defecto
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
    cargarEstrellasYPegatinas()
  }, [])

  const cargarEstrellasYPegatinas = async () => {
    // 1. Obtener estrellas reales de Supabase
    const { data, error } = await supabase
      .from('progreso_actividades')
      .select('estrellas')
      .eq('perfil_id', perfil.id)

    if (!error && data) {
      const total = data.reduce((acc, curr) => acc + (curr.estrellas || 3), 0)
      setEstrellasTotales(total)
    }

    // 2. Obtener pegatinas desbloqueadas guardadas en localStorage del perfil
    const guardadas = JSON.parse(localStorage.getItem(`pegatinas_${perfil.id}`) || '[1]')
    setDesbloqueadas(guardadas)
  }

    const intentarDesbloquear = (pegatina) => {
    if (desbloqueadas.includes(pegatina.id)) return

    if (estrellasTotales >= pegatina.costo) {
      const nuevas = [...desbloqueadas, pegatina.id]
      setDesbloqueadas(nuevas)
      localStorage.setItem(`pegatinas_${perfil.id}`, JSON.stringify(nuevas))
      setPremioModal(pegatina)
      setTimeout(() => setPremioModal(null), 3000)
    } else {
      alert(`¡Te faltan estrellas! Necesitas ${pegatina.costo} ⭐ para desbloquear a ${pegatina.nombre}.`)
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
          width: 120px;
          height: 140px;
          border-radius: 28px;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
          border: 4px solid white;
          position: relative;
        }

        .tarjeta-pegatina:hover {
          transform: scale(1.05);
        }

        @keyframes rebotePremio {
          0%, 100% { transform: scale(0.8); }
          50% { transform: scale(1.15); }
        }
      `}</style>

      {/* Botón de volver */}
      <button 
        onClick={onVolver}
        style={{ 
          position: 'absolute', top: '25px', left: '25px', 
          width: '50px', height: '50px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#764ba2', 
          border: 'none', fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20
        }}
      >
        ❮
      </button>

      {/* Cabecera con Estrellas */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '12px 30px',
        borderRadius: '25px',
        backdropFilter: 'blur(10px)',
        marginBottom: '25px',
        border: '3px solid white',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
        marginTop: '30px'
      }}>
        <span style={{ fontSize: '32px' }}>📖✨</span>
        <div>
          <h2 style={{ color: '#333', fontSize: '1.5rem', margin: 0 }}>Álbum de Pegatinas de {perfil.nombre}</h2>
          <p style={{ color: '#666', fontSize: '1.05rem', margin: '2px 0 0 0' }}>Estrellas disponibles: <b>{estrellasTotales} ⭐</b></p>
        </div>
      </div>

      {/* Rejilla de Pegatinas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '20px', width: '100%', maxWidth: '600px', paddingBottom: '30px' }}>
        {catalogoPegatinas.map((pegatina) => {
          const desbloqueada = desbloqueadas.includes(pegatina.id)

          return (
            <div 
              key={pegatina.id}
              className="tarjeta-pegatina"
              onClick={() => intentarDesbloquear(pegatina)}
              style={{
                backgroundColor: desbloqueada ? '#FFFFFF' : '#E9ECEF',
                opacity: desbloqueada ? 1 : 0.8,
                border: desbloqueada ? '4px solid #FFD166' : '4px dashed #CED4DA'
              }}
            >
              <span style={{ fontSize: '50px', filter: desbloqueada ? 'none' : 'grayscale(100%) opacity(40%)' }}>
                {pegatina.emoji}
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#444', marginTop: '8px', textAlign: 'center', padding: '0 5px' }}>
                {pegatina.nombre}
              </span>

              {!desbloqueada && (
                <div style={{
                  position: 'absolute',
                  bottom: '8px',
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  🔒 {pegatina.costo} ⭐
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal de desbloqueo exitoso */}
      {premioModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
          backdropFilter: 'blur(5px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '35px',
            borderRadius: '35px',
            textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'rebotePremio 0.4s ease-out',
            border: '5px solid #FFD166',
            maxWidth: '320px'
          }}>
            <div style={{ fontSize: '80px', marginBottom: '10px' }}>{premioModal.emoji}</div>
            <h2 style={{ color: '#333', fontSize: '1.8rem', margin: '0 0 10px 0' }}>¡Nueva Pegatina!</h2>
            <p style={{ color: '#666', fontSize: '1.1rem', margin: 0 }}>Has desbloqueado a <b>{premioModal.nombre}</b> 🎉</p>
          </div>
        </div>
      )}

    </div>
  )
}
