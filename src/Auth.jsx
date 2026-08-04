import { useState } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import logoImg from './Logosinfondo.png'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)

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
      minHeight: '100vh',
      width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute',
      top: 0, left: 0,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap');
        .input-auth {
          padding: 14px 18px;
          border-radius: 18px;
          border: 2px solid #E0E0E0;
          font-family: 'Fredoka', sans-serif;
          font-size: 1rem;
          outline: none;
          transition: border-color 0.2s;
          width: 100%;
          box-sizing: border-box;
        }
        .input-auth:focus {
          border-color: #FF5E62;
        }
      `}</style>

      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        padding: '35px 40px',
        borderRadius: '35px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        border: '4px solid white',
        width: '100%',
        maxWidth: '420px',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Logotipo oficial */}
        <img 
          src={logoImg} 
          alt="LuliPop Logo" 
          style={{ width: '220px', height: 'auto', marginBottom: '5px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} 
        />
        
        <p style={{ color: '#666', marginBottom: '25px', fontSize: '1.05rem', fontWeight: '500' }}>
          {isSignUp ? 'Crea tu cuenta de padre/madre' : 'Inicia sesión para entrar al mundo'}
        </p>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Correo electrónico</label>
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
            <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#444', display: 'block', marginBottom: '6px' }}>Contraseña</label>
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
              border: 'none', 
              borderRadius: '20px', 
              cursor: 'pointer',
              fontSize: '1.2rem',
              fontWeight: '700',
              boxShadow: '0 8px 0 #D9385E, 0 12px 20px rgba(0,0,0,0.15)',
              transition: 'transform 0.1s',
              marginTop: '10px'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(6px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
            disabled={loading}
          >
            {loading ? 'Procesando...' : (isSignUp ? 'Registrarse 🚀' : 'Entrar ✨')}
          </button>
        </form>

        <p 
          onClick={() => setIsSignUp(!isSignUp)}
          style={{ marginTop: '22px', color: '#0083B0', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}
        >
          {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
        </p>
      </div>
    </div>
  )
}