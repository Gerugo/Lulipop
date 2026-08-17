import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabaseClient'
import useMejoresNiveles from './useMejoresNiveles'
import NivelSelector from './NivelSelector'

const baseUrl = import.meta.env.BASE_URL

// FIGURAS DE CONSTELACIONES PARA NIVEL 1
const CONSTELACIONES = [
  {
    id: 'estrella',
    nombre: 'Estrella Fugaz',
    emoji: '⭐',
    puntos: [
      { x: 50, y: 18, label: '1' },
      { x: 62, y: 45, label: '2' },
      { x: 90, y: 48, label: '3' },
      { x: 68, y: 68, label: '4' },
      { x: 78, y: 92, label: '5' },
      { x: 50, y: 76, label: '6' },
      { x: 22, y: 92, label: '7' },
      { x: 32, y: 68, label: '8' },
      { x: 10, y: 48, label: '9' },
      { x: 38, y: 45, label: '10' }
    ]
  },
  {
    id: 'corazon',
    nombre: 'Corazón Cósmico',
    emoji: '💖',
    puntos: [
      { x: 50, y: 35, label: '1' },
      { x: 35, y: 18, label: '2' },
      { x: 18, y: 28, label: '3' },
      { x: 16, y: 52, label: '4' },
      { x: 50, y: 88, label: '5' },
      { x: 84, y: 52, label: '6' },
      { x: 82, y: 28, label: '7' },
      { x: 65, y: 18, label: '8' }
    ]
  },
  {
    id: 'cohete',
    nombre: 'Cohete Estelar',
    emoji: '🚀',
    puntos: [
      { x: 50, y: 15, label: '1' },
      { x: 68, y: 38, label: '2' },
      { x: 68, y: 70, label: '3' },
      { x: 85, y: 85, label: '4' },
      { x: 50, y: 78, label: '5' },
      { x: 15, y: 85, label: '6' },
      { x: 32, y: 70, label: '7' },
      { x: 32, y: 38, label: '8' }
    ]
  }
]

const NIVELES = [
  {
    id: 'constelaciones',
    nombre: '1. Constelaciones Mágicas',
    descripcion: 'Une las estrellas y descubre figuras',
    emoji: '✨',
    color: '#38ef7d',
    sombra: '#11998e'
  },
  {
    id: 'recolector',
    nombre: '2. Polvo de Estrellas',
    descripcion: 'Pilota la nave y atrapa gemas cósmicas',
    emoji: '🚀',
    color: '#4facfe',
    sombra: '#0083B0'
  },
  {
    id: 'aterrizaje',
    nombre: '3. Planeta Caramelo',
    descripcion: 'Aterriza y conoce al amigo Marcianito',
    emoji: '🪐',
    color: '#FF6B81',
    sombra: '#D9385E'
  }
]

export default function JuegoEspacio({ perfil, onVolver }) {
  const [nivelId, setNivelId] = useState(null)
  const [victoria, setVictoria] = useState(false)
  const [puntos, setPuntos] = useState(0)
  const [particulas, setParticulas] = useState([])

  // Estado Nivel 1 (Constelaciones)
  const [indiceConstelacion, setIndiceConstelacion] = useState(0)
  const [pasoEstrella, setPasoEstrella] = useState(0)
  const [lineasDibujadas, setLineasDibujadas] = useState([])
  const [constelacionCompletada, setConstelacionCompletada] = useState(false)

  // Estado Nivel 2 (Recolector)
  const [naveX, setNaveX] = useState(50) // Porcentaje 0 a 100
  const [gemas, setGemas] = useState([])
  const [gemasRecogidas, setGemasRecogidas] = useState(0)
  const META_GEMAS = 12

  // Estado Nivel 3 (Aterrizaje)
  const [pasoAterrizaje, setPasoAterrizaje] = useState(0) // 0 a 4
  const [aterrizado, setAterrizado] = useState(false)
  const [propulsion, setPropulsion] = useState(false)

  const particulaIdRef = useRef(0)
  const gemaIdRef = useRef(0)

  const audioCtxRef = useRef(null)
  const { mejores, guardarMejorNivel } = useMejoresNiveles('espacio', perfil?.id)

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      audioCtxRef.current = new AudioCtx()
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume()
    }
    return audioCtxRef.current
  }, [])

  // AUDIO SINTETIZADO
  const reproducirCampana = useCallback((frecuencia = 440) => {
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(frecuencia, now)

      gain.gain.setValueAtTime(0.4, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.85)
    } catch { /* continuar */ }
  }, [getAudioContext])

  const reproducirMotor = useCallback(() => {
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(110, now)
      osc.frequency.linearRampToValueAtTime(220, now + 0.3)

      gain.gain.setValueAtTime(0.35, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.45)
    } catch { /* continuar */ }
  }, [getAudioContext])

  const reproducirVictoria = useCallback(() => {
    const escala = [523.25, 659.25, 783.99, 1046.50]
    escala.forEach((freq, i) => {
      setTimeout(() => reproducirCampana(freq), i * 150)
    })
  }, [reproducirCampana])

  const ganarNivel = useCallback(() => {
    setVictoria(true)
    reproducirVictoria()
    if (nivelId) {
      guardarMejorNivel(nivelId, 3)
      if (perfil?.id) {
        supabase.from('progreso_actividades').insert([
          { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: `espacio_${nivelId}`, completado: true, estrellas: 3 }
        ]).then(() => {})
      }
    }
  }, [nivelId, reproducirVictoria, guardarMejorNivel, perfil])

  const lanzarParticula = (x, y, emoji = '✨') => {
    const id = ++particulaIdRef.current
    setParticulas(prev => [...prev, { id, x, y, emoji }])
    setTimeout(() => setParticulas(prev => prev.filter(p => p.id !== id)), 800)
  }

  // --- LÓGICA NIVEL 1: CONSTELACIONES ---
  const tocarEstrella = (index, e) => {
    const constActual = CONSTELACIONES[indiceConstelacion]
    if (index === pasoEstrella) {
      const notas = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00]
      const freq = notas[index % notas.length]
      reproducirCampana(freq)

      if (e) {
        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2)
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2)
        lanzarParticula(clientX, clientY, '⭐')
      }

      const nuevoPaso = pasoEstrella + 1
      if (pasoEstrella > 0) {
        setLineasDibujadas(prev => [...prev, {
          desde: constActual.puntos[pasoEstrella - 1],
          hasta: constActual.puntos[pasoEstrella]
        }])
      }

      if (nuevoPaso >= constActual.puntos.length) {
        setLineasDibujadas(prev => [...prev, {
          desde: constActual.puntos[constActual.puntos.length - 1],
          hasta: constActual.puntos[0]
        }])
        setConstelacionCompletada(true)
        setPuntos(prev => prev + 30)

        setTimeout(() => {
          if (indiceConstelacion + 1 < CONSTELACIONES.length) {
            setIndiceConstelacion(prev => prev + 1)
            setPasoEstrella(0)
            setLineasDibujadas([])
            setConstelacionCompletada(false)
          } else {
            ganarNivel()
          }
        }, 1200)
      } else {
        setPasoEstrella(nuevoPaso)
      }
    }
  }

  // --- LÓGICA NIVEL 2: RECOLECTOR DE GEMAS ---
  // Inicializar gemas inmediatamente al entrar
  useEffect(() => {
    if (nivelId !== 'recolector') return

    const tipos = ['💎', '⭐', '🍭', '✨', '🪐']
    const iniciales = [
      { id: ++gemaIdRef.current, x: 20, y: 15, emoji: tipos[0] },
      { id: ++gemaIdRef.current, x: 50, y: 30, emoji: tipos[1] },
      { id: ++gemaIdRef.current, x: 80, y: 10, emoji: tipos[2] },
      { id: ++gemaIdRef.current, x: 35, y: 48, emoji: tipos[3] },
      { id: ++gemaIdRef.current, x: 65, y: 62, emoji: tipos[4] }
    ]
    setGemas(iniciales)
  }, [nivelId])

  // Bucle continuo de movimiento y spawn de gemas
  useEffect(() => {
    if (nivelId !== 'recolector' || victoria) return

    const tipos = ['💎', '⭐', '🍭', '✨', '🪐']

    const intervaloGemas = setInterval(() => {
      const gId = ++gemaIdRef.current
      setGemas(prev => {
        if (prev.length >= 8) return prev
        return [
          ...prev,
          {
            id: gId,
            x: Math.random() * 75 + 12,
            y: -8,
            emoji: tipos[Math.floor(Math.random() * tipos.length)]
          }
        ]
      })
    }, 700)

    const intervaloMovimiento = setInterval(() => {
      setGemas(prev => {
        const actualizadas = []
        for (const g of prev) {
          const ny = g.y + 0.9 // Descenso suave y relajado
          // Detección de choque con la nave (nave en Y ~ 75%)
          if (ny >= 65 && ny <= 88 && Math.abs(g.x - naveX) < 18) {
            reproducirCampana(587.33)
            setGemasRecogidas(c => {
              const nuevo = c + 1
              if (nuevo >= META_GEMAS) {
                ganarNivel()
              }
              return nuevo
            })
            setPuntos(p => p + 10)
          } else if (ny < 102) {
            actualizadas.push({ ...g, y: ny })
          }
        }
        return actualizadas
      })
    }, 40)

    return () => {
      clearInterval(intervaloGemas)
      clearInterval(intervaloMovimiento)
    }
  }, [nivelId, victoria, naveX, reproducirCampana, ganarNivel])

  // Atrapado directo al pulsar sobre una estrella
  const atraparGemaDirecta = (g, e) => {
    e.stopPropagation()
    reproducirCampana(659.25)
    setGemas(prev => prev.filter(x => x.id !== g.id))
    lanzarParticula(e.clientX || window.innerWidth / 2, e.clientY || window.innerHeight / 2, g.emoji)
    setGemasRecogidas(c => {
      const nuevo = c + 1
      if (nuevo >= META_GEMAS) {
        ganarNivel()
      }
      return nuevo
    })
    setPuntos(p => p + 10)
  }

  // --- LÓGICA NIVEL 3: ATERRIZAJE ---
  const alturasNavePorPaso = [10, 26, 42, 58, 70] // % de altura de descenso
  const alturaActualNave = alturasNavePorPaso[pasoAterrizaje] || 10

  const descenderNave = () => {
    if (aterrizado || victoria) return
    reproducirMotor()
    setPropulsion(true)
    setTimeout(() => setPropulsion(false), 250)

    const siguientePaso = pasoAterrizaje + 1
    setPasoAterrizaje(siguientePaso)

    if (siguientePaso >= 4) {
      setAterrizado(true)
      setTimeout(() => {
        ganarNivel()
      }, 1000)
    }
  }

  const iniciarNivel = (id) => {
    setNivelId(id)
    setVictoria(false)
    setPasoEstrella(0)
    setLineasDibujadas([])
    setIndiceConstelacion(0)
    setConstelacionCompletada(false)
    setGemasRecogidas(0)
    setPasoAterrizaje(0)
    setAterrizado(false)
    setNaveX(50)
  }

  // SELECTOR DE NIVELES
  if (!nivelId) {
    return (
      <NivelSelector
        onVolver={onVolver}
        emojiJuego="🚀"
        titulo="Mundo Espacial"
        subtitulo="¡Elige tu aventura en el cosmos!"
        niveles={NIVELES}
        mejores={mejores}
        onSeleccionar={iniciarNivel}
      />
    )
  }

  const constActual = CONSTELACIONES[indiceConstelacion]

  return (
    <div className="juego-espacio-raiz" style={{
      height: '100dvh', minHeight: '100dvh', width: '100vw',
      background: 'radial-gradient(circle at 50% 20%, #2e1065 0%, #1e1b4b 45%, #0f172a 100%)',
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      alignItems: 'center', fontFamily: '"Fredoka", sans-serif',
      boxSizing: 'border-box', padding: '14px', overflow: 'hidden', userSelect: 'none'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        /* ANIMACIONES DE NEBULOSA Y ESTRELLAS */
        .nebulosa-globo {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: 0.45;
          pointer-events: none;
          animation: flotarNebulosa 8s ease-in-out infinite alternate;
        }
        @keyframes flotarNebulosa {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(25px, -20px) scale(1.15); }
        }

        .estrella-fondo {
          position: absolute;
          border-radius: 50%;
          background-color: white;
          pointer-events: none;
          animation: parpadeoEstrella 3s ease-in-out infinite alternate;
        }
        @keyframes parpadeoEstrella {
          0% { opacity: 0.25; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.4); filter: drop-shadow(0 0 6px #FFF); }
          100% { opacity: 0.35; transform: scale(0.9); }
        }

        /* ESTRELLA FUGAZ */
        .estrella-fugaz-anim {
          position: absolute;
          top: 15%;
          left: -100px;
          width: 90px;
          height: 3px;
          background: linear-gradient(90deg, #FFFFFF, rgba(255, 209, 102, 0.8), transparent);
          border-radius: 50%;
          transform: rotate(-30deg);
          animation: disparoFugaz 7s ease-in-out infinite;
          opacity: 0;
          pointer-events: none;
        }
        @keyframes disparoFugaz {
          0% { left: -100px; top: 12%; opacity: 0; }
          10% { opacity: 1; }
          25% { left: 110vw; top: 45%; opacity: 0; }
          100% { left: 110vw; top: 45%; opacity: 0; }
        }

        .anim-pop { animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .anim-victoria { animation: victoriaBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoriaBounce { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

        .estrella-constelacion {
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .estrella-activa {
          animation: pulsoEstrella 0.8s ease-in-out infinite alternate;
        }
        @keyframes pulsoEstrella {
          0% { transform: translate(-50%, -50%) scale(1); filter: drop-shadow(0 0 8px #FFD166); }
          100% { transform: translate(-50%, -50%) scale(1.35); filter: drop-shadow(0 0 20px #FFF) drop-shadow(0 0 35px #FFD166); }
        }

        .particula-espacio {
          position: fixed;
          pointer-events: none;
          font-size: 34px;
          animation: subirParticula 0.8s ease-out forwards;
          z-index: 100;
        }
        @keyframes subirParticula {
          0% { transform: translate(-50%, -50%) translateY(0) scale(0.5); opacity: 1; }
          100% { transform: translate(-50%, -50%) translateY(-80px) scale(1.4); opacity: 0; }
        }

        @keyframes flotarAlien {
          0%, 100% { transform: translateY(0) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }

        @keyframes rayoTractorAnim {
          0%, 100% { opacity: 0.5; transform: scaleX(1); }
          50% { opacity: 0.85; transform: scaleX(1.15); }
        }

        @media (max-height: 550px) {
          .juego-espacio-raiz { padding: 6px 12px !important; }
          .header-barra-espacio { margin-bottom: 4px !important; }
          .btn-header-espacio { width: 40px !important; height: 40px !important; font-size: 18px !important; border-radius: 12px !important; }
          .badge-cabecera-espacio { padding: 4px 14px !important; font-size: 0.95rem !important; border-radius: 16px !important; }
          .nave-recolector { width: 90px !important; height: 90px !important; }
          .alien-aterrizaje { width: 75px !important; height: 75px !important; }
        }
      `}</style>

      {/* NEBULOSAS MÁGICAS DE COLORES EN EL FONDO */}
      <div className="nebulosa-globo" style={{ width: '320px', height: '320px', backgroundColor: '#EC4899', top: '-60px', left: '-50px' }} />
      <div className="nebulosa-globo" style={{ width: '380px', height: '380px', backgroundColor: '#8B5CF6', bottom: '-80px', right: '-60px', animationDelay: '-3s' }} />
      <div className="nebulosa-globo" style={{ width: '280px', height: '280px', backgroundColor: '#06B6D4', top: '30%', right: '15%', opacity: 0.35, animationDelay: '-5s' }} />
      <div className="nebulosa-globo" style={{ width: '220px', height: '220px', backgroundColor: '#F59E0B', bottom: '15%', left: '20%', opacity: 0.25, animationDelay: '-2s' }} />

      {/* ESTRELLAS TITILANTES DECORATIVAS EN EL FONDO */}
      <div className="estrella-fondo" style={{ top: '12%', left: '15%', width: '5px', height: '5px', animationDelay: '0s' }} />
      <div className="estrella-fondo" style={{ top: '22%', left: '80%', width: '7px', height: '7px', animationDelay: '1.2s', backgroundColor: '#FFD166' }} />
      <div className="estrella-fondo" style={{ top: '45%', left: '10%', width: '6px', height: '6px', animationDelay: '0.6s' }} />
      <div className="estrella-fondo" style={{ top: '65%', left: '88%', width: '5px', height: '5px', animationDelay: '1.8s', backgroundColor: '#F472B6' }} />
      <div className="estrella-fondo" style={{ top: '80%', left: '25%', width: '6px', height: '6px', animationDelay: '0.9s', backgroundColor: '#38BDF8' }} />
      <div className="estrella-fondo" style={{ top: '30%', left: '48%', width: '4px', height: '4px', animationDelay: '2.1s' }} />
      <div className="estrella-fondo" style={{ top: '75%', left: '60%', width: '5px', height: '5px', animationDelay: '1.5s', backgroundColor: '#FFD166' }} />
      <div className="estrella-fondo" style={{ top: '18%', left: '35%', width: '6px', height: '6px', animationDelay: '0.4s' }} />

      {/* ESTRELLA FUGAZ ANIMADA */}
      <div className="estrella-fugaz-anim" />
      <div className="estrella-fugaz-anim" style={{ animationDelay: '3.5s', top: '35%' }} />

      {/* PARTÍCULAS FLOTANTES */}
      {particulas.map(p => (
        <div key={p.id} className="particula-espacio" style={{ left: p.x, top: p.y }}>
          {p.emoji}
        </div>
      ))}

      {/* CABECERA */}
      <div className="header-barra-espacio" style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button 
          onClick={() => setNivelId(null)}
          className="btn-header-espacio"
          style={{
            width: '52px', height: '52px', borderRadius: '18px',
            backgroundColor: '#FFFFFF', color: '#38ef7d', border: 'none',
            fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)'
          }}
        >
          ❮
        </button>

        <div className="badge-cabecera-espacio" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: '8px 22px', borderRadius: '25px',
          border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {nivelId === 'constelaciones' && (
            <>
              <span style={{ fontSize: '24px' }}>{constActual.emoji}</span>
              <span style={{ fontWeight: '900', color: '#1E293B', fontSize: '1.15rem' }}>{constActual.nombre}</span>
              <span style={{ backgroundColor: '#38ef7d', color: '#064e3b', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900' }}>
                {pasoEstrella} / {constActual.puntos.length}
              </span>
            </>
          )}
          {nivelId === 'recolector' && (
            <>
              <span style={{ fontSize: '24px' }}>💎</span>
              <span style={{ fontWeight: '900', color: '#1E293B', fontSize: '1.15rem' }}>Gemas: {gemasRecogidas} / {META_GEMAS}</span>
            </>
          )}
          {nivelId === 'aterrizaje' && (
            <>
              <span style={{ fontSize: '24px' }}>🪐</span>
              <span style={{ fontWeight: '900', color: '#1E293B', fontSize: '1.15rem' }}>
                {aterrizado ? '¡Aterrizaje Exitoso!' : `Descenso: ${pasoAterrizaje}/4`}
              </span>
            </>
          )}
        </div>

        <div className="badge-cabecera-espacio" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: '8px 18px', borderRadius: '25px',
          border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span style={{ fontSize: '20px' }}>⭐</span>
          <span style={{ color: '#FFD166', fontWeight: '900', fontSize: '1.25rem', textShadow: '0 2px 0 #CCAC00' }}>{puntos}</span>
        </div>
      </div>

      {/* --- NIVEL 1: CONSTELACIONES --- */}
      {nivelId === 'constelaciones' && (
        <div style={{ position: 'relative', width: '100%', maxWidth: '650px', height: 'clamp(260px, 60vh, 480px)', margin: 'auto', zIndex: 15 }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {lineasDibujadas.map((l, i) => (
              <line 
                key={i}
                x1={`${l.desde.x}%`} y1={`${l.desde.y}%`}
                x2={`${l.hasta.x}%`} y2={`${l.hasta.y}%`}
                stroke="#FFD166" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={constelacionCompletada ? 'none' : '6, 6'}
                style={{ filter: 'drop-shadow(0 0 8px #FFD166)' }}
              />
            ))}
          </svg>

          {constActual.puntos.map((pt, idx) => {
            const esActiva = idx === pasoEstrella
            const esVisitada = idx < pasoEstrella || constelacionCompletada

            return (
              <div
                key={idx}
                onPointerDown={(e) => tocarEstrella(idx, e)}
                className={`estrella-constelacion ${esActiva ? 'estrella-activa' : ''}`}
                style={{
                  position: 'absolute', left: `${pt.x}%`, top: `${pt.y}%`,
                  transform: 'translate(-50%, -50%)',
                  width: esActiva ? '52px' : '42px', height: esActiva ? '52px' : '42px',
                  borderRadius: '50%',
                  backgroundColor: esVisitada ? '#FFD166' : esActiva ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                  border: esActiva ? '4px solid #FFD166' : '3px solid white',
                  boxShadow: esActiva ? '0 0 25px #FFD166' : '0 4px 10px rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '900', fontSize: '1.2rem', color: esVisitada ? '#7A5C00' : '#1E293B'
                }}
              >
                {pt.label}
              </div>
            )
          })}
        </div>
      )}

      {/* --- NIVEL 2: RECOLECTOR DE GEMAS --- */}
      {nivelId === 'recolector' && (
        <div 
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * 100
            setNaveX(Math.max(12, Math.min(88, x)))
          }}
          onTouchMove={(e) => {
            if (e.touches && e.touches[0]) {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = ((e.touches[0].clientX - rect.left) / rect.width) * 100
              setNaveX(Math.max(12, Math.min(88, x)))
            }
          }}
          style={{ position: 'relative', width: '100%', maxWidth: '850px', height: 'clamp(260px, 70vh, 520px)', margin: 'auto', overflow: 'hidden', touchAction: 'none' }}
        >
          {/* INSTRUCCIÓN VISUAL */}
          <div style={{ position: 'absolute', top: '10px', width: '100%', textAlign: 'center', pointerEvents: 'none', color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem', fontWeight: '700' }}>
            ✨ ¡Mueve el cohete o toca las estrellas flotantes para atraparlas! ✨
          </div>

          {/* GEMAS FLOTANTES */}
          {gemas.map(g => (
            <div 
              key={g.id}
              onClick={(e) => atraparGemaDirecta(g, e)}
              style={{
                position: 'absolute', left: `${g.x}%`, top: `${g.y}%`,
                transform: 'translate(-50%, -50%)', fontSize: '42px', cursor: 'pointer',
                filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.9))',
                transition: 'transform 0.1s', zIndex: 12
              }}
            >
              {g.emoji}
            </div>
          ))}

          {/* COHETE ESPACIAL CONTROLABLE (GRANDE Y LUMINOSO) */}
          <div 
            className="nave-recolector"
            style={{
              position: 'absolute', left: `${naveX}%`, bottom: '15px',
              transform: 'translateX(-50%)', width: 'clamp(100px, 20vw, 135px)', height: 'clamp(100px, 20vw, 135px)',
              transition: 'left 0.05s ease-out', pointerEvents: 'none', zIndex: 15
            }}
          >
            {/* RAYO TRACTOR DE LUZ */}
            <div style={{
              position: 'absolute', bottom: '60%', left: '50%', transform: 'translateX(-50%)',
              width: '140px', height: '180px',
              background: 'linear-gradient(to top, rgba(79, 172, 254, 0.35), rgba(79, 172, 254, 0))',
              clipPath: 'polygon(30% 100%, 70% 100%, 100% 0%, 0% 0%)',
              animation: 'rayoTractorAnim 1.8s ease-in-out infinite'
            }} />

            <img 
              src={`${baseUrl}assets/cohete.png`} 
              alt="Cohete"
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 0 20px #4facfe)' }}
            />
          </div>
        </div>
      )}

      {/* --- NIVEL 3: ATERRIZAJE EN EL PLANETA (ESPACIOSO Y SIN SOLAPAMIENTOS) --- */}
      {nivelId === 'aterrizaje' && (
        <div style={{
          position: 'relative', width: '100%', maxWidth: '850px', height: 'clamp(280px, 72vh, 520px)',
          margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between'
        }}>
          {/* NAVE DESCENDIENDO */}
          <div style={{
            position: 'absolute', top: `${alturaActualNave}%`, left: '50%',
            transform: 'translateX(-50%)', width: 'clamp(95px, 18vw, 130px)', height: 'clamp(95px, 18vw, 130px)',
            transition: 'top 0.4s cubic-bezier(0.2, 0.8, 0.4, 1)', zIndex: 18
          }}>
            <img 
              src={`${baseUrl}assets/cohete.png`} 
              alt="Cohete"
              style={{ width: '100%', height: '100%', objectFit: 'contain', filter: propulsion ? 'drop-shadow(0 15px 25px #FF6B81) drop-shadow(0 0 30px #FFD166)' : 'drop-shadow(0 6px 14px rgba(0,0,0,0.4))' }}
            />
            {propulsion && (
              <div style={{ position: 'absolute', bottom: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '32px' }}>
                🔥
              </div>
            )}
          </div>

          {/* ESCENARIO INFERIOR: PLANETA Y MARCIANITO */}
          <div style={{
            position: 'absolute', bottom: '0px', width: '100%',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '14px', zIndex: 10
          }}>
            {/* MARCIANITO ANFITRIÓN */}
            <div className="anim-pop alien-aterrizaje" style={{ width: 'clamp(85px, 16vw, 115px)', height: 'clamp(85px, 16vw, 115px)', animation: 'flotarAlien 2.5s ease-in-out infinite', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ backgroundColor: 'white', color: '#1E293B', padding: '3px 8px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: '900', boxShadow: '0 4px 10px rgba(0,0,0,0.2)', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                {aterrizado ? '¡Hurra! 🎉' : '¡Aterriza aquí! 👋'}
              </div>
              <img 
                src={`${baseUrl}assets/alien.png`} 
                alt="Marcianito Lulipop"
                style={{ width: '100%', height: '100%', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))' }}
              />
            </div>

            {/* PLANETA DE CARAMELO */}
            <img 
              src={`${baseUrl}assets/planeta.png`} 
              alt="Planeta Dulce"
              style={{ width: 'clamp(170px, 35vw, 260px)', objectFit: 'contain', filter: 'drop-shadow(0 0 25px rgba(255, 107, 129, 0.4))' }}
            />
          </div>

          {/* BOTÓN FLOTANTE DE CONTROL DE MOTOR (SEPARADO Y CLARO) */}
          {!aterrizado && (
            <div style={{ position: 'absolute', top: '15px', right: '15px', zIndex: 25 }}>
              <button
                onClick={descenderNave}
                style={{
                  backgroundColor: '#FF6B81', color: 'white',
                  border: '3px solid white', borderRadius: '24px', padding: '12px 22px',
                  fontFamily: '"Fredoka", sans-serif', fontWeight: '900', fontSize: '1.1rem',
                  cursor: 'pointer', boxShadow: '0 6px 0 #D9385E, 0 10px 20px rgba(0,0,0,0.3)',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}
              >
                🔥 ¡Frenar y Aterrizar!
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL DE VICTORIA */}
      {victoria && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(9, 10, 15, 0.75)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="anim-victoria" style={{
            backgroundColor: 'white', borderRadius: '35px', padding: '30px 24px', maxWidth: '380px', width: '100%',
            textAlign: 'center', border: '6px solid #38ef7d', boxShadow: '0 25px 50px rgba(0,0,0,0.4)'
          }}>
            <div style={{ fontSize: '70px', marginBottom: '8px' }}>🚀✨</div>
            <h2 style={{ color: '#1E293B', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 6px 0' }}>
              ¡Misión Cumplida!
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', margin: '0 0 14px 0', fontWeight: '700' }}>
              ¡Eres un auténtico Explorador del Espacio!
            </p>
            <div style={{ fontSize: '2.4rem', marginBottom: '20px' }}>⭐⭐⭐</div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => iniciarNivel(nivelId)}
                style={{
                  flex: 1, backgroundColor: '#FFD166', color: '#7A5C00', border: '3px solid white',
                  borderRadius: '20px', padding: '12px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer',
                  boxShadow: '0 6px 0 #CCAC00', fontFamily: '"Fredoka", sans-serif'
                }}
              >
                🔁 Repetir
              </button>
              <button
                onClick={() => setNivelId(null)}
                style={{
                  flex: 1, backgroundColor: '#38ef7d', color: '#064e3b', border: '3px solid white',
                  borderRadius: '20px', padding: '12px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer',
                  boxShadow: '0 6px 0 #11998e', fontFamily: '"Fredoka", sans-serif'
                }}
              >
                🪐 Misiones
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
