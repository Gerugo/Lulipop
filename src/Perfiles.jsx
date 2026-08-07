import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import logoImg from './Logosinfondo.png'
import DashboardPadres from './DashboardPadres'

export default function Perfiles({ session, onSeleccionarPerfil }) {
  const [perfiles, setPerfiles] = useState([])
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  const [perfilEstadisticas, setPerfilEstadisticas] = useState(null)
  
  // NUEVO: Estado para controlar si vemos el formulario o no
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  
  const avataresDisponibles = ['👦', '👧', '🦊', '🐱', '🦖', '🦄']
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(avataresDisponibles[0])

  useEffect(() => {
    obtenerPerfiles()
  }, [])

  const obtenerPerfiles = async () => {
    const { data, error } = await supabase
      .from('perfiles_ninos')
      .select('*')
      .eq('padre_id', session.user.id)

    if (error) {
      console.error("Error cargando perfiles:", error)
    } else {
      setPerfiles(data)
    }
  }

  const crearPerfil = async (e) => {
    e.preventDefault()
    const { error } = await supabase
      .from('perfiles_ninos')
      .insert([{ padre_id: session.user.id, nombre, edad: parseInt(edad), avatar: avatarSeleccionado }])

    if (error) {
      alert("Error: " + error.message)
    } else {
      setNombre('')
      setEdad('')
      setMostrarFormulario(false) // NUEVO: Ocultamos el formulario al terminar de crear
      obtenerPerfiles()
    }
  }

  if (perfilEstadisticas) {
    return <DashboardPadres perfil={perfilEstadisticas} onVolver={() => setPerfilEstadisticas(null)} />
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
      overflowY: 'auto'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700;900&display=swap');
        
        .input-moderno {
          padding: 14px 18px;
          border-radius: 16px;
          border: 2px solid #E0E0E0;
          font-family: 'Fredoka', sans-serif;
          font-size: 1.1rem;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
          background-color: #4A4A4A; /* Ajustado al tono oscuro de tu captura */
          color: white;
        }
        .input-moderno::placeholder {
          color: #A0A0A0;
        }
        .input-moderno:focus {
          border-color: #8E2DE2;
        }

        .anim-fade-in { animation: fadeIn 0.4s ease-out forwards; }
        @keyframes fadeIn { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* CABECERA: Logotipo + Botón cerrar sesión */}
      <div style={{ width: '100%', maxWidth: '650px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', zIndex: 10 }}>
        <img 
          src={logoImg} 
          alt="LuliPop Logo" 
          style={{ width: '150px', height: 'auto', filter: 'drop-shadow(0 3px 5px rgba(0,0,0,0.15))' }} 
        />
        
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ 
            padding: '12px 20px', 
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: 'none',
            borderRadius: '16px',
            fontWeight: '700',
            color: '#FF5E62',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.1)',
            fontFamily: '"Fredoka", sans-serif'
          }}
        >
          Cerrar Sesión 🚪
        </button>
      </div>

      <div style={{ maxWidth: '650px', width: '100%', zIndex: 10, paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
        
        {/* 1. SECCIÓN PRINCIPAL: LISTADO DE PERFILES (Ahora va arriba) */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.95)', 
          padding: '25px 30px', 
          borderRadius: '35px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '4px solid white',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: '#334155', fontSize: '1.6rem', marginBottom: '8px', marginTop: 0, fontWeight: '900', textAlign: 'center' }}>¿Quién va a jugar hoy?</h3>
          <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '25px', textAlign: 'center', fontWeight: '500' }}>
            Toca el avatar para entrar a jugar, o pulsa el botón de abajo para ver el progreso.
          </p>
          
          {perfiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#F8FAFC', borderRadius: '20px', border: '3px dashed #CBD5E1' }}>
              <span style={{ fontSize: '40px' }}>👋</span>
              <p style={{ color: '#475569', fontWeight: '700', margin: '10px 0 0 0' }}>¡Aún no hay perfiles creados!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {perfiles.map((perfil) => (
                <div 
                  key={perfil.id} 
                  style={{ 
                    backgroundColor: 'white', 
                    borderRadius: '30px', 
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)', 
                    width: '160px', 
                    border: '3px solid #F1F5F9',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '20px 15px 15px 15px',
                    gap: '12px',
                    boxSizing: 'border-box',
                    transition: 'transform 0.15s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* Zona superior para entrar a jugar */}
                  <div onClick={() => onSeleccionarPerfil(perfil)} style={{ textAlign: 'center', width: '100%' }}>
                    <div style={{ fontSize: '60px', filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.1))' }}>{perfil.avatar}</div>
                    <h4 style={{ margin: '12px 0 2px 0', color: '#334155', fontSize: '1.3rem', fontWeight: '900' }}>{perfil.nombre}</h4>
                    <p style={{ margin: '0', color: '#64748b', fontSize: '1rem', fontWeight: '600' }}>{perfil.edad} años</p>
                  </div>

                  {/* Botón de estadísticas */}
                  <button 
                    onClick={() => setPerfilEstadisticas(perfil)}
                    style={{
                      backgroundColor: '#334155',
                      color: 'white',
                      border: 'none',
                      borderRadius: '16px',
                      padding: '10px 12px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      width: '100%',
                      boxShadow: '0 4px 0 #1E293B',
                      fontFamily: '"Fredoka", sans-serif',
                      marginTop: '5px'
                    }}
                  >
                    📊 Progreso
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. SECCIÓN SECUNDARIA: FORMULARIO O BOTÓN DE AÑADIR */}
        {perfiles.length === 0 || mostrarFormulario ? (
          <div className="anim-fade-in" style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            padding: '30px', 
            borderRadius: '35px', 
            boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
            border: '4px solid white',
            backdropFilter: 'blur(10px)'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#334155', fontSize: '1.5rem', fontWeight: '900', textAlign: 'center' }}>Añadir Nuevo Explorador 🚀</h3>
            
            <form onSubmit={crearPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <input 
                type="text" 
                placeholder="Nombre del niño/a" 
                value={nombre} 
                onChange={(e) => setNombre(e.target.value)} 
                className="input-moderno"
                required 
              />
              <input 
                type="number" 
                placeholder="Edad" 
                value={edad} 
                onChange={(e) => setEdad(e.target.value)} 
                className="input-moderno"
                required 
                min="2" 
                max="10"
              />
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', fontWeight: '700', color: '#475569', fontSize: '1.1rem' }}>Elige un Avatar:</p>
                <div style={{ display: 'flex', gap: '10px', fontSize: '35px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {avataresDisponibles.map((emoji) => (
                    <span 
                      key={emoji} 
                      onClick={() => setAvatarSeleccionado(emoji)} 
                      style={{ 
                        cursor: 'pointer', 
                        padding: '10px', 
                        backgroundColor: avatarSeleccionado === emoji ? '#F0E6FF' : '#F8FAFC',
                        border: avatarSeleccionado === emoji ? '4px solid #8B5CF6' : '4px solid transparent', 
                        borderRadius: '20px',
                        transition: 'all 0.2s',
                        transform: avatarSeleccionado === emoji ? 'scale(1.1)' : 'scale(1)'
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                {perfiles.length > 0 && (
                  <button 
                    type="button"
                    onClick={() => setMostrarFormulario(false)}
                    style={{ 
                      flex: 1, backgroundColor: '#F1F5F9', color: '#64748b', padding: '16px', 
                      border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '1.2rem',
                      fontWeight: '700', boxShadow: '0 6px 0 #CBD5E1', fontFamily: '"Fredoka", sans-serif'
                    }}
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  type="submit" 
                  style={{ 
                    flex: 2, backgroundColor: '#4ade80', color: 'white', padding: '16px', 
                    border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '1.2rem',
                    fontWeight: '900', boxShadow: '0 6px 0 #22c55e', fontFamily: '"Fredoka", sans-serif'
                  }}
                >
                  Guardar Perfil
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button 
            className="anim-fade-in"
            onClick={() => setMostrarFormulario(true)}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              color: '#8B5CF6', 
              padding: '20px', 
              border: '4px dashed #C4B5FD', 
              borderRadius: '30px', 
              cursor: 'pointer',
              fontSize: '1.3rem',
              fontWeight: '900',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              fontFamily: '"Fredoka", sans-serif',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <span style={{ fontSize: '28px' }}>➕</span> Añadir otro explorador
          </button>
        )}

      </div>
    </div>
  )
}
