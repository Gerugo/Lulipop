import { useState } from 'react'
import { supabase } from './supabaseClient'
import logoImg from './Logosinfondo.png'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

  // Necesario para que GitHub Pages encuentre el video en la carpeta public
  const baseUrl = import.meta.env.BASE_URL

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) alert(error.message)
      else alert('¡Registro exitoso! Ya puedes iniciar sesión.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100dvh', /* Cambiado a dvh para adaptarse como una App nativa */
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute',
      top: 0, left: 0,
      padding: '20px',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      
      {/* VIDEO DE FONDO CORREGIDO PARA REACT */}
      <video
        src={`${baseUrl}assets/video_intro_logo.mp4`}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1, 
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700;900&display=swap');
        
        /* Efecto para que los inputs resalten sobre el video */
        .input-auth {
          padding: 16px 20px;
          border-radius: 20px;
          border: 3px solid rgba(255, 255, 255, 0.9);
          background-color: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(5px);
          font-family: 'Fredoka', sans-serif;
          font-size: 1.1rem;
          color: #334155;
          outline: none;
          transition: all 0.2s;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .input-auth:focus {
          border-color: #FF5E62;
          background-color: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
        }
        .input-auth::placeholder {
          color: #94A3B8;
        }

        /* Resplandor para que las letras se lean sin importar el color de fondo */
        .texto-brillante {
          color: #1E293B;
          text-shadow: 0 2px 4px rgba(255,255,255,0.9), 0 0 15px rgba(255,255,255,1);
        }
        
        @keyframes flotarLogo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* CONTENEDOR 100% TRANSPARENTE (Sin caja blanca) */}
      <div style={{
        padding: '20px',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10
      }}>
        
        {/* Logotipo oficial flotante */}
        <img 
          src={logoImg} 
          alt="LuliPop Logo" 
          style={{ 
            width: '260px', 
            height: 'auto', 
            marginBottom: '15px', 
            filter: 'drop-shadow(0 8px 15px rgba(0,0,0,0.25))',
            animation: 'flotarLogo 3s ease-in-out infinite'
          }} 
        />
        
        <p className="texto-brillante" style={{ marginBottom: '35px', fontSize: '1.2rem', fontWeight: '900' }}>
          {isSignUp ? 'Crea tu cuenta de padre/madre' : 'Inicia sesión para entrar al mundo'}
        </p>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', width: '100%' }}>
          <div>
            <label className="texto-brillante" style={{ fontSize: '1.1rem', fontWeight: '900', display: 'block', marginBottom: '8px', marginLeft: '5px' }}>
              Correo electrónico
            </label>
            <input 
              type="email" 
              placeholder="tucorreo@email.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="input-auth"
              required 
            />
          </div>

          <div>
            <label className="texto-brillante" style={{ fontSize: '1.1rem', fontWeight: '900', display: 'block', marginBottom: '8px', marginLeft: '5px' }}>
              Contraseña
            </label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="input-auth"
              required 
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              backgroundColor: '#FF5E62', 
              color: 'white', 
              padding: '16px', 
              border: '3px solid white', 
              borderRadius: '25px', 
              cursor: 'pointer',
              fontSize: '1.3rem',
              fontWeight: '900',
              boxShadow: '0 8px 0 #D9385E, 0 15px 25px rgba(0,0,0,0.25)',
              transition: 'transform 0.1s',
              marginTop: '10px',
              fontFamily: '"Fredoka", sans-serif'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(6px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
            disabled={loading}
          >
            {loading ? 'Procesando... ⏳' : (isSignUp ? 'Registrarse 🚀' : 'Entrar ✨')}
          </button>
        </form>

        {/* Botón de cambio de modo adaptado para el fondo transparente */}
        <button 
          onClick={(e) => { e.preventDefault(); setIsSignUp(!isSignUp); }}
          style={{ 
            marginTop: '30px', 
            background: 'rgba(255, 255, 255, 0.9)', 
            border: '3px solid white',
            padding: '12px 25px',
            borderRadius: '30px',
            color: '#0083B0', 
            cursor: 'pointer', 
            fontWeight: '900', 
            fontSize: '1rem',
            fontFamily: '"Fredoka", sans-serif',
            boxShadow: '0 8px 15px rgba(0,0,0,0.15)'
          }}
        >
          {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
        </button>
      </div>
    </div>
  )
}
