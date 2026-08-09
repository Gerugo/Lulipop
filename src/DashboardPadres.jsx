import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

export default function DashboardPadres({ perfil, onVolver }) {
  const [progreso, setProgreso] = useState([])
  const [loading, setLoading] = useState(true)

  // 🔥 SOLUCIÓN GITHUB ACTIONS: La función está DENTRO del useEffect
  useEffect(() => {
    const cargarProgreso = async () => {
      // Protección extra: Si por algún motivo el perfil no llega, cortamos aquí
      if (!perfil?.id) return 

      setLoading(true)
      const { data, error } = await supabase
        .from('progreso_actividades')
        .select('*')
        .eq('perfil_id', perfil.id) // Aquí ya es seguro usar perfil.id

      if (error) {
        console.error("Error cargando progreso:", error)
      } else {
        setProgreso(data || [])
      }
      setLoading(false)
    }

    // Llamamos a la función
    cargarProgreso()
  }, [perfil?.id]) // La única dependencia es el ID del perfil

  // Cálculos de Gamificación (Niveles)
  const totalEstrellas = progreso.reduce((acc, curr) => acc + (curr.estrellas || 3), 0)
  const ESTRELLAS_POR_NIVEL = 30
  const nivelActual = Math.floor(totalEstrellas / ESTRELLAS_POR_NIVEL) + 1
  const estrellasNivelActual = totalEstrellas % ESTRELLAS_POR_NIVEL
  const porcentajeProgreso = (estrellasNivelActual / ESTRELLAS_POR_NIVEL) * 100

  // Racha de días jugados seguidos (cuenta hasta hoy, o hasta ayer si hoy aún no ha jugado)
  const calcularRacha = () => {
    const diasUnicos = new Set(
      progreso.filter((p) => p.created_at).map((p) => new Date(p.created_at).toDateString())
    )
    if (diasUnicos.size === 0) return 0

    let racha = 0
    const cursor = new Date()
    cursor.setHours(0, 0, 0, 0)

    if (!diasUnicos.has(cursor.toDateString())) {
      cursor.setDate(cursor.getDate() - 1)
    }
    while (diasUnicos.has(cursor.toDateString())) {
      racha++
      cursor.setDate(cursor.getDate() - 1)
    }
    return racha
  }
  const racha = calcularRacha()

  // Mapeo de nombres de actividades
  const nombresActividades = {
    'juego_numeros': { nombre: 'Contando Números', icono: '🔢', bg: '#e0f2fe' },
    'puzzles_formas': { nombre: 'Puzzles de Formas', icono: '🧩', bg: '#dcfce7' },
    'arte_creativo': { nombre: 'Taller de Arte', icono: '🎨', bg: '#f3e8ff' },
    'letras_vocabulario': { nombre: 'Vocabulario', icono: '🔤', bg: '#fef3c7' },
    'trazo_letras': { nombre: 'Trazo Guiado', icono: '✍️', bg: '#ffe4e6' },
    'juego_memoria': { nombre: 'Memoria de Parejas', icono: '🧠', bg: '#ede9fe' },
    'juego_sombras': { nombre: 'Detective de Sombras', icono: '🌒', bg: '#e0f2fe' },
    'juego_burbujas': { nombre: 'Burbujas Mágicas', icono: '🫧', bg: '#cffafe' },
    'juego_intruso': { nombre: 'El Intruso', icono: '🔎', bg: '#d1fae5' },
    'juego_cocina': { nombre: 'La Cocina de Lulipop', icono: '👨‍🍳', bg: '#ffedd5' }
  }

  return (
    <div style={{ 
      minHeight: '100vh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      position: 'absolute', top: 0, left: 0,
      boxSizing: 'border-box', padding: '25px 20px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: '"Fredoka", sans-serif',
      overflowY: 'auto', overflowX: 'hidden', zIndex: 20
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;900&display=swap');

        /* Animaciones Premium */
        .anim-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; opacity: 0; }
        @keyframes popIn { 0% { transform: translateY(20px) scale(0.9); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        
        @keyframes rotaEstrella { 100% { transform: rotate(360deg); } }
        
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }

        .btn-press { transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
        .btn-press:active { transform: translateY(6px) scale(0.95); box-shadow: 0 2px 0 var(--shadow-color) !important; }

        /* Contenedores estilo Cristal */
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(15px);
          border: 6px solid white;
          border-radius: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.1);
          width: 100%;
          box-sizing: border-box;
        }

        /* Barra de progreso animada */
        .progress-bar-fill {
          transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>

      {/* HEADER: Botón volver y Título */}
      <header style={{ 
        width: '100%', maxWidth: '700px', display: 'flex', 
        justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' 
      }}>
        <button 
          onClick={onVolver}
          className="btn-press"
          style={{ 
            '--shadow-color': '#E0E0E0',
            width: '60px', height: '60px', borderRadius: '20px',
            backgroundColor: '#FFFFFF', color: '#FF5E62', 
            border: 'none', fontSize: '26px',
            boxShadow: '0 8px 0 var(--shadow-color), 0 10px 15px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ❮
        </button>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', padding: '10px 25px', borderRadius: '25px', border: '4px solid white', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
          <h2 style={{ color: '#334155', margin: 0, fontSize: '1.6rem', fontWeight: '900' }}>Panel de Progreso 📊</h2>
        </div>
      </header>

      <div style={{ maxWidth: '700px', width: '100%', display: 'flex', flexDirection: 'column', gap: '25px', paddingBottom: '50px' }}>
        
        {/* TARJETA 1: Resumen y Nivel del Niño */}
        <div className="glass-panel anim-pop" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            
            <div style={{ 
              fontSize: '70px', background: '#F8FAFC', padding: '15px', 
              borderRadius: '30px', border: '4px solid #E2E8F0',
              boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center', alignItems: 'center'
            }}>
              <span style={{ filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.2))' }}>{perfil?.avatar || '🧒'}</span>
            </div>
            
            <div style={{ flex: 1, minWidth: '250px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', color: '#334155', fontSize: '2rem', fontWeight: '900' }}>{perfil?.nombre || 'Explorador'}</h3>
                  <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '1.1rem', fontWeight: '600' }}>
                    Explorador Nivel {nivelActual} 🚀
                  </p>
                </div>
                <div style={{ 
                  display: 'flex', alignItems: 'center', gap: '8px', 
                  backgroundColor: '#FFFBEB', border: '3px solid #FEF3C7',
                  padding: '8px 16px', borderRadius: '20px' 
                }}>
                  <span style={{ fontSize: '22px', animation: 'popIn 1s infinite alternate' }}>⭐</span>
                  <span style={{ fontWeight: '900', color: '#D97706', fontSize: '1.4rem' }}>{totalEstrellas}</span>
                </div>
              </div>

              {racha > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '8px', marginTop: '10px',
                  backgroundColor: '#FFF7ED', border: '3px solid #FED7AA',
                  padding: '6px 16px', borderRadius: '20px'
                }}>
                  <span style={{ fontSize: '20px' }}>🔥</span>
                  <span style={{ fontWeight: '900', color: '#C2410C', fontSize: '1.1rem' }}>
                    {racha} {racha === 1 ? 'día seguido' : 'días seguidos'} jugando
                  </span>
                </div>
              )}

              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: '600' }}>Progreso Nivel {nivelActual}</span>
                  <span style={{ color: '#94A3B8', fontSize: '0.95rem', fontWeight: '600' }}>{estrellasNivelActual} / {ESTRELLAS_POR_NIVEL} ⭐</span>
                </div>
                <div style={{ width: '100%', height: '16px', backgroundColor: '#F1F5F9', borderRadius: '10px', overflow: 'hidden', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                  <div 
                    className="progress-bar-fill"
                    style={{ 
                      height: '100%', width: `${porcentajeProgreso}%`, 
                      background: 'linear-gradient(90deg, #43e97b 0%, #38f9d7 100%)',
                      borderRadius: '10px'
                    }} 
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* TARJETA 2: Historial de Actividades */}
        <div className="glass-panel anim-pop delay-1" style={{ padding: '30px' }}>
          <h4 style={{ color: '#334155', fontSize: '1.5rem', marginTop: 0, marginBottom: '25px', fontWeight: '900' }}>
            Últimas Aventuras Completadas 🗺️
          </h4>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b', fontSize: '1.2rem', fontWeight: '600' }}>
              <span style={{ display: 'inline-block', animation: 'rotaEstrella 2s linear infinite' }}>⏳</span> Buscando en los archivos...
            </div>
          ) : progreso.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', backgroundColor: '#F8FAFC', borderRadius: '25px', border: '3px dashed #CBD5E1' }}>
              <span style={{ fontSize: '50px', filter: 'grayscale(1)', opacity: 0.5 }}>🎯</span>
              <p style={{ color: '#475569', fontSize: '1.2rem', margin: '15px 0 5px 0', fontWeight: '900' }}>¡El lienzo está en blanco!</p>
              <p style={{ color: '#64748b', fontSize: '1rem', margin: 0, fontWeight: '600' }}>Anima a {perfil?.nombre || 'tu peque'} a jugar para llenarlo de estrellas.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[...progreso].reverse().map((item, index) => {
                const act = nombresActividades[item.actividad_id] || { nombre: item.actividad_id, icono: '✅', bg: '#f1f5f9' }
                
                return (
                  <div key={index} className="anim-pop delay-2" style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '15px 20px', backgroundColor: '#FFFFFF', borderRadius: '25px',
                    border: '3px solid #F1F5F9', boxShadow: '0 5px 15px rgba(0,0,0,0.03)',
                    transition: 'transform 0.2s', cursor: 'default'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{ 
                        width: '50px', height: '50px', borderRadius: '15px', 
                        backgroundColor: act.bg, display: 'flex', justifyContent: 'center', 
                        alignItems: 'center', fontSize: '24px' 
                      }}>
                        {act.icono}
                      </div>
                      <span style={{ fontWeight: '900', color: '#334155', fontSize: '1.15rem' }}>
                        {act.nombre}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#F0FDF4', border: '2px solid #BBF7D0', padding: '6px 14px', borderRadius: '15px' }}>
                      <span style={{ fontSize: '16px' }}>⭐</span>
                      <span style={{ fontWeight: '900', color: '#16A34A', fontSize: '1.1rem' }}>+{item.estrellas || 3}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
