import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import logoImg from './Logosinfondo.png'

export default function Perfiles({ session, onSeleccionarPerfil }) {
  const [perfiles, setPerfiles] = useState([])
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  
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
      obtenerPerfiles()
    }
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
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap');
        .input-moderno {
          padding: 14px 18px;
          border-radius: 16px;
          border: 2px solid #E0E0E0;
          font-family: 'Fredoka', sans-serif;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .input-moderno:focus {
          border-color: #8E2DE2;
        }
      `}</style>

      {/* CABECERA: Logotipo centrado o arriba + Botón cerrar sesión */}
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
            fontWeight: '600',
            color: '#FF5E62',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.1)',
            transition: 'transform 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'}
          onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Cerrar Sesión 🚪
        </button>
      </div>

      <div style={{ maxWidth: '650px', width: '100%', zIndex: 10, paddingBottom: '40px' }}>
        
        {/* Formulario de creación */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.92)', 
          padding: '30px', 
          borderRadius: '30px', 
          marginBottom: '30px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '4px solid white',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.4rem' }}>Añadir Nuevo Explorador 🚀</h3>
          
          <form onSubmit={crearPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
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
            <div>
              <p style={{ margin: '0 0 10px 0', fontWeight: '600', color: '#555' }}>Elige un Avatar:</p>
              <div style={{ display: 'flex', gap: '12px', fontSize: '32px' }}>
                {avataresDisponibles.map((emoji) => (
                  <span 
                    key={emoji} 
                    onClick={() => setAvatarSeleccionado(emoji)} 
                    style={{ 
                      cursor: 'pointer', 
                      padding: '8px', 
                      backgroundColor: avatarSeleccionado === emoji ? '#F0E6FF' : '#F9F9F9',
                      border: avatarSeleccionado === emoji ? '3px solid #8E2DE2' : '3px solid transparent', 
                      borderRadius: '16px',
                      transition: 'all 0.1s'
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
            
            <button 
              type="submit" 
              style={{ 
                backgroundColor: '#4caf50', 
                color: 'white', 
                padding: '14px', 
                border: 'none', 
                borderRadius: '18px', 
                cursor: 'pointer',
                fontSize: '1.1rem',
                fontWeight: '700',
                boxShadow: '0 6px 0 #388e3c, 0 10px 15px rgba(0,0,0,0.1)',
                transition: 'transform 0.1s',
                marginTop: '5px'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'}
              onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Guardar Perfil
            </button>
          </form>
        </div>

        {/* Listado de perfiles */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.92)', 
          padding: '25px 30px', 
          borderRadius: '30px',
          boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
          border: '4px solid white',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: '#333', fontSize: '1.3rem', marginBottom: '20px', marginTop: 0 }}>¿Quién va a jugar hoy?</h3>
          
          {perfiles.length === 0 ? (
            <p style={{ color: '#666', margin: 0 }}>Aún no hay perfiles creados. ¡Crea uno arriba!</p>
          ) : (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {perfiles.map((perfil) => (
                <div 
                  key={perfil.id} 
                  onClick={() => onSeleccionarPerfil(perfil)} 
                  style={{ 
                    textAlign: 'center', 
                    padding: '22px 18px', 
                    backgroundColor: 'white', 
                    borderRadius: '25px', 
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08)', 
                    minWidth: '120px', 
                    cursor: 'pointer', 
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: '3px solid #F0F2F5'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.12)'
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)'
                  }}
                >
                  <div style={{ fontSize: '50px' }}>{perfil.avatar}</div>
                  <h4 style={{ margin: '10px 0 4px 0', color: '#333', fontSize: '1.1rem' }}>{perfil.nombre}</h4>
                  <p style={{ margin: '0', color: '#777', fontSize: '0.9rem' }}>{perfil.edad} años</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}