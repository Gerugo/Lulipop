import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Auth from './Auth'
import Perfiles from './Perfiles'
import MundoLulipop from './MundoLulipop' // Importamos la nueva pantalla

function App() {
  const [session, setSession] = useState(null)
  
  // NUEVO: Estado para saber qué niño está jugando
  const [perfilActivo, setPerfilActivo] = useState(null) 

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  }

  // SI HAY UN NIÑO SELECCIONADO, MOSTRAMOS EL MUNDO LULIPOP
  if (perfilActivo) {
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