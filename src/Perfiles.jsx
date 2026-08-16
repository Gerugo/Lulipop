import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import logoImg from './Logosinfondo.png'
import DashboardPadres from './DashboardPadres'

export default function Perfiles({ session, onSeleccionarPerfil }) {
  const [perfiles, setPerfiles] = useState([])
  const [nombre, setNombre] = useState('')
  const [edad, setEdad] = useState('')
  const [limiteMinutos, setLimiteMinutos] = useState('')
  const [perfilEstadisticas, setPerfilEstadisticas] = useState(null)
  const [perfilAEliminar, setPerfilAEliminar] = useState(null)
  const [eliminando, setEliminando] = useState(false)
  const [perfilEditando, setPerfilEditando] = useState(null)
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [rachasPorPerfil, setRachasPorPerfil] = useState({})
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  
  const avataresDisponibles = ['👦', '👧', '🦊', '🐱', '🦖', '🦄', '🐶', '🐰']
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(avataresDisponibles[0])

  const coloresBotones = [
    { bg: '#FF5E62', shadow: '#D9385E' },
    { bg: '#4facfe', shadow: '#0083B0' },
    { bg: '#43e97b', shadow: '#27ae60' },
    { bg: '#FFD166', shadow: '#CCAC00' },
    { bg: '#a18cd1', shadow: '#7052a6' },
  ]

  const calcularRacha = (fechas) => {
    const diasUnicos = new Set(fechas.map((f) => new Date(f).toDateString()))
    if (diasUnicos.size === 0) return 0

    let racha = 0
    const cursor = new Date()
    cursor.setHours(0, 0, 0, 0)

    if (!diasUnicos.has(cursor.toDateString())) {
      cursor.setDate(cursor.getDate() - 1)
    }

    while (diasUnicos.has(cursor.toDateString())) {
      racha++
      cursor.setDate(cursor.getDate() - 1)
    }
    return racha
  }

  const obtenerRachas = async () => {
    if (!session?.user?.id) return
    const { data, error } = await supabase
      .from('progreso_actividades')
      .select('perfil_id, created_at')
      .eq('padre_id', session.user.id)

    if (error || !data) return

    const fechasPorPerfil = {}
    data.forEach((fila) => {
      if (!fila.created_at) return
      if (!fechasPorPerfil[fila.perfil_id]) fechasPorPerfil[fila.perfil_id] = []
      fechasPorPerfil[fila.perfil_id].push(fila.created_at)
    })

    const rachas = {}
    Object.keys(fechasPorPerfil).forEach((perfilId) => {
      rachas[perfilId] = calcularRacha(fechasPorPerfil[perfilId])
    })
    setRachasPorPerfil(rachas)
  }

  const obtenerPerfiles = async () => {
    if (!session?.user?.id) return
    const { data, error } = await supabase
      .from('perfiles_ninos')
      .select('*')
      .eq('padre_id', session.user.id)

    if (error) {
      console.error("Error cargando perfiles:", error)
    } else {
      setPerfiles(data || [])
      obtenerRachas()
    }
  }

  useEffect(() => {
    let cancelado = false
    const cargar = async () => {
      if (!session?.user?.id) return
      const { data, error } = await supabase
        .from('perfiles_ninos')
        .select('*')
        .eq('padre_id', session.user.id)

      if (!cancelado && !error) {
        setPerfiles(data || [])
        obtenerRachas()
      }
    }
    cargar()
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id])

  const abrirFormularioNuevo = () => {
    setPerfilEditando(null)
    setNombre('')
    setEdad('')
    setLimiteMinutos('')
    setAvatarSeleccionado(avataresDisponibles[0])
    setMostrarFormulario(true)
  }

  const abrirFormularioEdicion = (perfil) => {
    setPerfilEditando(perfil)
    setNombre(perfil.nombre)
    setEdad(String(perfil.edad))
    setLimiteMinutos(perfil.limite_minutos ? String(perfil.limite_minutos) : '')
    setAvatarSeleccionado(perfil.avatar)
    setMostrarFormulario(true)
  }

  const guardarPerfil = async (e) => {
    e.preventDefault()
    setGuardandoPerfil(true)
    const limiteAGuardar = limiteMinutos.trim() !== '' ? parseInt(limiteMinutos, 10) : null

    if (perfilEditando) {
      const { error } = await supabase
        .from('perfiles_ninos')
        .update({ nombre, edad: parseInt(edad), avatar: avatarSeleccionado, limite_minutos: limiteAGuardar })
        .eq('id', perfilEditando.id)

      if (error) {
        alert("Error: " + error.message)
      } else {
        setPerfilEditando(null)
        setNombre('')
        setEdad('')
        setLimiteMinutos('')
        setMostrarFormulario(false)
        obtenerPerfiles()
      }
    } else {
      const { error } = await supabase
        .from('perfiles_ninos')
        .insert([{ padre_id: session.user.id, nombre, edad: parseInt(edad), avatar: avatarSeleccionado, limite_minutos: limiteAGuardar }])

      if (error) {
        alert("Error: " + error.message)
      } else {
        setNombre('')
        setEdad('')
        setLimiteMinutos('')
        setMostrarFormulario(false)
        obtenerPerfiles()
      }
    }
    setGuardandoPerfil(false)
  }

  const eliminarPerfil = async () => {
    if (!perfilAEliminar) return
    setEliminando(true)

    try {
      const { error: errorProgreso } = await supabase
        .from('progreso_actividades')
        .delete()
        .eq('perfil_id', perfilAEliminar.id)

      if (errorProgreso) throw errorProgreso

      const { error: errorPerfil } = await supabase
        .from('perfiles_ninos')
        .delete()
        .eq('id', perfilAEliminar.id)

      if (errorPerfil) throw errorPerfil

      try {
        Object.keys(localStorage)
          .filter((clave) => clave.startsWith('niveles_') && clave.endsWith(`_${perfilAEliminar.id}`))
          .forEach((clave) => localStorage.removeItem(clave))
      } catch { /* continuar */ }

      setPerfiles((prev) => prev.filter((p) => p.id !== perfilAEliminar.id))
      setPerfilAEliminar(null)
    } catch (error) {
      alert("No se pudo eliminar el perfil: " + error.message)
    } finally {
      setEliminando(false)
    }
  }

  if (perfilEstadisticas) {
    return <DashboardPadres perfil={perfilEstadisticas} onVolver={() => setPerfilEstadisticas(null)} />
  }

  return (
    <div className="perfiles-contenedor-raiz" style={{ 
      minHeight: '100dvh', 
      width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'absolute',
      top: 0, left: 0,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: '"Fredoka", sans-serif',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700;900&display=swap');
        
        .anim-fade-in { animation: fadeIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fadeIn { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }

        @keyframes flotarLogo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .perfiles-contenedor-raiz {
          padding: 16px 20px;
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(15px);
          border: 4px solid rgba(255, 255, 255, 0.95);
          border-radius: 30px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.12);
        }

        .cabecera-perfiles {
          width: 100%;
          max-width: 800px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          z-index: 10;
        }

        .logo-img-perfiles {
          width: 115px;
          height: auto;
          filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15));
          animation: flotarLogo 3s ease-in-out infinite;
        }

        .tarjeta-perfil {
          background: white;
          border-radius: 26px;
          border: 3px solid #F1F5F9;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 14px 12px 14px;
          gap: 6px;
          width: 100%;
          max-width: 175px;
          box-sizing: border-box;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .tarjeta-perfil:hover { transform: translateY(-4px); }
        .tarjeta-perfil:active { transform: scale(0.96); }

        .avatar-emoji-perfil {
          font-size: 48px;
          line-height: 1;
          filter: drop-shadow(0 6px 10px rgba(0,0,0,0.12));
        }

        .input-moderno {
          padding: 12px 16px;
          border-radius: 16px;
          border: 3px solid rgba(255, 255, 255, 0.9);
          background-color: rgba(255, 255, 255, 0.85);
          font-family: 'Fredoka', sans-serif;
          font-size: 1rem;
          color: #334155;
          outline: none;
          transition: all 0.2s;
          width: 100%;
          box-sizing: border-box;
          box-shadow: 0 8px 16px rgba(0,0,0,0.04);
        }
        .input-moderno:focus {
          border-color: #a18cd1;
          background-color: white;
        }

        /* AJUSTES PARA DISPOSITIVOS HORIZONTALES / BAJA ALTURA */
        @media (max-height: 550px) {
          .perfiles-contenedor-raiz {
            padding: 8px 16px 20px 16px;
          }
          .cabecera-perfiles {
            margin-bottom: 6px;
          }
          .logo-img-perfiles {
            width: 90px;
          }
          .panel-principal-perfiles {
            padding: 14px 18px !important;
          }
          .titulo-perfiles {
            font-size: 1.3rem !important;
            margin-bottom: 2px !important;
          }
          .subtitulo-perfiles {
            font-size: 0.9rem !important;
            margin-bottom: 12px !important;
          }
          .tarjeta-perfil {
            max-width: 155px;
            padding: 10px 10px 8px 10px;
            border-radius: 22px;
          }
          .avatar-emoji-perfil {
            font-size: 38px;
          }
          .nombre-perfil-txt {
            font-size: 1.1rem !important;
          }
          .edad-perfil-txt {
            font-size: 0.9rem !important;
          }
          .btn-progreso-perfil {
            padding: 7px 10px !important;
            font-size: 0.85rem !important;
            margin-top: 6px !important;
            border-radius: 14px !important;
          }
        }
      `}</style>

      {/* CABECERA */}
      <div className="cabecera-perfiles">
        <img 
          src={logoImg} 
          alt="LuliPop Logo" 
          className="logo-img-perfiles"
        />
        
        <button 
          onClick={() => supabase.auth.signOut()} 
          style={{ 
            padding: '8px 16px', 
            cursor: 'pointer',
            backgroundColor: '#FFFFFF',
            border: '2px solid white',
            borderRadius: '16px',
            fontWeight: '900',
            color: '#FF5E62',
            fontSize: '0.95rem',
            boxShadow: '0 4px 0 #E0E0E0, 0 6px 12px rgba(0,0,0,0.08)',
            fontFamily: '"Fredoka", sans-serif',
            transition: 'transform 0.1s'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
          onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          Salir 🚪
        </button>
      </div>

      <div style={{ maxWidth: '800px', width: '100%', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
        
        {/* 1. SECCIÓN PRINCIPAL: LISTADO DE PERFILES */}
        {perfiles.length > 0 && !mostrarFormulario && (
          <div className="glass-panel panel-principal-perfiles anim-fade-in" style={{ padding: '20px 22px', width: '100%', boxSizing: 'border-box' }}>
            <h3 className="titulo-perfiles" style={{ color: '#1E293B', fontSize: '1.55rem', margin: '0 0 4px 0', fontWeight: '900', textAlign: 'center' }}>
              ¿Quién va a jugar hoy?
            </h3>
            <p className="subtitulo-perfiles" style={{ color: '#475569', fontSize: '1rem', margin: '0 0 18px 0', textAlign: 'center', fontWeight: '600' }}>
              Toca tu avatar para entrar a Lulipop ✨
            </p>
            
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {perfiles.map((perfil, index) => {
                const colorEstilo = coloresBotones[index % coloresBotones.length];
                
                return (
                  <div key={perfil.id} className="tarjeta-perfil" style={{ position: 'relative' }}>

                    {/* Botones editar / eliminar */}
                    <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '4px', zIndex: 5 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); abrirFormularioEdicion(perfil); }}
                        title="Editar perfil"
                        style={{
                          width: '26px', height: '26px', borderRadius: '8px',
                          backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid white',
                          fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPerfilAEliminar(perfil); }}
                        title="Eliminar perfil"
                        style={{
                          width: '26px', height: '26px', borderRadius: '8px',
                          backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid white',
                          fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                        }}
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Insignia de racha diaria */}
                    {rachasPorPerfil[perfil.id] > 0 && (
                      <div style={{
                        position: 'absolute', top: '6px', left: '6px',
                        backgroundColor: '#FFF7ED', border: '1.5px solid #FED7AA', borderRadius: '10px',
                        padding: '2px 6px', display: 'flex', alignItems: 'center', gap: '2px', zIndex: 5
                      }}>
                        <span style={{ fontSize: '11px' }}>🔥</span>
                        <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#C2410C' }}>{rachasPorPerfil[perfil.id]}</span>
                      </div>
                    )}
                    
                    {/* Zona interactiva para entrar al juego */}
                    <div onClick={() => onSeleccionarPerfil(perfil)} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      width: '100%', 
                      gap: '4px',
                      marginTop: '6px'
                    }}>
                      <div className="avatar-emoji-perfil">
                        {perfil.avatar}
                      </div>
                      <h4 className="nombre-perfil-txt" style={{ margin: '0', color: '#1E293B', fontSize: '1.2rem', fontWeight: '900', lineHeight: '1.1' }}>
                        {perfil.nombre}
                      </h4>
                      <p className="edad-perfil-txt" style={{ margin: '0', color: '#94A3B8', fontSize: '0.95rem', fontWeight: '700' }}>
                        {perfil.edad} años
                      </p>
                      {perfil.limite_minutos > 0 && (
                        <div style={{
                          backgroundColor: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: '10px',
                          padding: '2px 7px', display: 'flex', alignItems: 'center', gap: '3px'
                        }}>
                          <span style={{ fontSize: '10px' }}>⏱️</span>
                          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#1D4ED8' }}>{perfil.limite_minutos}m/día</span>
                        </div>
                      )}
                    </div>

                    {/* Botón de estadísticas */}
                    <button 
                      className="btn-progreso-perfil"
                      onClick={(e) => { e.stopPropagation(); setPerfilEstadisticas(perfil); }}
                      style={{
                        backgroundColor: colorEstilo.bg,
                        color: 'white',
                        border: 'none',
                        borderRadius: '16px',
                        padding: '8px',
                        fontSize: '0.92rem',
                        fontWeight: '900',
                        cursor: 'pointer',
                        width: '100%',
                        boxShadow: `0 4px 0 ${colorEstilo.shadow}, 0 6px 10px rgba(0,0,0,0.08)`,
                        fontFamily: '"Fredoka", sans-serif',
                        marginTop: '8px',
                        transition: 'transform 0.1s'
                      }}
                      onMouseDown={e => e.currentTarget.style.transform = 'translateY(2px)'}
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

        {/* 2. FORMULARIO PARA AÑADIR O EDITAR NIÑOS */}
        {perfiles.length === 0 || mostrarFormulario ? (
          <div className="glass-panel anim-fade-in" style={{ padding: '22px 24px', width: '100%', maxWidth: '520px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1E293B', fontSize: '1.4rem', fontWeight: '900', textAlign: 'center' }}>
              {perfilEditando ? `Editar a ${perfilEditando.nombre} ✏️` : (perfiles.length === 0 ? '¡Crea el primer explorador! 🚀' : 'Añadir Nuevo Explorador 🚀')}
            </h3>
            
            <form onSubmit={guardarPerfil} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ fontWeight: '900', color: '#334155', marginLeft: '4px', marginBottom: '4px', display: 'block', fontSize: '0.9rem' }}>Nombre</label>
                  <input type="text" placeholder="Ej. Mateo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-moderno" required />
                </div>
                
                <div style={{ flex: 1 }}>
                  <label style={{ fontWeight: '900', color: '#334155', marginLeft: '4px', marginBottom: '4px', display: 'block', fontSize: '0.9rem' }}>Edad</label>
                  <input type="number" placeholder="Ej. 4" value={edad} onChange={(e) => setEdad(e.target.value)} className="input-moderno" required min="2" max="10" />
                </div>
              </div>

              <div>
                <label style={{ fontWeight: '900', color: '#334155', marginLeft: '4px', marginBottom: '4px', display: 'block', fontSize: '0.9rem' }}>
                  ⏱️ Límite diario (opcional)
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { etiqueta: 'Sin límite', valor: '' },
                    { etiqueta: '15m', valor: '15' },
                    { etiqueta: '30m', valor: '30' },
                    { etiqueta: '45m', valor: '45' },
                    { etiqueta: '60m', valor: '60' },
                  ].map((op) => (
                    <button
                      key={op.etiqueta}
                      type="button"
                      onClick={() => setLimiteMinutos(op.valor)}
                      style={{
                        padding: '6px 12px', borderRadius: '12px', cursor: 'pointer',
                        fontFamily: '"Fredoka", sans-serif', fontWeight: '800', fontSize: '0.85rem',
                        border: limiteMinutos === op.valor ? '2px solid #a18cd1' : '2px solid #E2E8F0',
                        backgroundColor: limiteMinutos === op.valor ? '#F3E8FF' : 'white',
                        color: limiteMinutos === op.valor ? '#7052a6' : '#64748b'
                      }}
                    >
                      {op.etiqueta}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: '900', color: '#334155', fontSize: '0.95rem' }}>Elige un Avatar:</p>
                <div style={{ display: 'flex', gap: '8px', fontSize: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {avataresDisponibles.map((emoji) => (
                    <span 
                      key={emoji} onClick={() => setAvatarSeleccionado(emoji)} 
                      style={{ 
                        cursor: 'pointer', padding: '6px', 
                        backgroundColor: avatarSeleccionado === emoji ? 'white' : 'rgba(255,255,255,0.5)',
                        border: avatarSeleccionado === emoji ? '3px solid #a18cd1' : '3px solid transparent', 
                        borderRadius: '18px', transition: 'all 0.2s',
                        transform: avatarSeleccionado === emoji ? 'scale(1.15)' : 'scale(1)',
                        boxShadow: avatarSeleccionado === emoji ? '0 6px 12px rgba(0,0,0,0.12)' : 'none'
                      }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                {perfiles.length > 0 && (
                  <button 
                    type="button" onClick={() => { setMostrarFormulario(false); setPerfilEditando(null); }}
                    style={{ flex: 1, backgroundColor: '#FFFFFF', color: '#64748b', padding: '10px', border: '2px solid #E2E8F0', borderRadius: '18px', cursor: 'pointer', fontSize: '0.95rem', fontWeight: '900', boxShadow: '0 4px 0 #CBD5E1', fontFamily: '"Fredoka", sans-serif' }}
                  >
                    Cancelar
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={guardandoPerfil}
                  style={{ flex: 2, backgroundColor: '#4ade80', color: 'white', padding: '10px', border: '2px solid white', borderRadius: '18px', cursor: 'pointer', fontSize: '1.05rem', fontWeight: '900', boxShadow: '0 5px 0 #27ae60', fontFamily: '"Fredoka", sans-serif' }}
                >
                  {guardandoPerfil ? 'Guardando...' : (perfilEditando ? '¡Guardar cambios! ✨' : '¡Guardar! ✨')}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* 3. BOTÓN PARA AÑADIR MÁS NIÑOS */
          <button 
            className="anim-fade-in" onClick={abrirFormularioNuevo}
            style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.75)', color: '#7052a6', padding: '12px 24px', 
              border: '3px dashed #a18cd1', borderRadius: '25px', cursor: 'pointer',
              fontSize: '1.05rem', fontWeight: '900', backdropFilter: 'blur(10px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: '"Fredoka", sans-serif', transition: 'all 0.2s',
              boxShadow: '0 8px 18px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.transform = 'scale(1.02)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.75)'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <span style={{ fontSize: '22px' }}>➕</span> Añadir explorador
          </button>
        )}

      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {perfilAEliminar && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(30, 41, 59, 0.55)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 500, padding: '16px', boxSizing: 'border-box'
        }}>
          <div className="glass-panel anim-fade-in" style={{
            backgroundColor: 'white', padding: '24px 22px', maxWidth: '340px', width: '100%',
            textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'
          }}>
            <div style={{ fontSize: '2.8rem' }}>😟</div>
            <h3 style={{ margin: 0, color: '#1E293B', fontSize: '1.25rem', fontWeight: '900' }}>
              ¿Eliminar a {perfilAEliminar.nombre}?
            </h3>
            <p style={{ margin: '0 0 10px 0', color: '#64748B', fontSize: '0.9rem', fontWeight: '600', lineHeight: '1.3' }}>
              Se borrará el perfil y su progreso. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={() => setPerfilAEliminar(null)}
                disabled={eliminando}
                style={{ flex: 1, backgroundColor: '#FFFFFF', color: '#64748b', padding: '10px', border: '2px solid #E2E8F0', borderRadius: '16px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 4px 0 #CBD5E1', fontFamily: '"Fredoka", sans-serif' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={eliminarPerfil}
                disabled={eliminando}
                style={{ flex: 1, backgroundColor: '#DC2626', color: 'white', padding: '10px', border: '2px solid white', borderRadius: '16px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '900', boxShadow: '0 4px 0 #991B1B', fontFamily: '"Fredoka", sans-serif' }}
              >
                {eliminando ? 'Borrando...' : '🗑️ Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
