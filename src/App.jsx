import { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Perfiles from './Perfiles'
import MundoLulipop from './MundoLulipop' // Importamos la nueva pantalla
import PantallaTiempoAgotado from './PantallaTiempoAgotado'
import { obtenerMinutosJugadosHoy, sumarMinutoJugado, obtenerMinutosExtraHoy, limpiarTiempoAntiguo } from './tiempoPantalla'

function App() {
  const [session, setSession] = useState(null)
  
  // NUEVO: Estado para saber qué niño está jugando
  const [perfilActivo, setPerfilActivo] = useState(null) 
  const [minutosJugadosHoy, setMinutosJugadosHoy] = useState(0)
  const [minutosExtra, setMinutosExtra] = useState(0)
  const intervaloRef = useRef(null)

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

  // Contador de tiempo de pantalla: solo corre mientras hay un niño jugando,
  // y se pausa si la pestaña/app pasa a segundo plano (no cuenta tiempo "fantasma").
  useEffect(() => {
    if (!perfilActivo) {
      setMinutosJugadosHoy(0)
      setMinutosExtra(0)
      return
    }

    setMinutosJugadosHoy(obtenerMinutosJugadosHoy(perfilActivo.id))
    setMinutosExtra(obtenerMinutosExtraHoy(perfilActivo.id))

    intervaloRef.current = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setMinutosJugadosHoy(sumarMinutoJugado(perfilActivo.id))
      }
    }, 60000)

    return () => clearInterval(intervaloRef.current)
  }, [perfilActivo?.id])

  if (!session) {
    return <Auth />
  }

  // SI HAY UN NIÑO SELECCIONADO, MOSTRAMOS EL MUNDO LULIPOP (o el aviso de tiempo agotado)
  if (perfilActivo) {
    const limite = perfilActivo.limite_minutos
    const limiteAlcanzado = limite && minutosJugadosHoy >= (limite + minutosExtra)

    if (limiteAlcanzado) {
      return (
        <PantallaTiempoAgotado
          perfil={perfilActivo}
          minutosJugadosHoy={minutosJugadosHoy}
          onVolverAPerfiles={() => setPerfilActivo(null)}
          onDesbloquear={() => setMinutosExtra(obtenerMinutosExtraHoy(perfilActivo.id))}
        />
      )
    }

    return (
      <MundoLulipop 
        perfil={perfilActivo} 
        onVolver={() => setPerfilActivo(null)} // Función para volver al panel
      />
    )
  }

  // SI NO HAY NIÑO SELECCIONADO, MOSTRAMOS EL PANEL DE PADRES
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
      
      {/* Le pasamos a Perfiles la función para cambiar el perfil activo */}
      <Perfiles 
        session={session} 
        onSeleccionarPerfil={(perfil) => setPerfilActivo(perfil)} 
      />
      
    </div>
  )
}

export default App