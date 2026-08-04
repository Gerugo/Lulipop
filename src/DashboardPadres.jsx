import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

export default function DashboardPadres({ perfil, onVolver }) {
  const [progreso, setProgreso] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    cargarProgreso()
  }, [])

  const cargarProgreso = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('progreso_actividades')
      .select('*')
      .eq('perfil_id', perfil.id)

    if (error) {
      console.error("Error cargando progreso:", error)
    } else {
      setProgreso(data || [])
    }
    setLoading(false)
  }

  // Calcular total de estrellas
  const totalEstrellas = progreso.reduce((acc, curr) => acc + (curr.estrellas || 3), 0)

  // Mapeo de nombres de actividades para mostrar bonitos
  const nombresActividades = {
    'juego_numeros': '🔢 Contando Números',
    'puzzles_formas': '🧩 Puzzles de Formas',
    'arte_creativo': '🎨 Taller de Arte',
    'letras_vocabulario': '🔤 Vocabulario y Letras',
    'trazo_letras': '✍️ Trazo Guiado'
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'absolute',
      top: 0, left: 0,
      boxSizing: 'border-box',
      padding: '30px 20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: '"Fredoka", sans-serif',
      overflowY: 'auto',
      zIndex: 20
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap');
      `}</style>

      {/* Botón superior de volver */}
      <div style={{ width: '100%', maxWidth: '650px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button 
          onClick={onVolver}
          style={{ 
            width: '50px', height: '50px', borderRadius: '16px',
            backgroundColor: '#FFFFFF', color: '#FF5E62', 
            border: 'none', fontSize: '20px', cursor: 'pointer',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ❮
        </button>
        <h2 style={{ color: 'white', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Panel de Control Parental 📊</h2>
      </div>

      <div style={{ maxWidth: '650px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
        
        {/* Tarjeta de Resumen del Niño */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.92)', 
          padding: '25px 30px', 
          borderRadius: '30px', 
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '4px solid white',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{ fontSize: '65px', background: '#F0F2F5', padding: '10px 20px', borderRadius: '22px' }}>
            {perfil.avatar}
          </div>
          <div>
            <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.6rem' }}>{perfil.nombre}</h3>
            <p style={{ margin: '0 0 10px 0', color: '#666', fontSize: '1.05rem' }}>{perfil.edad} años • Explorador activo 🚀</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#FFF3CD', padding: '6px 14px', borderRadius: '14px', width: 'fit-content' }}>
              <span style={{ fontSize: '20px' }}>⭐</span>
              <span style={{ fontWeight: '700', color: '#856404', fontSize: '1.1rem' }}>{totalEstrellas} Estrellas Conseguidas</span>
            </div>
          </div>
        </div>

        {/* Listado de Actividades Completadas */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.92)', 
          padding: '25px 30px', 
          borderRadius: '30px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '4px solid white',
          backdropFilter: 'blur(10px)'
        }}>
          <h4 style={{ color: '#333', fontSize: '1.3rem', marginTop: 0, marginBottom: '20px' }}>Historial de Actividades Recientes</h4>

          {loading ? (
            <p style={{ color: '#666' }}>Cargando progreso...</p>
          ) : progreso.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: '#666', fontSize: '1.1rem', margin: '0 0 10px 0' }}>Aún no hay actividades completadas.</p>
              <p style={{ color: '#888', fontSize: '0.95rem', margin: 0 }}>¡Anima a {perfil.nombre} a jugar en Mundo Lulipop para ganar estrellas!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {progreso.map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  backgroundColor: '#F8F9FA',
                  borderRadius: '16px',
                  border: '2px solid #E9ECEF'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '24px' }}>✅</span>
                    <span style={{ fontWeight: '600', color: '#333', fontSize: '1.05rem' }}>
                      {nombresActividades[item.actividad_id] || item.actividad_id}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#E2F0D9', padding: '4px 10px', borderRadius: '12px' }}>
                    <span>⭐</span>
                    <span style={{ fontWeight: '700', color: '#385723' }}>+{item.estrellas || 3}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
