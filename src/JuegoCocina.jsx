import { useState, useRef } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import NivelSelector from './NivelSelector'
import useMejoresNiveles from './useMejoresNiveles'

const RECETAS = [
  {
    id: 'batido',
    nombre: '1. Batido Tropical',
    descripcion: '3 ingredientes dulces',
    emoji: '🥤',
    color: '#FF9966',
    sombra: '#D9534F',
    ingredientes: ['🍌', '🍓', '🥛'],
    decoys: ['🥕', '🧀', '🍕'],
  },
  {
    id: 'ensalada',
    nombre: '2. Ensalada Feliz',
    descripcion: '4 vegetales crujientes',
    emoji: '🥗',
    color: '#43e97b',
    sombra: '#27ae60',
    ingredientes: ['🍅', '🥒', '🧀', '🥬'],
    decoys: ['🍩', '🍫', '🍭'],
  },
  {
    id: 'pizza',
    nombre: '3. Pizza de Lulipop',
    descripcion: '5 ingredientes deliciosos',
    emoji: '🍕',
    color: '#FFD166',
    sombra: '#CCAC00',
    ingredientes: ['🍞', '🧀', '🍅', '🍄', '🫒'],
    decoys: ['🍦', '🍬', '🍇'],
  },
  {
    id: 'pastel',
    nombre: '4. Pastelito Mágico',
    descripcion: '4 ingredientes de repostería',
    emoji: '🧁',
    color: '#FF6B81',
    sombra: '#D9385E',
    ingredientes: ['🥚', '🥛', '🍓', '🍫'],
    decoys: ['🥦', '🧅', '🧄'],
  }
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
  const [recetaId, setRecetaId] = useState(null)
  const [recetaIndex, setRecetaIndex] = useState(0)
  const [ingredientesTray, setIngredientesTray] = useState([])
  const [recolectados, setRecolectados] = useState([])
  const [estadoMascota, setEstadoMascota] = useState('feliz') // feliz | duda | celebra
  const [mensaje, setMensaje] = useState('')
  const [recetaCompleta, setRecetaCompleta] = useState(false)
  const [ingredienteAnimando, setIngredienteAnimando] = useState(null)

  const baseUrl = import.meta.env.BASE_URL
  const { sonidoAcierto, sonidoError, sonidoVictoriaReceta } = useSonidos()
  const { mejores, guardarMejorNivel } = useMejoresNiveles('cocina', perfil?.id)

  const receta = RECETAS[recetaIndex] || RECETAS[0]

  const iniciarReceta = (idx) => {
    const r = RECETAS[idx] || RECETAS[0]
    const mezcla = barajar(
      [...r.ingredientes, ...r.decoys].map((emoji, i) => ({ uid: `${idx}-${i}-${emoji}`, emoji }))
    )
    setRecetaId(r.id)
    setRecetaIndex(idx)
    setIngredientesTray(mezcla)
    setRecolectados([])
    setRecetaCompleta(false)
    setMensaje('')
    setEstadoMascota('feliz')
  }

  const guardarProgreso = async (rId) => {
    if (!perfil?.id) return
    guardarMejorNivel(rId, 3)
    try {
      await supabase.from('progreso_actividades').insert([
        { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: `cocina_${rId}`, completado: true, estrellas: 3 }
      ])
    } catch {
      // Silencioso
    }
  }

  const completarReceta = () => {
    sonidoVictoriaReceta()
    setEstadoMascota('celebra')
    setRecetaCompleta(true)
    guardarProgreso(receta.id)
  }

  const tocarIngrediente = (item) => {
    if (recetaCompleta) return

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
      setMensaje('¡Ese no es! 🤔')
      setTimeout(() => {
        setEstadoMascota('feliz')
        setMensaje('')
      }, 900)
    }
  }

  // SELECTOR DE RECETAS
  if (!recetaId) {
    return (
      <NivelSelector
        onVolver={onVolver}
        emojiJuego="🍳"
        titulo="Cocina Feliz"
        subtitulo="Elige tu receta para cocinar"
        niveles={RECETAS}
        mejores={mejores}
        onSeleccionar={(id) => {
          const idx = RECETAS.findIndex(r => r.id === id)
          if (idx !== -1) iniciarReceta(idx)
        }}
      />
    )
  }

  const faltantes = receta.ingredientes.filter((ing) => !recolectados.includes(ing))

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        width: '100vw', height: '100dvh', minHeight: '100dvh',
        backgroundImage: `url(${fondoImg})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: '"Fredoka", sans-serif',
        userSelect: 'none', overflow: 'hidden', padding: '14px', boxSizing: 'border-box', zIndex: 10
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        .anim-pop { animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .anim-victoria { animation: victoriaBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoriaBounce { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

        .anim-ingrediente-volando {
          animation: volarHaciaOlla 0.42s ease-in forwards;
        }
        @keyframes volarHaciaOlla {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35) translateY(-25px); opacity: 0.9; }
          100% { transform: scale(0.2) translateY(50px); opacity: 0; }
        }

        .anim-burbujas-olla {
          animation: hervor 1.4s ease-in-out infinite alternate;
        }
        @keyframes hervor {
          0% { transform: scale(1); }
          100% { transform: scale(1.04); }
        }

        .btn-ingrediente {
          transition: transform 0.12s, box-shadow 0.12s;
          cursor: pointer;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-ingrediente:active {
          transform: scale(0.92);
        }

        @media (max-height: 550px) {
          .btn-header-cocina { width: 40px !important; height: 40px !important; font-size: 18px !important; border-radius: 12px !important; }
          .badge-cabecera-cocina { padding: 4px 14px !important; font-size: 0.95rem !important; border-radius: 16px !important; }
          .olla-cocina-caja { width: 140px !important; height: 140px !important; }
          .mascota-cocina-img { width: 90px !important; height: 90px !important; }
        }
      `}</style>

      {/* HEADER SUPERIOR */}
      <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button
          onClick={() => setRecetaId(null)}
          className="btn-header-cocina"
          style={{
            width: '52px', height: '52px', borderRadius: '18px',
            backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none',
            fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)'
          }}
        >
          ❮
        </button>

        <div className="badge-cabecera-cocina" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: '8px 22px', borderRadius: '25px',
          border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>{receta.emoji}</span>
          <span style={{ fontWeight: '900', color: '#334155', fontSize: '1.15rem' }}>{receta.nombre}</span>
          <span style={{ backgroundColor: '#FFD166', color: '#7A5C00', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900' }}>
            {recolectados.length}/{receta.ingredientes.length}
          </span>
        </div>

        <div style={{ width: '52px' }} />
      </div>

      {/* ZONA CENTRAL: OLLA MÁGICA Y MASCOTA */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px',
        width: '100%', maxWidth: '750px', zIndex: 15, position: 'relative'
      }}>
        {/* MASCOTA CHEF */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {mensaje && (
            <div className="anim-pop" style={{
              backgroundColor: 'white', padding: '4px 12px', borderRadius: '14px',
              fontSize: '0.88rem', fontWeight: '900', color: '#1e293b', boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
              marginBottom: '4px', whiteSpace: 'nowrap'
            }}>
              {mensaje}
            </div>
          )}
          <img
            src={`${baseUrl}assets/mascota-${estadoMascota === 'celebra' ? 'celebra' : 'feliz'}.png`}
            alt="Mascota Chef"
            className="mascota-cocina-img"
            style={{ width: '110px', height: '110px', objectFit: 'contain', filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.2))' }}
            onError={(e) => {
              e.currentTarget.src = `${baseUrl}assets/Logosinfondo.png`
            }}
          />
        </div>

        {/* OLLA / TAZÓN DE PREPARACIÓN */}
        <div className="olla-cocina-caja anim-burbujas-olla" style={{
          width: 'clamp(160px, 32vw, 220px)', height: 'clamp(160px, 32vw, 220px)',
          borderRadius: '50%', backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: `6px solid ${receta.color}`, boxShadow: `0 12px 0 ${receta.sombraColor}, 0 20px 30px rgba(0,0,0,0.15)`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          position: 'relative'
        }}>
          <div style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}>
            {recetaCompleta ? receta.emojiPlato || receta.emoji : '🍲'}
          </div>
          <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80%' }}>
            {recolectados.map((emoji, idx) => (
              <span key={idx} className="anim-pop" style={{ fontSize: '1.4rem' }}>{emoji}</span>
            ))}
          </div>
        </div>

        {/* INGREDIENTES FALTANTES (GUÍA) */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '8px 14px', borderRadius: '20px',
          border: '3px solid white', display: 'flex', flexDirection: 'column', gap: '4px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '0.78rem', fontWeight: '900', color: '#64748b' }}>Faltan:</span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {faltantes.map((emoji, idx) => (
              <span key={idx} style={{ fontSize: '1.6rem' }}>{emoji}</span>
            ))}
          </div>
        </div>
      </div>

      {/* BANDEJA INFERIOR DE INGREDIENTES */}
      <div style={{
        width: '100%', maxWidth: '800px', backgroundColor: 'rgba(255, 255, 255, 0.92)',
        borderRadius: '28px', padding: '10px 16px', border: '4px solid white',
        boxShadow: '0 10px 25px rgba(0,0,0,0.12)', display: 'flex', gap: '10px',
        alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', zIndex: 20
      }}>
        {ingredientesTray.map((item) => {
          const esAnimando = ingredienteAnimando === item.uid
          return (
            <button
              key={item.uid}
              onClick={() => tocarIngrediente(item)}
              className={`btn-ingrediente ${esAnimando ? 'anim-ingrediente-volando' : ''}`}
              style={{
                width: 'clamp(52px, 11vw, 68px)', height: 'clamp(52px, 11vw, 68px)',
                borderRadius: '20px', backgroundColor: 'white', border: '3px solid #E2E8F0',
                fontSize: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 5px 0 #CBD5E1, 0 8px 12px rgba(0,0,0,0.08)'
              }}
            >
              {item.emoji}
            </button>
          )
        })}
      </div>

      {/* MODAL DE VICTORIA AL COMPLETAR RECETA */}
      {recetaCompleta && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="anim-victoria" style={{
            backgroundColor: 'white', borderRadius: '35px', padding: '30px 24px', maxWidth: '380px', width: '100%',
            textAlign: 'center', border: '6px solid #FFD166', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ fontSize: '70px', marginBottom: '6px' }}>{receta.emoji}🎉</div>
            <h2 style={{ color: '#1E293B', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 6px 0' }}>
              ¡Chef Estrella!
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', margin: '0 0 14px 0', fontWeight: '700' }}>
              ¡Completaste <b>{receta.nombre}</b>! 😋
            </p>
            <div style={{ fontSize: '2.4rem', marginBottom: '20px' }}>⭐⭐⭐</div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => iniciarReceta(recetaIndex)}
                style={{
                  flex: 1, backgroundColor: '#FFD166', color: '#7A5C00', border: '3px solid white',
                  borderRadius: '20px', padding: '12px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer',
                  boxShadow: '0 6px 0 #CCAC00', fontFamily: '"Fredoka", sans-serif'
                }}
              >
                🔁 Repetir
              </button>
              <button
                onClick={() => setRecetaId(null)}
                style={{
                  flex: 1, backgroundColor: '#38ef7d', color: '#064e3b', border: '3px solid white',
                  borderRadius: '20px', padding: '12px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer',
                  boxShadow: '0 6px 0 #11998e', fontFamily: '"Fredoka", sans-serif'
                }}
              >
                🍽️ Más recetas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
