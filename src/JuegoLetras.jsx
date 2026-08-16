import { useState } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import NivelSelector from './NivelSelector'
import useMejoresNiveles from './useMejoresNiveles'

const VOCALES = [
  { letra: 'A', palabra: 'Avión', emoji: '✈️', opciones: ['A', 'E', 'O'], color: '#FF5E62' },
  { letra: 'E', palabra: 'Elefante', emoji: '🐘', opciones: ['I', 'E', 'U'], color: '#4facfe' },
  { letra: 'I', palabra: 'Iglú', emoji: '❄️', opciones: ['A', 'I', 'O'], color: '#FFD166' },
  { letra: 'O', palabra: 'Oso', emoji: '🐻', opciones: ['O', 'E', 'A'], color: '#FF9966' },
  { letra: 'U', palabra: 'Uvas', emoji: '🍇', opciones: ['U', 'I', 'E'], color: '#a18cd1' },
]

const CONSONANTES = [
  { letra: 'M', palabra: 'Mono', emoji: '🐒', opciones: ['M', 'N', 'H'], color: '#FF5E62' },
  { letra: 'S', palabra: 'Sol', emoji: '☀️', opciones: ['S', 'Z', 'C'], color: '#4facfe' },
  { letra: 'P', palabra: 'Pato', emoji: '🦆', opciones: ['P', 'B', 'D'], color: '#FFD166' },
  { letra: 'L', palabra: 'Luna', emoji: '🌙', opciones: ['L', 'R', 'N'], color: '#FF9966' },
  { letra: 'T', palabra: 'Tigre', emoji: '🐯', opciones: ['T', 'D', 'P'], color: '#a18cd1' },
]

const MEZCLA = [
  { letra: 'A', palabra: 'Avión', emoji: '✈️', opciones: ['A', 'E', 'O', 'U'], color: '#FF5E62' },
  { letra: 'M', palabra: 'Mono', emoji: '🐒', opciones: ['M', 'N', 'H', 'P'], color: '#4facfe' },
  { letra: 'O', palabra: 'Oso', emoji: '🐻', opciones: ['O', 'E', 'A', 'U'], color: '#FFD166' },
  { letra: 'S', palabra: 'Sol', emoji: '☀️', opciones: ['S', 'Z', 'C', 'T'], color: '#FF9966' },
  { letra: 'I', palabra: 'Iglú', emoji: '❄️', opciones: ['A', 'I', 'O', 'E'], color: '#a18cd1' },
  { letra: 'T', palabra: 'Tigre', emoji: '🐯', opciones: ['T', 'D', 'P', 'L'], color: '#43e97b' },
  { letra: 'U', palabra: 'Uvas', emoji: '🍇', opciones: ['U', 'I', 'E', 'O'], color: '#00d2d3' },
  { letra: 'L', palabra: 'Luna', emoji: '🌙', opciones: ['L', 'R', 'N', 'M'], color: '#FF758C' },
]

const NIVELES = [
  { id: 'facil', nombre: 'Fácil', descripcion: 'Vocales A-E-I-O-U', emoji: '🌱', color: '#43e97b', sombra: '#27ae60', palabras: VOCALES },
  { id: 'medio', nombre: 'Medio', descripcion: 'Consonantes sencillas', emoji: '🌿', color: '#4facfe', sombra: '#005580', palabras: CONSONANTES },
  { id: 'dificil', nombre: 'Difícil', descripcion: 'Mezcla de letras', emoji: '🌳', color: '#FF9966', sombra: '#D9534F', palabras: MEZCLA },
]

const coloresBotones = [
  { bg: '#FF5E62', shadow: '#C0392B', text: '#FFFFFF' },
  { bg: '#4facfe', shadow: '#005580', text: '#FFFFFF' },
  { bg: '#FFD166', shadow: '#CCAC00', text: '#7A5C00' },
  { bg: '#a18cd1', shadow: '#6b4c9a', text: '#FFFFFF' },
]

export default function JuegoLetras({ perfil, onVolver }) {
  const [nivelId, setNivelId] = useState(null)
  const [indice, setIndice] = useState(0)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [estadoRespuesta, setEstadoRespuesta] = useState(null) // 'correcto' | 'incorrecto'
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const { mejores, guardarMejorNivel } = useMejoresNiveles('letras', perfil?.id)
  const nivel = NIVELES.find((n) => n.id === nivelId)
  const palabras = nivel?.palabras || []
  const actual = palabras[indice]

  const empezarNivel = (id) => {
    setNivelId(id)
    setIndice(0)
    setVictoria(false)
  }

  const verificar = (letraElegida) => {
    if (seleccionado) return
    setSeleccionado(letraElegida)

    if (letraElegida === actual.letra) {
      setEstadoRespuesta('correcto')
      setMensaje('¡Súper! 🌟')

      setTimeout(() => {
        setSeleccionado(null)
        setEstadoRespuesta(null)
        setMensaje('')

        if (indice + 1 < palabras.length) {
          setIndice(prev => prev + 1)
        } else {
          setVictoria(true)
          guardarMejorNivel(nivelId, 3)
          guardarProgreso()
        }
      }, 1200)
    } else {
      setEstadoRespuesta('incorrecto')
      setMensaje('¡Casi! Inténtalo de nuevo 💪')

      setTimeout(() => {
        setSeleccionado(null)
        setEstadoRespuesta(null)
        setMensaje('')
      }, 1000)
    }
  }

  const guardarProgreso = async () => {
    if (!perfil?.id) return
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'letras_vocabulario', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  if (!nivel) {
    return (
      <NivelSelector
        onVolver={onVolver}
        emojiJuego="🔤"
        titulo="Letras y Sonidos"
        subtitulo="Elige tu reto"
        niveles={NIVELES}
        mejores={mejores}
        onSeleccionar={empezarNivel}
      />
    )
  }

  return (
    <div style={{ 
      minHeight: '100vh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', padding: '20px', boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');
        
        .anim-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        
        .anim-flotar { animation: flotar 3s ease-in-out infinite; }
        @keyframes flotar {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }
        
        .anim-shake { animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both; }
        @keyframes shake {
          10%, 90% { transform: translate3d(-2px, 0, 0); }
          20%, 80% { transform: translate3d(4px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-6px, 0, 0); }
          40%, 60% { transform: translate3d(6px, 0, 0); }
        }

        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        .anim-estrella { animation: rotaEstrella 3s linear infinite; }
        @keyframes rotaEstrella { 100% { transform: rotate(360deg); } }

        .btn-arcilla {
          width: 90px; height: 90px;
          border-radius: 28px;
          font-size: 2.7rem;
          font-weight: 900;
          cursor: pointer;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          border: 4px solid rgba(255,255,255,0.5);
          display: flex; justify-content: center; align-items: center;
        }
        .btn-arcilla:active {
          transform: translateY(8px) scale(0.92) !important;
          box-shadow: 0 0 0 transparent !important;
        }

        /* Glassmorphism panel */
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(15px);
          border: 6px solid white;
          border-radius: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
      `}</style>

      {/* HEADER: Botón Volver, Nivel y Progreso */}
      <div style={{ position: 'absolute', top: '25px', left: '25px', right: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button 
          onClick={nivelId ? () => setNivelId(null) : onVolver}
          style={{ 
            width: '60px', height: '60px', borderRadius: '20px',
            backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
            fontSize: '26px', cursor: 'pointer',
            boxShadow: '0 8px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ❮
        </button>

        {!victoria && (
          <div className="glass-panel" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '12px', border: '4px solid white', borderRadius: '25px' }}>
            <span style={{ fontSize: '20px', backgroundColor: nivel.color, borderRadius: '10px', padding: '4px 8px' }}>{nivel.emoji}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {palabras.map((_, idx) => (
                <div key={idx} style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  backgroundColor: idx < indice ? '#43e97b' : idx === indice ? '#FFD166' : '#E2E8F0',
                  border: '3px solid white', boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transform: idx === indice ? 'scale(1.3)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {!victoria ? (
        <div className="anim-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '550px', marginTop: '40px' }}>
          
          {/* Tarjeta de Pregunta */}
          <div className="glass-panel" style={{
            padding: '35px 40px',
            marginBottom: '35px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div className="anim-flotar" style={{ 
              fontSize: '100px', 
              filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.2))',
              background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
              borderRadius: '50%', padding: '20px'
            }}>
              {actual.emoji}
            </div>
            <h2 style={{ color: '#334155', fontSize: '2.2rem', margin: 0, fontWeight: '900', lineHeight: '1.2' }}>
              ¿Con qué letra empieza <br/>
              <span style={{ color: actual.color, fontSize: '2.8rem', textShadow: '0 4px 0 rgba(0,0,0,0.1)' }}>{actual.palabra}</span>?
            </h2>
          </div>

          {/* Opciones de letras (Botones Arcilla 3D) */}
          <div className={estadoRespuesta === 'incorrecto' ? 'anim-shake' : ''} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {actual.opciones.map((letra, idx) => {
              const estiloColor = coloresBotones[idx % coloresBotones.length]
              const esSeleccionado = seleccionado === letra
              const esCorrecto = esSeleccionado && estadoRespuesta === 'correcto'
              const esIncorrecto = esSeleccionado && estadoRespuesta === 'incorrecto'

              let bg = estiloColor.bg
              let shadow = estiloColor.shadow
              let transform = 'scale(1)'

              if (esCorrecto) {
                bg = '#43e97b'; shadow = '#27ae60'; transform = 'scale(1.1)';
              } else if (esIncorrecto) {
                bg = '#FF6B6B'; shadow = '#C0392B'; transform = 'scale(0.95)';
              }

              return (
                <button 
                  key={letra}
                  className="btn-arcilla"
                  onClick={() => verificar(letra)}
                  disabled={seleccionado !== null}
                  style={{
                    backgroundColor: bg,
                    color: estiloColor.text,
                    boxShadow: `inset 0px -8px 0px ${shadow}, inset 0px 4px 0px rgba(255,255,255,0.4), 0px 15px 25px rgba(0,0,0,0.2)`,
                    transform: transform
                  }}
                >
                  {letra}
                </button>
              )
            })}
          </div>

          {/* Feedback Visual Interactivo */}
          <div style={{ height: '60px', marginTop: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {mensaje && (
              <div className="anim-pop" style={{ 
                backgroundColor: estadoRespuesta === 'correcto' ? '#F0FDF4' : '#FEF2F2', 
                padding: '12px 35px', borderRadius: '30px', border: `4px solid ${estadoRespuesta === 'correcto' ? '#43e97b' : '#FF6B6B'}`,
                fontWeight: '900', fontSize: '1.5rem', color: estadoRespuesta === 'correcto' ? '#16A34A' : '#DC2626',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
              }}>
                {mensaje}
              </div>
            )}
          </div>

        </div>
      ) : (
        /* PANTALLA DE VICTORIA */
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(15px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '120px', filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.3))' }}>🌟</div>
            <h1 style={{
              color: '#FFD166', fontSize: '5rem', margin: '20px 0 10px 0',
              textShadow: '0 8px 0 #CCAC00, 0 15px 25px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '3px', fontWeight: '900'
            }}>¡Súper!</h1>
            <p style={{ 
              color: '#4facfe', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 30px 0', 
              backgroundColor: 'white', padding: '12px 35px', borderRadius: '35px', 
              border: '4px solid #E0F2FE', boxShadow: '0 8px 0 #bae6fd' 
            }}>
              ¡Nivel {nivel.nombre} completado!
            </p>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button 
                onClick={() => setNivelId(null)}
                style={{ 
                  padding: '16px 35px', fontSize: '1.4rem', fontWeight: '900',
                  background: 'linear-gradient(135deg, #FFD166 0%, #FFB347 100%)', color: '#7A5C00', 
                  border: '4px solid white', borderRadius: '35px', cursor: 'pointer',
                  boxShadow: '0 8px 0 #CCAC00, 0 16px 25px rgba(0,0,0,0.2)',
                  fontFamily: '"Fredoka", sans-serif'
                }}
              >
                🔁 Otro nivel
              </button>
              <button 
                onClick={onVolver}
                style={{ 
                  padding: '16px 35px', fontSize: '1.4rem', fontWeight: '900',
                  background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white', 
                  border: '4px solid white', borderRadius: '35px', cursor: 'pointer',
                  boxShadow: '0 8px 0 #27ae60, 0 16px 25px rgba(0,0,0,0.2)',
                  fontFamily: '"Fredoka", sans-serif'
                }}
              >
                {guardando ? 'Guardando... ⏳' : '¡Continuar! 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
