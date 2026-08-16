import { useState } from 'react'
import { supabase } from './supabaseClient'
import logoImg from './Logosinfondo.png'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mensaje, setMensaje] = useState(null)

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

  return (
    <div className="auth-contenedor-raiz" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      width: '100vw',
      height: '100%',
      maxHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif',
      padding: '16px 16px 60px 16px',
      boxSizing: 'border-box',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>

      {/* VIDEO DE FONDO */}
      <video
        src={`${baseUrl}assets/video_intro_logo.mp4`}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: -1,
        }}
      />

      {/* VELO DE COLOR */}
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at 50% 20%, rgba(255,154,158,0.15) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.45) 100%)',
        pointerEvents: 'none'
      }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700;900&display=swap');

        @keyframes flotarLogo {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-1deg); }
        }

        @keyframes entradaCard {
          0% { opacity: 0; transform: translateY(25px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes entradaCampo {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes flotarDecoracion {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.85; }
          50% { transform: translateY(-18px) rotate(8deg); opacity: 1; }
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
          position: fixed;
          font-size: 2.2rem;
          filter: drop-shadow(0 8px 10px rgba(0,0,0,0.25));
          animation: flotarDecoracion 5s ease-in-out infinite;
          pointer-events: none;
          z-index: 1;
        }

        .glass-card-auth {
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(22px);
          -webkit-backdrop-filter: blur(22px);
          border: 1.5px solid rgba(255, 255, 255, 0.45);
          border-radius: 40px;
          box-shadow: 0 25px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.5);
          animation: entradaCard 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          width: 100%;
          max-width: 440px;
          padding: 34px 28px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          z-index: 10;
        }

        .auth-col-izq {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .auth-col-der {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-auth-img {
          width: 210px;
          height: auto;
          position: relative;
          z-index: 1;
          filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
          animation: flotarLogo 3.5s ease-in-out infinite;
        }

        .eslogan-auth {
          margin-bottom: 22px;
          margin-top: 4px;
          font-size: 1.1rem;
          font-weight: 800;
          color: white;
          text-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }

        .campo-auth { animation: entradaCampo 0.4s ease forwards; width: 100%; }
        .input-wrapper-auth { position: relative; display: flex; align-items: center; width: 100%; }

        .input-auth {
          padding: 14px 18px 14px 46px;
          border-radius: 18px;
          border: 3px solid rgba(255, 255, 255, 0.9);
          background-color: rgba(255, 255, 255, 0.92);
          font-family: 'Fredoka', sans-serif;
          font-size: 1.05rem;
          color: #334155;
          outline: none;
          transition: all 0.2s;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 8px 16px rgba(0,0,0,0.12);
        }
        .input-auth:focus {
          border-color: #FF5E62;
          background-color: rgba(255, 255, 255, 1);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.18), 0 0 0 3px rgba(255,94,98,0.15);
        }
        .input-auth::placeholder { color: #94A3B8; }

        .icono-input {
          position: absolute; left: 15px; font-size: 1.15rem; z-index: 2; pointer-events: none;
        }

        .btn-ojo {
          position: absolute; right: 14px; background: none; border: none; cursor: pointer;
          font-size: 1.15rem; padding: 4px; z-index: 2; opacity: 0.6; transition: opacity 0.2s;
        }
        .btn-ojo:hover { opacity: 1; }

        .btn-enviar-auth {
          background: linear-gradient(135deg, #FF7B7F 0%, #FF5E62 60%, #E8434A 100%);
          color: white;
          padding: 14px;
          border: 3px solid white;
          border-radius: 20px;
          cursor: pointer;
          font-size: 1.15rem;
          font-weight: 900;
          box-shadow: 0 6px 0 #D9385E, 0 14px 24px rgba(255,94,98,0.3);
          transition: transform 0.1s;
          margin-top: 4px;
          font-family: "Fredoka", sans-serif;
          width: 100%;
        }
        .btn-enviar-auth:disabled { opacity: 0.75; cursor: default; }

        .selector-modo {
          display: inline-flex; background: rgba(255,255,255,0.22); border: 2px solid rgba(255,255,255,0.5);
          border-radius: 25px; padding: 4px; gap: 4px; backdrop-filter: blur(10px);
          margin-bottom: 18px;
        }
        .selector-modo button {
          border: none; border-radius: 20px; padding: 8px 18px; font-family: "Fredoka", sans-serif;
          font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.2s ease;
          background: transparent; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .selector-modo button.activo {
          background: white; color: #FF5E62; text-shadow: none;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }

        .mensaje-auth {
          padding: 10px 14px; border-radius: 14px; font-weight: 800; font-size: 0.88rem;
          width: 100%; box-sizing: border-box; text-align: center;
        }
        .mensaje-auth.error { background: rgba(254, 226, 226, 0.95); color: #B91C1C; border: 2px solid #FCA5A5; animation: shakeMensaje 0.4s ease; }
        .mensaje-auth.exito { background: rgba(220, 252, 231, 0.95); color: #15803D; border: 2px solid #86EFAC; }

        /* ============================================================
           ADAPTACIÓN A FORMATO HORIZONTAL / BAJA ALTURA
           ============================================================ */
        @media (max-height: 550px) {
          .auth-contenedor-raiz {
            padding: 10px 16px;
          }
          .glass-card-auth {
            max-width: 720px;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding: 16px 22px;
            gap: 20px;
            border-radius: 30px;
          }
          .auth-col-izq {
            flex: 1;
          }
          .auth-col-der {
            flex: 1.25;
          }
          .logo-auth-img {
            width: 155px;
          }
          .eslogan-auth {
            font-size: 0.95rem;
            margin-bottom: 0;
            margin-top: 4px;
          }
          .selector-modo {
            margin-bottom: 10px;
          }
          .selector-modo button {
            padding: 6px 14px;
            font-size: 0.85rem;
          }
          .formulario-auth {
            gap: 10px !important;
          }
          .campo-auth label {
            display: none !important; /* Ahorra espacio vertical clave */
          }
          .input-auth {
            padding: 9px 14px 9px 40px;
            border-radius: 14px;
            font-size: 0.92rem;
          }
          .btn-enviar-auth {
            padding: 10px;
            font-size: 1rem;
            border-radius: 16px;
            margin-top: 0;
          }
          .texto-privacidad {
            display: none; /* Se oculta para no desbordar */
          }
          .decoracion-flotante {
            display: none; /* Limpia la vista horizontal */
          }
        }
      `}</style>

      {/* DECORACIÓN FLOTANTE */}
      <span className="decoracion-flotante" style={{ top: '8%', left: '8%', animationDelay: '0s', animationDuration: '6s' }}>⭐</span>
      <span className="decoracion-flotante" style={{ bottom: '12%', left: '10%', animationDelay: '0.6s', animationDuration: '4.5s', fontSize: '1.9rem' }}>🎈</span>
      <span className="decoracion-flotante" style={{ top: '10%', right: '6%', animationDelay: '0.3s', animationDuration: '5s', fontSize: '1.7rem' }}>✨</span>

      {/* TARJETA DE CRISTAL PRINCIPAL */}
      <div className="glass-card-auth">

        {/* COLUMNA IZQUIERDA: LOGO Y ESLOGAN */}
        <div className="auth-col-izq">
          <div style={{ position: 'relative', marginBottom: '4px' }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              width: '160px', height: '160px', borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,224,130,0.55) 0%, rgba(255,224,130,0) 70%)',
              animation: 'brilloSuave 3s ease-in-out infinite', zIndex: 0
            }} />
            <img
              src={logoImg}
              alt="LuliPop Logo"
              className="logo-auth-img"
            />
          </div>

          <p className="eslogan-auth">
            Aprender jugando, un mundo mágico a la vez 🌈
          </p>
        </div>

        {/* COLUMNA DERECHA: SELECTOR Y FORMULARIO */}
        <div className="auth-col-der">
          <div className="selector-modo">
            <button type="button" className={!isSignUp ? 'activo' : ''} onClick={() => { setIsSignUp(false); setMensaje(null) }}>
              Iniciar sesión
            </button>
            <button type="button" className={isSignUp ? 'activo' : ''} onClick={() => { setIsSignUp(true); setMensaje(null) }}>
              Registrarse
            </button>
          </div>

          <form onSubmit={handleAuth} className="formulario-auth" style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', width: '100%' }}>

            <div className="campo-auth">
              <label style={{ fontSize: '0.9rem', fontWeight: '900', display: 'block', marginBottom: '4px', marginLeft: '4px', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
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
              <label style={{ fontSize: '0.9rem', fontWeight: '900', display: 'block', marginBottom: '4px', marginLeft: '4px', color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
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
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(4px)'}
              onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
              disabled={loading}
            >
              {loading ? 'Procesando... ⏳' : (isSignUp ? 'Crear mi cuenta 🚀' : 'Entrar a Lulipop ✨')}
            </button>
          </form>

          <p className="texto-privacidad" style={{
            marginTop: '14px', fontSize: '0.8rem', fontWeight: '700', color: 'rgba(255,255,255,0.85)',
            textShadow: '0 1px 3px rgba(0,0,0,0.3)', margin: '14px 0 0 0'
          }}>
            🔒 Área privada para adultos
          </p>
        </div>

      </div>
    </div>
  )
}
