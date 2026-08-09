import { useState } from 'react'
import { supabase } from './supabaseClient'
import logoImg from './Logosinfondo.png'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mensaje, setMensaje] = useState(null) // { tipo: 'error' | 'exito', texto: '...' }

  // Necesario para que GitHub Pages encuentre el video en la carpeta public
  const baseUrl = import.meta.env.BASE_URL

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje(null)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMensaje({ tipo: 'error', texto: error.message })
      else setMensaje({ tipo: 'exito', texto: '¡Registro exitoso! Revisa tu correo y ya puedes iniciar sesión. 🎉' })
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMensaje({ tipo: 'error', texto: error.message })
    }
    setLoading(false)
  }

  const cambiarModo = () => {
    setIsSignUp(!isSignUp)
    setMensaje(null)
  }

  return (
    <div style={{
      minHeight: '100dvh',
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

      {/* VIDEO DE FONDO */}
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
          zIndex: -2,
        }}
      />

      {/* VELO DE COLOR PARA DAR PROFUNDIDAD Y CONTRASTE AL VIDEO */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1,
        background: 'radial-gradient(circle at 50% 20%, rgba(255,154,158,0.15) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.45) 100%)'
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700;900&display=swap');

        @keyframes flotarLogo {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(-1deg); }
        }

        @keyframes entradaCard {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes entradaCampo {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes flotarDecoracion {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.85; }
          50% { transform: translateY(-22px) rotate(8deg); opacity: 1; }
        }

        @keyframes brilloSuave {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.15); }
        }

        @keyframes shakeMensaje {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        .decoracion-flotante {
          position: absolute;
          font-size: 2.2rem;
          filter: drop-shadow(0 8px 10px rgba(0,0,0,0.25));
          animation: flotarDecoracion 5s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }

        .glass-card-auth {
          background: rgba(255, 255, 255, 0.16);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1.5px solid rgba(255, 255, 255, 0.4);
          border-radius: 45px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5);
          animation: entradaCard 0.7s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }

        .campo-auth { animation: entradaCampo 0.5s ease forwards; opacity: 0; }
        .campo-auth:nth-child(1) { animation-delay: 0.15s; }
        .campo-auth:nth-child(2) { animation-delay: 0.25s; }

        .input-wrapper-auth { position: relative; display: flex; align-items: center; }

        .input-auth {
          padding: 16px 20px 16px 50px;
          border-radius: 20px;
          border: 3px solid rgba(255, 255, 255, 0.9);
          background-color: rgba(255, 255, 255, 0.92);
          font-family: 'Fredoka', sans-serif;
          font-size: 1.1rem;
          color: #334155;
          outline: none;
          transition: all 0.2s;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
        }
        .input-auth:focus {
          border-color: #FF5E62;
          background-color: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(0,0,0,0.2), 0 0 0 4px rgba(255,94,98,0.15);
        }
        .input-auth::placeholder { color: #94A3B8; }

        .icono-input {
          position: absolute; left: 16px; font-size: 1.2rem; z-index: 2; pointer-events: none;
        }

        .btn-ojo {
          position: absolute; right: 14px; background: none; border: none; cursor: pointer;
          font-size: 1.2rem; padding: 4px; z-index: 2; opacity: 0.6; transition: opacity 0.2s;
        }
        .btn-ojo:hover { opacity: 1; }

        .btn-enviar-auth {
          background: linear-gradient(135deg, #FF7B7F 0%, #FF5E62 60%, #E8434A 100%);
          color: white;
          padding: 17px;
          border: 3px solid white;
          border-radius: 25px;
          cursor: pointer;
          font-size: 1.3rem;
          font-weight: 900;
          box-shadow: 0 8px 0 #D9385E, 0 18px 30px rgba(255,94,98,0.35);
          transition: transform 0.1s;
          margin-top: 6px;
          font-family: "Fredoka", sans-serif;
          width: 100%;
        }
        .btn-enviar-auth:disabled { opacity: 0.75; cursor: default; }

        .selector-modo {
          display: inline-flex; background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.5);
          border-radius: 30px; padding: 5px; gap: 4px; backdrop-filter: blur(10px);
        }
        .selector-modo button {
          border: none; border-radius: 25px; padding: 10px 20px; font-family: "Fredoka", sans-serif;
          font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.25s cubic-bezier(0.4,0,0.2,1);
          background: transparent; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .selector-modo button.activo {
          background: white; color: #FF5E62; text-shadow: none;
          box-shadow: 0 6px 15px rgba(0,0,0,0.25);
        }

        .mensaje-auth {
          padding: 12px 18px; border-radius: 18px; font-weight: 800; font-size: 0.95rem;
          width: 100%; box-sizing: border-box; text-align: center;
        }
        .mensaje-auth.error { background: rgba(254, 226, 226, 0.95); color: #B91C1C; border: 2px solid #FCA5A5; animation: shakeMensaje 0.4s ease; }
        .mensaje-auth.exito { background: rgba(220, 252, 231, 0.95); color: #15803D; border: 2px solid #86EFAC; }

        @media (min-width: 700px) {
          .decoracion-flotante.solo-desktop { display: block; }
        }
        .decoracion-flotante.solo-desktop { display: none; }
      `}</style>

      {/* DECORACIÓN FLOTANTE (estrellas, nubes, destellos) */}
      <span className="decoracion-flotante" style={{ top: '8%', left: '8%', animationDelay: '0s', animationDuration: '6s' }}>⭐</span>
      <span className="decoracion-flotante solo-desktop" style={{ top: '15%', right: '10%', animationDelay: '1.2s', animationDuration: '5.5s', fontSize: '1.8rem' }}>☁️</span>
      <span className="decoracion-flotante" style={{ bottom: '12%', left: '10%', animationDelay: '0.6s', animationDuration: '4.5s', fontSize: '1.9rem' }}>🎈</span>
      <span className="decoracion-flotante solo-desktop" style={{ bottom: '18%', right: '8%', animationDelay: '1.8s', animationDuration: '5s' }}>🌈</span>
      <span className="decoracion-flotante solo-desktop" style={{ top: '45%', left: '5%', animationDelay: '2.4s', animationDuration: '6.5s', fontSize: '1.6rem' }}>✨</span>
      <span className="decoracion-flotante" style={{ top: '10%', right: '6%', animationDelay: '0.3s', animationDuration: '5s', fontSize: '1.7rem' }}>✨</span>

      {/* TARJETA DE CRISTAL PRINCIPAL */}
      <div className="glass-card-auth" style={{
        padding: '38px 30px',
        width: '100%',
        maxWidth: '440px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 10,
        boxSizing: 'border-box'
      }}>

        {/* Halo de brillo detrás del logo */}
        <div style={{ position: 'relative', marginBottom: '6px' }}>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,224,130,0.55) 0%, rgba(255,224,130,0) 70%)',
            animation: 'brilloSuave 3s ease-in-out infinite', zIndex: 0
          }} />
          <img
            src={logoImg}
            alt="LuliPop Logo"
            style={{
              width: '230px',
              height: 'auto',
              position: 'relative',
              zIndex: 1,
              filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))',
              animation: 'flotarLogo 3.5s ease-in-out infinite'
            }}
          />
        </div>

        <p style={{
          marginBottom: '26px', marginTop: '4px', fontSize: '1.15rem', fontWeight: '800',
          color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.4)'
        }}>
          Aprender jugando, un mundo mágico a la vez 🌈
        </p>

        {/* SELECTOR ENTRAR / REGISTRARSE */}
        <div className="selector-modo" style={{ marginBottom: '28px' }}>
          <button type="button" className={!isSignUp ? 'activo' : ''} onClick={() => { setIsSignUp(false); setMensaje(null) }}>
            Iniciar sesión
          </button>
          <button type="button" className={isSignUp ? 'activo' : ''} onClick={() => { setIsSignUp(true); setMensaje(null) }}>
            Registrarse
          </button>
        </div>

        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '18px', textAlign: 'left', width: '100%' }}>

          <div className="campo-auth">
            <label style={{ fontSize: '1rem', fontWeight: '900', display: 'block', marginBottom: '8px', marginLeft: '5px', color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}>
              Correo electrónico
            </label>
            <div className="input-wrapper-auth">
              <span className="icono-input">📧</span>
              <input
                type="email"
                placeholder="tucorreo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-auth"
                required
              />
            </div>
          </div>

          <div className="campo-auth">
            <label style={{ fontSize: '1rem', fontWeight: '900', display: 'block', marginBottom: '8px', marginLeft: '5px', color: 'white', textShadow: '0 1px 4px rgba(0,0,0,0.35)' }}>
              Contraseña
            </label>
            <div className="input-wrapper-auth">
              <span className="icono-input">🔒</span>
              <input
                type={mostrarPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-auth"
                required
                minLength={6}
              />
              <button type="button" className="btn-ojo" onClick={() => setMostrarPassword(!mostrarPassword)} title={mostrarPassword ? 'Ocultar' : 'Mostrar'}>
                {mostrarPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {mensaje && (
            <div className={`mensaje-auth ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          <button
            type="submit"
            className="btn-enviar-auth"
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(6px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
            disabled={loading}
          >
            {loading ? 'Procesando... ⏳' : (isSignUp ? 'Crear mi cuenta 🚀' : 'Entrar al mundo Lulipop ✨')}
          </button>
        </form>

        <p style={{
          marginTop: '24px', fontSize: '0.85rem', fontWeight: '700', color: 'rgba(255,255,255,0.85)',
          textShadow: '0 1px 3px rgba(0,0,0,0.3)'
        }}>
          🔒 Área privada para adultos · tus datos están protegidos
        </p>
      </div>
    </div>
  )
}
