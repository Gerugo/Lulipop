import { useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

const RECETAS = [
  {
    id: 'batido',
    nombre: 'Batido Tropical',
    emojiPlato: '🥤',
    color: '#FF9966',
    sombraColor: '#D9534F',
    ingredientes: ['🍌', '🍓', '🥛'],
    decoys: ['🥕', '🧀', '🍕'],
  },
  {
    id: 'ensalada',
    nombre: 'Ensalada Feliz',
    emojiPlato: '🥗',
    color: '#43e97b',
    sombraColor: '#27ae60',
    ingredientes: ['🍅', '🥒', '🧀', '🥬'],
    decoys: ['🍩', '🍫', '🍭'],
  },
  {
    id: 'pizza',
    nombre: 'Pizza de Lulipop',
    emojiPlato: '🍕',
    color: '#FFD166',
    sombraColor: '#CCAC00',
    ingredientes: ['🍞', '🧀', '🍅', '🍄', '🫒'],
    decoys: ['🍦', '🍬', '🍇'],
  },
]

function barajar(array) {
  const copia = [...array]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copia[i], copia[j]] = [copia[j], copia[i]]
  }
  return copia
}

// Sonidos sintetizados con Web Audio API
function useSonidos() {
  const ctxRef = useRef(null)

  const obtenerContexto = () => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) ctxRef.current = new AudioCtx()
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') {
      ctxRef.current.resume()
    }
    return ctxRef.current
  }

  const tono = (freq, inicio, duracion, tipo = 'sine', volumen = 0.18) => {
    const ctx = obtenerContexto()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = tipo
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0, ctx.currentTime + inicio)
    gain.gain.linearRampToValueAtTime(volumen, ctx.currentTime + inicio + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + duracion)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime + inicio)
    osc.stop(ctx.currentTime + inicio + duracion)
  }

  return {
    sonidoAcierto: () => { tono(660, 0, 0.12); tono(880, 0.1, 0.18) },
    sonidoError: () => { tono(180, 0, 0.18, 'sawtooth', 0.1) },
    sonidoVictoriaReceta: () => { tono(523, 0, 0.14); tono(659, 0.12, 0.14); tono(784, 0.24, 0.3) },
    sonidoVictoriaFinal: () => { tono(523, 0, 0.15); tono(659, 0.15, 0.15); tono(784, 0.3, 0.15); tono(1046, 0.45, 0.4) },
  }
}

export default function JuegoCocina({ perfil, onVolver }) {
  const [recetaIndex, setRecetaIndex] = useState(0)
  const [ingredientesTray, setIngredientesTray] = useState(() =>
    barajar(
      [...RECETAS[0].ingredientes, ...RECETAS[0].decoys].map((emoji, i) => ({ uid: `0-${i}-${emoji}`, emoji }))
    )
  )
  const [recolectados, setRecolectados] = useState([])
  const [estadoMascota, setEstadoMascota] = useState('feliz') // feliz | duda | celebra
  const [mensaje, setMensaje] = useState('')
  const [recetaCompleta, setRecetaCompleta] = useState(false)
  const [victoriaFinal, setVictoriaFinal] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [ingredienteAnimando, setIngredienteAnimando] = useState(null)

  const baseUrl = import.meta.env.BASE_URL
  const { sonidoAcierto, sonidoError, sonidoVictoriaReceta, sonidoVictoriaFinal } = useSonidos()

  const receta = RECETAS[recetaIndex]

  const iniciarReceta = (idx) => {
    const r = RECETAS[idx]
    const mezcla = barajar(
      [...r.ingredientes, ...r.decoys].map((emoji, i) => ({ uid: `${idx}-${i}-${emoji}`, emoji }))
    )
    setRecetaIndex(idx)
    setIngredientesTray(mezcla)
    setRecolectados([])
    setRecetaCompleta(false)
    setMensaje('')
    setEstadoMascota('feliz')
  }

  const guardarProgreso = async () => {
    if (!perfil?.id) return
    setGuardando(true)
    try {
      await supabase.from('progreso_actividades').insert([
        { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_cocina', completado: true, estrellas: 3 }
      ])
    } catch {
      // Silencioso: no bloqueamos la diversión del niño por un fallo de red
    }
    setGuardando(false)
  }

  const completarReceta = () => {
    sonidoVictoriaReceta()
    setEstadoMascota('celebra')
    setRecetaCompleta(true)

    setTimeout(() => {
      if (recetaIndex < RECETAS.length - 1) {
        iniciarReceta(recetaIndex + 1)
      } else {
        sonidoVictoriaFinal()
        setVictoriaFinal(true)
        guardarProgreso()
      }
    }, 2200)
  }

  const tocarIngrediente = (item) => {
    if (recetaCompleta || victoriaFinal) return

    const yaEsNecesario = receta.ingredientes.includes(item.emoji)
    const yaRecolectado = recolectados.includes(item.emoji)

    if (yaEsNecesario && !yaRecolectado) {
      sonidoAcierto()
      setIngredienteAnimando(item.uid)
      setEstadoMascota('celebra')
      setMensaje('¡Muy bien! 🌟')

      setTimeout(() => {
        const nuevos = [...recolectados, item.emoji]
        setRecolectados(nuevos)
        setIngredientesTray((prev) => prev.filter((i) => i.uid !== item.uid))
        setIngredienteAnimando(null)
        setEstadoMascota('feliz')
        setMensaje('')

        if (nuevos.length === receta.ingredientes.length) {
          setTimeout(() => completarReceta(), 250)
        }
      }, 420)
    } else if (!yaEsNecesario) {
      sonidoError()
      setEstadoMascota('duda')
      setMensaje('¡Ese no toca! Prueba otro 😊')
      setTimeout(() => {
        setEstadoMascota('feliz')
        setMensaje('')
      }, 900)
    }
  }

  const reiniciarTodo = () => {
    setVictoriaFinal(false)
    iniciarReceta(0)
  }

  const emojiMascota = estadoMascota === 'celebra' ? '🎉' : estadoMascota === 'duda' ? '🤔' : '👨‍🍳'

  return (
    <div style={{
      minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', padding: '20px', boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        .anim-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

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

        .anim-vuela-al-plato { animation: volarAlPlato 0.42s cubic-bezier(0.55, 0, 1, 0.45) forwards; }
        @keyframes volarAlPlato {
          0% { transform: scale(1) translateY(0); opacity: 1; }
          100% { transform: scale(0.3) translateY(-120px); opacity: 0; }
        }

        .anim-flota-mascota { animation: flotarMascota 3.5s ease-in-out infinite; }
        @keyframes flotarMascota {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-14px) rotate(2deg); }
        }

        .anim-slot-lleno { animation: slotLleno 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        @keyframes slotLleno { 0% { transform: scale(0); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }

        .anim-confeti { animation: caeConfeti linear forwards; }
        @keyframes caeConfeti {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(340px) rotate(360deg); opacity: 0; }
        }

        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(15px);
          border: 6px solid white;
          border-radius: 40px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .btn-header-cocina {
          width: 55px; height: 55px; border-radius: 18px;
          background-color: #FFFFFF; color: #FF5E62; border: none;
          font-size: 24px; cursor: pointer;
          box-shadow: 0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15);
          display: flex; align-items: center; justify-content: center;
        }

        .panel-receta-cocina {
          padding: 16px 20px;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          position: relative;
        }

        @media (max-height: 550px) {
          .contenedor-juego-cocina {
            padding: 8px 14px !important;
          }
          .btn-header-cocina {
            width: 42px !important;
            height: 42px !important;
            font-size: 18px !important;
            border-radius: 12px !important;
          }
          .badge-progreso-cocina {
            padding: 4px 12px !important;
            border-radius: 16px !important;
          }
          .area-juego-cocina {
            margin-top: 4px !important;
            max-width: 580px !important;
          }
          .titulo-receta-cocina {
            font-size: 1.2rem !important;
            margin: 2px 0 6px 0 !important;
          }
          .panel-receta-cocina {
            padding: 6px 14px !important;
            gap: 6px !important;
            border-radius: 20px !important;
          }
          .slot-ingrediente-cocina {
            width: 44px !important;
            height: 44px !important;
            font-size: 1.5rem !important;
            border-radius: 14px !important;
          }
          .img-mascota-cocina {
            width: 50px !important;
          }
          .btn-ingrediente {
            width: 52px !important;
            height: 52px !important;
            font-size: 1.8rem !important;
            border-radius: 16px !important;
          }
          .bandeja-ingredientes-cocina {
            margin-top: 6px !important;
            gap: 10px !important;
          }
        }
      `}</style>

      {/* HEADER */}
      <div style={{ position: 'relative', width: '100%', maxWidth: '650px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button
          onClick={onVolver}
          className="btn-header-cocina"
        >
          ❮
        </button>

        {!victoriaFinal && (
          <div className="glass-panel badge-progreso-cocina" style={{ padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>{perfil?.avatar || '👦'}</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {RECETAS.map((r, idx) => (
                <div key={r.id} style={{
                  width: '14px', height: '14px', borderRadius: '50%',
                  backgroundColor: idx < recetaIndex ? '#43e97b' : idx === recetaIndex ? '#FFD166' : '#E2E8F0',
                  border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  transform: idx === recetaIndex ? 'scale(1.25)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }} />
              ))}
            </div>
          </div>
        )}
      </div>

      {!victoriaFinal ? (
        <div className="anim-pop" key={receta.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px', marginTop: '20px', flex: 1 }}>

          <h2 style={{ color: '#334155', fontSize: '2rem', margin: '10px 0', fontWeight: '900', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            {receta.emojiPlato} {receta.nombre}
          </h2>

          {/* TARJETA DE RECETA: plato con huecos a rellenar */}
          <div className="glass-panel" style={{ padding: '20px 25px', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', position: 'relative' }}>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {receta.ingredientes.map((emoji, idx) => {
                const relleno = recolectados.includes(emoji)
                return (
                  <div key={idx} className={relleno ? 'anim-slot-lleno' : ''} style={{
                    width: '68px', height: '68px', borderRadius: '20px',
                    backgroundColor: relleno ? receta.color : 'rgba(255,255,255,0.6)',
                    border: `3px dashed ${relleno ? receta.color : '#CBD5E1'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '2.2rem',
                    boxShadow: relleno ? `0 8px 0 ${receta.sombraColor}` : 'none',
                    transition: 'background-color 0.3s'
                  }}>
                    {relleno ? emoji : '❓'}
                  </div>
                )
              })}
            </div>

            {/* Mascota cocinera */}
            <div className="anim-flota-mascota" style={{ marginTop: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              <img
                src={`${baseUrl}assets/mascota.png`}
                alt="Mascota cocinera"
                style={{ width: '110px', height: 'auto', filter: 'drop-shadow(0 12px 15px rgba(0,0,0,0.25))' }}
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block' }}
              />
              <span style={{ display: 'none', fontSize: '90px' }}>{emojiMascota}</span>
              <span style={{ position: 'absolute', top: '-14px', right: '-18px', fontSize: '34px' }}>
                {estadoMascota === 'celebra' ? '🎉' : estadoMascota === 'duda' ? '🤔' : ''}
              </span>
            </div>

            <div style={{ height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {mensaje && (
                <div className="anim-pop" style={{
                  backgroundColor: estadoMascota === 'duda' ? '#FEF2F2' : '#F0FDF4',
                  padding: '8px 24px', borderRadius: '25px',
                  border: `3px solid ${estadoMascota === 'duda' ? '#FF6B6B' : '#43e97b'}`,
                  fontWeight: '800', fontSize: '1.1rem',
                  color: estadoMascota === 'duda' ? '#DC2626' : '#16A34A'
                }}>
                  {mensaje}
                </div>
              )}
            </div>
          </div>

          {/* BANDEJA DE INGREDIENTES */}
          <div style={{ marginTop: '20px', display: 'flex', gap: '18px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '520px' }}>
            {ingredientesTray.map((item) => (
              <button
                key={item.uid}
                className={`btn-ingrediente ${ingredienteAnimando === item.uid ? 'anim-vuela-al-plato' : ''}`}
                onClick={() => tocarIngrediente(item)}
              >
                {item.emoji}
              </button>
            ))}
          </div>

          {/* CELEBRACIÓN DE RECETA COMPLETADA */}
          {recetaCompleta && (
            <div className="anim-pop" style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255,255,255,0.95)', padding: '30px 45px', borderRadius: '35px',
              border: '5px solid #FFD166', boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              textAlign: 'center', zIndex: 50
            }}>
              <div style={{ fontSize: '4rem' }}>{receta.emojiPlato}</div>
              <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#334155', marginTop: '8px' }}>
                ¡{receta.nombre} lista! 🎉
              </div>
              <div style={{ fontSize: '1.8rem', marginTop: '6px' }}>⭐️⭐️⭐️</div>
            </div>
          )}

        </div>
      ) : (
        /* PANTALLA DE VICTORIA FINAL */
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(15px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className="anim-confeti" style={{
              position: 'absolute', top: 0, left: `${(i * 100) / 18}%`,
              fontSize: `${20 + (i % 3) * 8}px`,
              animationDuration: `${1.6 + (i % 5) * 0.3}s`,
              animationDelay: `${(i % 6) * 0.15}s`
            }}>
              {['🎉', '⭐️', '🎈', '✨'][i % 4]}
            </span>
          ))}

          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '110px', filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.3))' }}>👨‍🍳</div>
            <h1 style={{
              color: '#FFD166', fontSize: '3.4rem', margin: '15px 0 8px 0',
              textShadow: '0 8px 0 #CCAC00, 0 15px 25px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900'
            }}>¡Chef estrella!</h1>
            <p style={{
              color: '#4facfe', fontSize: '1.5rem', fontWeight: '900', margin: '0 0 30px 0',
              backgroundColor: 'white', padding: '12px 30px', borderRadius: '35px',
              border: '4px solid #E0F2FE', boxShadow: '0 8px 0 #bae6fd'
            }}>
              ¡Preparaste las {RECETAS.length} recetas! 🍽️
            </p>

            <div style={{ display: 'flex', gap: '15px' }}>
              <button
                onClick={reiniciarTodo}
                style={{
                  padding: '16px 35px', fontSize: '1.3rem', fontWeight: '900',
                  background: 'linear-gradient(135deg, #FFD166 0%, #FFB347 100%)', color: '#7A5C00',
                  border: '4px solid white', borderRadius: '35px', cursor: 'pointer',
                  boxShadow: '0 8px 0 #CCAC00, 0 16px 25px rgba(0,0,0,0.2)',
                  fontFamily: '"Fredoka", sans-serif'
                }}
              >
                🔁 Cocinar de nuevo
              </button>
              <button
                onClick={onVolver}
                style={{
                  padding: '16px 35px', fontSize: '1.3rem', fontWeight: '900',
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
