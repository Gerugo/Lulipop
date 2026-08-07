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
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  
  const avataresDisponibles = ['👦', '👧', '🦊', '🐱', '🦖', '🦄', '🐶', '🐰']
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(avataresDisponibles[0])

  // Colores divertidos para que cada niño tenga su botón de progreso de un color
  const coloresBotones = [
    { bg: '#FF5E62', shadow: '#D9385E' }, // Rojo
    { bg: '#4facfe', shadow: '#0083B0' }, // Azul
    { bg: '#43e97b', shadow: '#27ae60' }, // Verde
    { bg: '#FFD166', shadow: '#CCAC00' }, // Amarillo
    { bg: '#a18cd1', shadow: '#7052a6' }, // Morado
  ]

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
      setMostrarFormulario(false)
      obtenerPerfiles()
    }
  }

  if (perfilEstadisticas) {
    return <DashboardPadres perfil={perfilEstadisticas} onVolver={() => setPerfilEstadisticas(null)} />
  }

  return (
    <div style={{ 
      minHeight: '100dvh', 
      width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'absolute',
      top: 0, left: 0,
      boxSizing: 'border-box',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: '"Fredoka", sans-serif',
      overflowY: 'auto'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700;900&display=swap');
        
        .anim-fade-in { animation: fadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.9); } 100% { opacity: 1; transform: scale(1); } }

        @keyframes flotarLogo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        /* Efecto cristal para los contenedores */
        .glass-panel {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(15px);
          border: 5px solid rgba(255, 255, 255, 0.9);
          border-radius: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        /* Tarjetas de niños en 3D */
        .tarjeta-perfil {
          background: white;
          border-radius: 35px;
          border: 4px solid #F1F5F9;
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 25px 20px 20px 20px;
          gap: 10px;
          width: 100%;
          max-width: 220px;
          box-sizing: border-box;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tarjeta-perfil:hover {
          transform: translateY(-5px);
        }
        .tarjeta-perfil:active {
          transform: scale(0.95);
        }

        /* Inputs modernos que se iluminan al escribir */
        .input-moderno {
          padding: 16px 20px;
          border-radius: 20px;
          border: 3px solid rgba(255, 255, 255, 0.9);
          background-color: rgba(255, 255, 255, 0.85);
          font-family: 'Fredoka', sans-serif;
          font-size: 1.1rem;
          color: #334155;
          outline: none;
          transition: all 0.2s;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .input-moderno:focus {
          border-color: #a18cd1;
          background-color: white;
          transform: translateY(-2px);
        }
      `}</style>

      {/* CABECERA: Logotipo + Botón cerrar sesión */}
      <div style={{ width: '100%', maxWidth: '700px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', zIndex: 10, marginTop: '10px' }}>
        <img 
          src={logoImg} 
          alt="LuliPop Logo" 
          style={{ width: '140px', height: 'auto', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))', animation: 'flotarLogo 3s ease-in-out infinite' }} 
        />
        
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ 
            padding: '12px 20px', 
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: '3px solid white',
            borderRadius: '20px',
            fontWeight: '900',
            color: '#FF5E62',
            fontSize: '1rem',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.1)',
            fontFamily: '"Fredoka", sans-serif',
            transition: 'transform 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'}
          onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Salir 🚪
        </button>
      </div>

      <div style={{ maxWidth: '700px', width: '100%', zIndex: 10, paddingBottom: '40px', display: 'flex', flexDirection: 'column', gap: '25px', alignItems: 'center' }}>
        
        {/* 1. SECCIÓN PRINCIPAL: LISTADO DE PERFILES */}
        {perfiles.length > 0 && !mostrarFormulario && (
          <div className="glass-panel anim-fade-in" style={{ padding: '35px 25px', width: '100%', boxSizing: 'border-box' }}>
            <h3 style={{ color: '#1E293B', fontSize: 'clamp(1.6rem, 6vw, 2rem)', margin: '0 0 10px 0', fontWeight: '900', textAlign: 'center', textShadow: '0 2px 4px rgba(255,255,255,0.8)' }}>
              ¿Quién va a jugar hoy?
            </h3>
            <p style={{ color: '#475569', fontSize: '1.1rem', margin: '0 0 30px 0', textAlign: 'center', fontWeight: '600' }}>
              Toca tu avatar para entrar a Lulipop ✨
            </p>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {perfiles.map((perfil, index) => {
                const colorEstilo = coloresBotones[index % coloresBotones.length];
                
                return (
                  <div key={perfil.id} className="tarjeta-perfil">
                    
                    {/* Zona para entrar a jugar (ARREGLADA) */}
                    <div onClick={() => onSeleccionarPerfil(perfil)} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      width: '100%', 
                      gap: '8px' 
                    }}>
                      <div style={{ 
                        fontSize: '70px', 
                        lineHeight: '1', 
                        filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))' 
                      }}>
                        {perfil.avatar}
                      </div>
                      <h4 style={{ margin: '0', color: '#1E293B', fontSize: '1.4rem', fontWeight: '900', lineHeight: '1.1' }}>
                        {perfil.nombre}
                      </h4>
                      <p style={{ margin: '0', color: '#94A3B8', fontSize: '1.1rem', fontWeight: '700' }}>
                        {perfil.edad} años
                      </p>
                    </div>

                    {/* Botón de estadísticas con colores dinámicos */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setPerfilEstadisticas(perfil); }}
                      style={{
                        backgroundColor: colorEstilo.bg,
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '12px',
                        fontSize: '1.05rem',
                        fontWeight: '900',
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: `0 6px 0 ${colorEstilo.shadow}, 0 10px 15px rgba(0,0,0,0.1)`,
                        fontFamily: '"Fredoka", sans-serif',
                        marginTop: '15px',
                        transition: 'transform 0.1s'
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'}
                      onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      📊 Progreso
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* 2. FORMULARIO PARA AÑADIR NIÑOS (Efecto Cristal) */}
        {perfiles.length === 0 || mostrarFormulario ? (
          <div className="glass-panel anim-fade-in" style={{ padding: '35px 30px', width: '100%', maxWidth: '500px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 25px 0', color: '#1E293B', fontSize: 'clamp(1.5rem, 6vw, 1.8rem)', fontWeight: '900', textAlign: 'center' }}>
              {perfiles.length === 0 ? '¡Crea el primer explorador! 🚀' : 'Añadir Nuevo Explorador 🚀'}
            </h3>
            
            <form onSubmit={crearPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ fontWeight: '900', color: '#334155', marginLeft: '5px', marginBottom: '8px', display: 'block' }}>Nombre</label>
                <input type="text" placeholder="Ej. Mateo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-moderno" required />
              </div>
              
              <div>
                <label style={{ fontWeight: '900', color: '#334155', marginLeft: '5px', marginBottom: '8px', display: 'block' }}>Edad</label>
                <input type="number" placeholder="Ej. 4" value={edad} onChange={(e) => setEdad(e.target.value)} className="input-moderno" required min="2" max="10" />
              </div>

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <p style={{ margin: '0 0 15px 0', fontWeight: '900', color: '#334155', fontSize: '1.1rem' }}>Elige un Avatar:</p>
                <div style={{ display: 'flex', gap: '12px', fontSize: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {avataresDisponibles.map((emoji) => (
                    <span 
                      key={emoji} onClick={() => setAvatarSeleccionado(emoji)} 
                      style={{ 
                        cursor: 'pointer', padding: '10px', 
                        backgroundColor: avatarSeleccionado === emoji ? 'white' : 'rgba(255,255,255,0.5)',
                        border: avatarSeleccionado === emoji ? '4px solid #a18cd1' : '4px solid transparent', 
                        borderRadius: '25px', transition: 'all 0.2s',
                        transform: avatarSeleccionado === emoji ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: avatarSeleccionado === emoji ? '0 10px 20px rgba(0,0,0,0.15)' : 'none'
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
                {perfiles.length > 0 && (
                  <button 
                    type="button" onClick={() => setMostrarFormulario(false)}
                    style={{ flex: 1, backgroundColor: '#FFFFFF', color: '#64748b', padding: '16px', border: '3px solid #E2E8F0', borderRadius: '25px', cursor: 'pointer', fontSize: '1.1rem', fontWeight: '900', boxShadow: '0 6px 0 #CBD5E1', fontFamily: '"Fredoka", sans-serif' }}
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  type="submit" 
                  style={{ flex: 2, backgroundColor: '#4ade80', color: 'white', padding: '16px', border: '3px solid white', borderRadius: '25px', cursor: 'pointer', fontSize: '1.3rem', fontWeight: '900', boxShadow: '0 8px 0 #27ae60', fontFamily: '"Fredoka", sans-serif' }}
                >
                  ¡Guardar! ✨
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 3. BOTÓN PARA AÑADIR MÁS NIÑOS (Botón 3D discontinuo) */
          <button 
            className="anim-fade-in" onClick={() => setMostrarFormulario(true)}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.75)', color: '#7052a6', padding: '18px 35px', 
              border: '4px dashed #a18cd1', borderRadius: '35px', cursor: 'pointer',
              fontSize: '1.3rem', fontWeight: '900', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
              fontFamily: '"Fredoka", sans-serif', transition: 'all 0.2s',
              boxShadow: '0 15px 25px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.transform = 'scale(1.03)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{ fontSize: '28px' }}>➕</span> Añadir explorador
          </button>
        )}

      </div>
    </div>
  )
}
