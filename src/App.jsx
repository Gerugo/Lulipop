import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Perfiles from './Perfiles'
import MundoLulipop from './MundoLulipop'
import PantallaTiempoAgotado from './PantallaTiempoAgotado'
import { obtenerMinutosJugadosHoy, sumarMinutoJugado, obtenerMinutosExtraHoy, limpiarTiempoAntiguo } from './tiempoPantalla'

function App() {
  const [session, setSession] = useState(null)
  
  // Estado para el niño activo
  const [perfilActivo, setPerfilActivo] = useState(null) 
  const [minutosJugadosHoy, setMinutosJugadosHoy] = useState(0)
  const [minutosExtra, setMinutosExtra] = useState(0)
  const intervaloRef = useRef(null)

  // 1. Intentar bloquear la orientación a horizontal (Screen Orientation API)
  useEffect(() => {
    const forzarHorizontal = async () => {
      try {
        if (window.screen?.orientation?.lock) {
          await window.screen.orientation.lock('landscape')
        }
      } catch {
        // En navegadores que no lo soportan (como iOS Safari) o que requieren gesto de usuario
      }
    }
    forzarHorizontal()

    const alInteractuar = () => { forzarHorizontal() }
    window.addEventListener('pointerdown', alInteractuar, { once: true })
    return () => window.removeEventListener('pointerdown', alInteractuar)
  }, [])

  // 2. Gestión de sesión de Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    limpiarTiempoAntiguo()
    return () => subscription.unsubscribe()
  }, [])

  // 3. Contador de tiempo de pantalla activo
  useEffect(() => {
    if (!perfilActivo?.id) return

    intervaloRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setMinutosJugadosHoy(sumarMinutoJugado(perfilActivo.id))
      }
    }, 60000)

    return () => clearInterval(intervaloRef.current)
  }, [perfilActivo?.id])

  const seleccionarPerfil = (perfil) => {
    setPerfilActivo(perfil)
    if (perfil) {
      setMinutosJugadosHoy(obtenerMinutosJugadosHoy(perfil.id))
      setMinutosExtra(obtenerMinutosExtraHoy(perfil.id))
    } else {
      setMinutosJugadosHoy(0)
      setMinutosExtra(0)
    }
  }

  // Función auxiliar para renderizar la pantalla correspondiente
  const renderContenido = () => {
    if (!session) {
      return <Auth />
    }

    if (perfilActivo) {
      const limite = perfilActivo.limite_minutos
      const limiteAlcanzado = limite && minutosJugadosHoy >= (limite + minutosExtra)

      if (limiteAlcanzado) {
        return (
          <PantallaTiempoAgotado
            perfil={perfilActivo}
            minutosJugadosHoy={minutosJugadosHoy}
            onVolverAPerfiles={() => seleccionarPerfil(null)}
            onDesbloquear={() => setMinutosExtra(obtenerMinutosExtraHoy(perfilActivo.id))}
          />
        )
      }

      return (
        <MundoLulipop 
          perfil={perfilActivo} 
          onVolver={() => seleccionarPerfil(null)} 
        />
      )
    }

    return (
      <div style={{ padding: '50px', textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h2>¡Bienvenido a Lulipop! 🎉</h2>
        <p>Sesión iniciada con: <strong>{session.user.email}</strong></p>
        
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer', backgroundColor: '#f4f4f4', border: '1px solid #ddd', borderRadius: '5px' }}
        >
          Cerrar Sesión
        </button>

        <hr style={{ margin: '40px 0', border: '1px solid #eee' }} />
        
        <Perfiles 
          session={session} 
          onSeleccionarPerfil={seleccionarPerfil} 
        />
      </div>
    )
  }

  return (
    <>
      {/* PANTALLA BLOQUEANTE: Solo visible en móviles/tablets cuando están en vertical */}
      <div className="bloqueo-vertical-aviso">
        <div className="icono-rotar-movil">📱</div>
        <h2 style={{ fontSize: '1.8rem', color: '#FF5E62', margin: '20px 0 10px 0', fontWeight: '900' }}>
          ¡Gira tu pantalla!
        </h2>
        <p style={{ fontSize: '1.1rem', color: '#576574', fontWeight: '700', maxWidth: '280px', lineHeight: 1.4, margin: 0 }}>
          Para disfrutar de Mundo Lulipop, coloca tu dispositivo en horizontal 🍭
        </p>
      </div>

      {/* CONTENIDO PRINCIPAL DE LA APLICACIÓN */}
      {renderContenido()}

      <style>{`
        .bloqueo-vertical-aviso {
          display: none;
        }

        @media screen and (orientation: portrait) and (max-width: 900px) and (hover: none) {
          .bloqueo-vertical-aviso {
            display: flex !important;
            position: fixed;
            inset: 0;
            background: linear-gradient(180deg, #c7ecee 0%, #dff9fb 100%);
            z-index: 999999;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 25px;
            font-family: "Fredoka", sans-serif;
            user-select: none;
            touch-action: none;
          }

          .icono-rotar-movil {
            font-size: 4.5rem;
            animation: rotarMovilLulipop 2.2s cubic-bezier(0.45, 0, 0.55, 1) infinite;
          }
        }

        @keyframes rotarMovilLulipop {
          0%, 15% { transform: rotate(0deg); }
          45%, 65% { transform: rotate(-90deg) scale(1.1); }
          90%, 100% { transform: rotate(0deg); }
        }
      `}</style>
    </>
  )
}

export default App
