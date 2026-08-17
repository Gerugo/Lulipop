import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import useMejoresNiveles from './useMejoresNiveles'

const baseUrl = import.meta.env.BASE_URL

// NOTAS MUSICALES (Escala de Do Mayor)
const NOTAS = [
  { id: 'DO', nombre: 'DO', notaTxt: 'C4', freq: 261.63, color: '#FF5E62', sombra: '#D9385E', emoji: '🍎', tecla: '1' },
  { id: 'RE', nombre: 'RE', notaTxt: 'D4', freq: 293.66, color: '#FF9F43', sombra: '#E58E26', emoji: '🍊', tecla: '2' },
  { id: 'MI', nombre: 'MI', notaTxt: 'E4', freq: 329.63, color: '#FFD166', sombra: '#CCAC00', emoji: '🍋', tecla: '3' },
  { id: 'FA', nombre: 'FA', notaTxt: 'F4', freq: 349.23, color: '#48DBFB', sombra: '#0ABDE3', emoji: '🫐', tecla: '4' },
  { id: 'SOL', nombre: 'SOL', notaTxt: 'G4', freq: 392.00, color: '#1DD1A1', sombra: '#10AC84', emoji: '🍏', tecla: '5' },
  { id: 'LA', nombre: 'LA', notaTxt: 'A4', freq: 440.00, color: '#54A0FF', sombra: '#2E86DE', emoji: '🍇', tecla: '6' },
  { id: 'SI', nombre: 'SI', notaTxt: 'B4', freq: 493.88, color: '#9B5DE5', sombra: '#7B3CC4', emoji: '🍆', tecla: '7' },
  { id: 'DO2', nombre: 'DO+', notaTxt: 'C5', freq: 523.25, color: '#FF6B81', sombra: '#D9385E', emoji: '🍓', tecla: '8' }
]

// INSTRUMENTOS
const INSTRUMENTOS = [
  { id: 'piano', nombre: 'Piano Mágico', emoji: '🎹', color: '#FF5E62' },
  { id: 'xilofono', nombre: 'Xilófono', emoji: '🔔', color: '#FFD166' },
  { id: 'animales', nombre: 'Gatito Miau', emoji: '🐱', color: '#1DD1A1' },
  { id: 'campanas', nombre: 'Campanitas', emoji: '✨', color: '#9B5DE5' }
]

// CANCIONES GUIADAS
const CANCIONES = [
  {
    id: 'estrellita',
    titulo: 'Estrellita dónde estás',
    emoji: '⭐',
    nivel: 'Fácil',
    color: '#FFD166',
    sombra: '#CCAC00',
    notas: ['DO', 'DO', 'SOL', 'SOL', 'LA', 'LA', 'SOL', 'FA', 'FA', 'MI', 'MI', 'RE', 'RE', 'DO']
  },
  {
    id: 'cumpleanos',
    titulo: 'Cumpleaños Feliz',
    emoji: '🎂',
    nivel: 'Medio',
    color: '#FF9F43',
    sombra: '#E58E26',
    notas: ['DO', 'DO', 'RE', 'DO', 'FA', 'MI', 'DO', 'DO', 'RE', 'DO', 'SOL', 'FA']
  },
  {
    id: 'pollitos',
    titulo: 'Los Pollitos Dicen',
    emoji: '🐣',
    nivel: 'Difícil',
    color: '#1DD1A1',
    sombra: '#10AC84',
    notas: ['DO', 'RE', 'MI', 'FA', 'SOL', 'SOL', 'LA', 'LA', 'LA', 'LA', 'SOL', 'FA', 'FA', 'MI', 'MI', 'RE', 'RE', 'DO']
  }
]

export default function JuegoMusica({ perfil, onVolver }) {
  const [modo, setModo] = useState('menu') // 'menu', 'libre', 'canciones', 'selector_canciones'
  const [cancionSeleccionada, setCancionSeleccionada] = useState(null)
  const [pasoCancion, setPasoCancion] = useState(0)
  const [instrumento, setInstrumento] = useState('piano')
  const [puntos, setPuntos] = useState(0)
  const [victoria, setVictoria] = useState(false)
  const [teclaPulsada, setTeclaPulsada] = useState(null)
  const [particulas, setParticulas] = useState([])
  
  // Grabadora
  const [grabando, setGrabando] = useState(false)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [grabacion, setGrabacion] = useState([])
  const tiempoInicioGrabacion = useRef(null)

  const audioCtxRef = useRef(null)
  const { mejores, guardarMejorNivel } = useMejoresNiveles('musica', perfil?.id)

  // Obtener o inicializar AudioContext tras interacción del usuario
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

  // SINTETIZADOR WEB AUDIO PARA LOS 4 TIMBRES
  const reproducirTono = useCallback((freq, tipoInstrumento = instrumento) => {
    try {
      const ctx = getAudioContext()
      const now = ctx.currentTime

      if (tipoInstrumento === 'piano') {
        // PIANO: Onda triangular con decaimiento cálido natural
        const osc = ctx.createOscillator()
        const oscArmonico = ctx.createOscillator()
        const gainNode = ctx.createGain()
        const gainArmonico = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, now)

        oscArmonico.type = 'sine'
        oscArmonico.frequency.setValueAtTime(freq * 2, now)

        gainNode.gain.setValueAtTime(0.7, now)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2)

        gainArmonico.gain.setValueAtTime(0.2, now)
        gainArmonico.gain.exponentialRampToValueAtTime(0.001, now + 0.6)

        osc.connect(gainNode)
        oscArmonico.connect(gainArmonico)
        gainNode.connect(ctx.destination)
        gainArmonico.connect(ctx.destination)

        osc.start(now)
        oscArmonico.start(now)
        osc.stop(now + 1.25)
        oscArmonico.stop(now + 0.65)
      } 
      else if (tipoInstrumento === 'xilofono') {
        // XILÓFONO: Ataque brillante percusivo y cuerpo resonante
        const osc = ctx.createOscillator()
        const oscMetal = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now)

        oscMetal.type = 'sine'
        oscMetal.frequency.setValueAtTime(freq * 3.8, now)

        gainNode.gain.setValueAtTime(0.9, now)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.7)

        osc.connect(gainNode)
        oscMetal.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc.start(now)
        oscMetal.start(now)
        osc.stop(now + 0.75)
        oscMetal.stop(now + 0.3)
      } 
      else if (tipoInstrumento === 'animales') {
        // GATITO MIAU: Modulación de frecuencia con curva vocal juguetona
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.type = 'sawtooth'
        // Pitch bend característico del miau (sube y baja ligeramente)
        osc.frequency.setValueAtTime(freq * 0.9, now)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.35, now + 0.18)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.5)

        // Filtro pasa bajos para suavizar el timbre
        const filter = ctx.createBiquadFilter()
        filter.type = 'lowpass'
        filter.frequency.setValueAtTime(1400, now)

        gainNode.gain.setValueAtTime(0.55, now)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.55)

        osc.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.6)
      } 
      else if (tipoInstrumento === 'campanas') {
        // CAMPANITAS MÁGICAS: Arpegio armónico resplandeciente
        [1, 2.01, 3.02, 4.05].forEach((mult, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq * mult, now)
          gain.gain.setValueAtTime(0.3 / (idx + 1), now)
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.4)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(now)
          osc.stop(now + 1.45)
        })
      }
    } catch (e) {
      console.warn("Audio Context error:", e)
    }
  }, [getAudioContext, instrumento])

  // CREAR PARTÍCULAS DE NOTAS FLOTANTES
  const lanzarParticula = (x, y, emoji) => {
    const id = Date.now() + Math.random()
    const emojisNotas = ['🎵', '🎶', '⭐', '✨', '💖', '🌈']
    const icono = emoji || emojisNotas[Math.floor(Math.random() * emojisNotas.length)]
    
    setParticulas(prev => [...prev, { id, x, y, icono }])
    setTimeout(() => {
      setParticulas(prev => prev.filter(p => p.id !== id))
    }, 900)
  }

  // TOCAR NOTA INTERACTIVA
  const tocarNota = (notaObj, e) => {
    reproducirTono(notaObj.freq)
    setTeclaPulsada(notaObj.id)
    setTimeout(() => setTeclaPulsada(null), 250)

    // Partícula en la posición tocada
    if (e) {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2)
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2)
      lanzarParticula(clientX, clientY, notaObj.emoji)
    }

    // Si estamos grabando en modo libre
    if (grabando) {
      const offsetMs = Date.now() - tiempoInicioGrabacion.current
      setGrabacion(prev => [...prev, { nota: notaObj, tiempo: offsetMs }])
    }

    // Si estamos en modo cancionero guiado
    if (modo === 'canciones' && cancionSeleccionada && !victoria) {
      const notaEsperada = cancionSeleccionada.notas[pasoCancion]
      if (notaObj.id === notaEsperada) {
        setPuntos(prev => prev + 10)
        const siguientePaso = pasoCancion + 1
        
        if (siguientePaso >= cancionSeleccionada.notas.length) {
          // Victoria al completar la canción
          setPasoCancion(siguientePaso)
          setTimeout(() => {
            setVictoria(true)
            guardarMejorNivel(cancionSeleccionada.id, 3)
            if (perfil?.id) {
              supabase.from('progreso_actividades').insert([
                { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: `musica_${cancionSeleccionada.id}`, completado: true, estrellas: 3 }
              ]).then(() => {})
            }
          }, 400)
        } else {
          setPasoCancion(siguientePaso)
        }
      }
    }
  }

  // CONTROL DE GRABACIÓN
  const toggleGrabar = () => {
    if (grabando) {
      setGrabando(false)
    } else {
      setGrabacion([])
      tiempoInicioGrabacion.current = Date.now()
      setGrabando(true)
    }
  }

  const reproducirGrabacion = () => {
    if (grabacion.length === 0 || reproduciendo) return
    setReproduciendo(true)

    grabacion.forEach((item, index) => {
      setTimeout(() => {
        reproducirTono(item.nota.freq)
        setTeclaPulsada(item.nota.id)
        setTimeout(() => setTeclaPulsada(null), 200)

        if (index === grabacion.length - 1) {
          setTimeout(() => setReproduciendo(false), 500)
        }
      }, item.tiempo)
    })
  }

  // ATAJOS DE TECLADO (1 a 8)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const nota = NOTAS.find(n => n.tecla === e.key)
      if (nota) {
        tocarNota(nota)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  // REINICIAR CANCIÓN
  const empezarCancion = (cancion) => {
    setCancionSeleccionada(cancion)
    setPasoCancion(0)
    setVictoria(false)
    setModo('canciones')
  }

  const notaEsperadaActual = modo === 'canciones' && cancionSeleccionada && !victoria 
    ? cancionSeleccionada.notas[pasoCancion] 
    : null

  return (
    <div className="juego-musica-raiz" style={{
      height: '100dvh', minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      alignItems: 'center', fontFamily: '"Fredoka", sans-serif',
      boxSizing: 'border-box', padding: '14px', overflow: 'hidden', userSelect: 'none'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        .anim-pop { animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        .anim-victoria { animation: victoriaBounce 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoriaBounce { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); } 100% { transform: scale(1); opacity: 1; } }

        .anim-estrella-guia { animation: saltoEstrella 0.8s ease-in-out infinite alternate; }
        @keyframes saltoEstrella { from { transform: translateY(0) scale(1); } to { transform: translateY(-12px) scale(1.2); } }

        .particula-nota {
          position: fixed;
          pointer-events: none;
          font-size: 32px;
          animation: subirParticula 0.9s ease-out forwards;
          z-index: 100;
        }
        @keyframes subirParticula {
          0% { transform: translate(-50%, -50%) translateY(0) scale(0.6); opacity: 1; }
          50% { transform: translate(-50%, -50%) translateY(-50px) scale(1.3) rotate(15deg); opacity: 1; }
          100% { transform: translate(-50%, -50%) translateY(-110px) scale(0.8) rotate(-15deg); opacity: 0; }
        }

        /* TECLAS DE PIANO 3D ESTILO GELATINA / ARCILLA */
        .tecla-piano-3d {
          flex: 1;
          height: clamp(140px, 45vh, 280px);
          max-width: 110px;
          border-radius: 24px;
          border: 4px solid rgba(255, 255, 255, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: 18px;
          cursor: pointer;
          position: relative;
          transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .tecla-piano-3d:active, .tecla-piano-3d.activa {
          transform: translateY(10px) scale(0.96);
          filter: brightness(1.15);
        }

        .tecla-sugerida {
          animation: pulsoSugerido 1s ease-in-out infinite alternate;
        }
        @keyframes pulsoSugerido {
          0% { box-shadow: 0 0 15px rgba(255, 255, 255, 0.8), 0 10px 0 var(--tecla-shadow); }
          100% { box-shadow: 0 0 35px #FFD166, 0 0 20px #FFF, 0 10px 0 var(--tecla-shadow); transform: translateY(-4px); }
        }

        /* MEDIA QUERIES RESPONSIVAS MÓVIL */
        @media (max-height: 550px) {
          .juego-musica-raiz {
            padding: 8px 12px !important;
          }
          .header-barra-musica {
            margin-bottom: 6px !important;
          }
          .btn-header-musica {
            width: 40px !important;
            height: 40px !important;
            font-size: 18px !important;
            border-radius: 12px !important;
          }
          .badge-cabecera-musica {
            padding: 4px 14px !important;
            font-size: 1rem !important;
            border-radius: 18px !important;
          }
          .tecla-piano-3d {
            height: clamp(120px, 50vh, 200px) !important;
            border-radius: 18px !important;
            padding-bottom: 10px !important;
          }
          .emoji-tecla {
            font-size: 20px !important;
          }
          .nombre-tecla {
            font-size: 1.1rem !important;
          }
          .btn-instrumento-item {
            padding: 4px 10px !important;
            font-size: 0.82rem !important;
            border-radius: 14px !important;
          }
        }
      `}</style>

      {/* PARTÍCULAS FLOTANTES */}
      {particulas.map(p => (
        <div key={p.id} className="particula-nota" style={{ left: p.x, top: p.y }}>
          {p.icono}
        </div>
      ))}

      {/* BARRA SUPERIOR */}
      <div className="header-barra-musica" style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button 
          onClick={() => {
            if (modo !== 'menu') setModo('menu')
            else onVolver()
          }}
          className="btn-header-musica"
          style={{
            width: '52px', height: '52px', borderRadius: '18px',
            backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none',
            fontSize: '22px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)'
          }}
        >
          ❮
        </button>

        {modo === 'canciones' && cancionSeleccionada && (
          <div className="badge-cabecera-musica" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '8px 22px', borderRadius: '25px',
            border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '24px' }}>{cancionSeleccionada.emoji}</span>
            <span style={{ fontWeight: '900', color: '#334155', fontSize: '1.15rem' }}>{cancionSeleccionada.titulo}</span>
            <span style={{ backgroundColor: '#FFD166', color: '#7A5C00', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '900' }}>
              {pasoCancion} / {cancionSeleccionada.notas.length}
            </span>
          </div>
        )}

        {modo === 'libre' && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button 
              onClick={toggleGrabar}
              style={{
                backgroundColor: grabando ? '#FF4757' : 'white',
                color: grabando ? 'white' : '#FF4757',
                border: '3px solid white', borderRadius: '20px', padding: '8px 16px',
                fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: '0 5px 0 rgba(0,0,0,0.1)', animation: grabando ? 'pulsoSugerido 0.8s infinite' : 'none'
              }}
            >
              {grabando ? '⏹️ Detener' : '🔴 Grabar'}
            </button>
            {grabacion.length > 0 && !grabando && (
              <button 
                onClick={reproducirGrabacion}
                disabled={reproduciendo}
                style={{
                  backgroundColor: '#2ED573', color: 'white',
                  border: '3px solid white', borderRadius: '20px', padding: '8px 16px',
                  fontWeight: '900', fontSize: '0.95rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  boxShadow: '0 5px 0 #20bf6b'
                }}
              >
                {reproduciendo ? '🎶 Tocando...' : '▶️ Escuchar'}
              </button>
            )}
          </div>
        )}

        {/* MARCADOR DE PUNTOS */}
        <div className="badge-cabecera-musica" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '8px 18px', borderRadius: '25px',
          border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          <span style={{ fontSize: '20px' }}>⭐</span>
          <span style={{ color: '#FFD166', fontWeight: '900', fontSize: '1.25rem', textShadow: '0 2px 0 #CCAC00' }}>{puntos}</span>
        </div>
      </div>

      {/* PANTALLA PRINCIPAL: MENÚ DE ELECCIÓN DE MODO */}
      {modo === 'menu' && (
        <div className="anim-pop" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)', borderRadius: '35px', padding: '24px 28px',
          border: '6px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxWidth: '580px', width: '100%',
          textAlign: 'center', zIndex: 30, boxSizing: 'border-box'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
            <img 
              src={`${baseUrl}assets/icono-musica.png`} 
              alt="Piano Mágico"
              style={{ width: '105px', height: '105px', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}
            />
          </div>
          <h2 style={{ color: '#1E293B', fontSize: '1.8rem', fontWeight: '900', margin: '4px 0 6px 0' }}>
            🎹 Piano & Música Mágica
          </h2>
          <p style={{ color: '#64748B', fontSize: '1rem', fontWeight: '600', margin: '0 0 20px 0' }}>
            ¿Qué aventura musical quieres vivir hoy? ✨
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* MODO LIBRE */}
            <div 
              onClick={() => setModo('libre')}
              style={{
                backgroundColor: '#EFF6FF', border: '4px solid #3B82F6', borderRadius: '24px',
                padding: '16px', cursor: 'pointer', transition: 'transform 0.15s',
                boxShadow: '0 8px 0 #2563EB, 0 12px 20px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '42px', marginBottom: '4px' }}>🌈🎹</div>
              <h3 style={{ color: '#1E40AF', margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: '900' }}>Toca Libre</h3>
              <p style={{ color: '#60A5FA', fontSize: '0.85rem', margin: 0, fontWeight: '700' }}>¡Crea tus canciones y grábalas!</p>
            </div>

            {/* MODO CANCIONES */}
            <div 
              onClick={() => setModo('selector_canciones')}
              style={{
                backgroundColor: '#FEF3C7', border: '4px solid #F59E0B', borderRadius: '24px',
                padding: '16px', cursor: 'pointer', transition: 'transform 0.15s',
                boxShadow: '0 8px 0 #D97706, 0 12px 20px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '42px', marginBottom: '4px' }}>⭐🎵</div>
              <h3 style={{ color: '#92400E', margin: '0 0 4px 0', fontSize: '1.25rem', fontWeight: '900' }}>Cancionero</h3>
              <p style={{ color: '#FBBF24', fontSize: '0.85rem', margin: 0, fontWeight: '700' }}>Aprende canciones guiadas</p>
            </div>
          </div>
        </div>
      )}

      {/* SELECTOR DE CANCIONES */}
      {modo === 'selector_canciones' && (
        <div className="anim-pop" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.94)', borderRadius: '35px', padding: '24px',
          border: '6px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxWidth: '620px', width: '100%',
          textAlign: 'center', zIndex: 30, boxSizing: 'border-box'
        }}>
          <h2 style={{ color: '#1E293B', fontSize: '1.6rem', fontWeight: '900', margin: '0 0 14px 0' }}>
            Elige una canción para aprender 📖✨
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            {CANCIONES.map(c => {
              const estrellasObtenidas = mejores[c.id] || 0
              return (
                <div 
                  key={c.id}
                  onClick={() => empezarCancion(c)}
                  style={{
                    backgroundColor: 'white', border: `4px solid ${c.color}`, borderRadius: '24px',
                    padding: '16px 12px', cursor: 'pointer', transition: 'all 0.15s',
                    boxShadow: `0 8px 0 ${c.sombra}, 0 10px 15px rgba(0,0,0,0.08)`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <span style={{ fontSize: '42px', marginBottom: '6px' }}>{c.emoji}</span>
                  <h4 style={{ color: '#334155', margin: '0 0 4px 0', fontSize: '1.05rem', fontWeight: '900' }}>{c.titulo}</h4>
                  <span style={{ backgroundColor: c.color, color: 'white', padding: '2px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '8px' }}>
                    {c.nivel}
                  </span>
                  <div style={{ fontSize: '1.1rem' }}>
                    {'⭐'.repeat(estrellasObtenidas)}{'☆'.repeat(3 - estrellasObtenidas)}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* SELECTOR DE INSTRUMENTOS (Modo libre y canciones) */}
      {(modo === 'libre' || modo === 'canciones') && (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)', padding: '6px 14px', borderRadius: '25px',
          border: '3px solid white', backdropFilter: 'blur(10px)', display: 'flex', gap: '8px',
          boxShadow: '0 8px 20px rgba(0,0,0,0.1)', zIndex: 15, flexWrap: 'wrap', justifyContent: 'center'
        }}>
          {INSTRUMENTOS.map(inst => (
            <button
              key={inst.id}
              onClick={() => setInstrumento(inst.id)}
              className="btn-instrumento-item"
              style={{
                backgroundColor: instrumento === inst.id ? inst.color : 'white',
                color: instrumento === inst.id ? 'white' : '#475569',
                border: instrumento === inst.id ? '3px solid white' : '2px solid #E2E8F0',
                borderRadius: '18px', padding: '6px 14px', cursor: 'pointer',
                fontFamily: '"Fredoka", sans-serif', fontWeight: '900', fontSize: '0.9rem',
                boxShadow: instrumento === inst.id ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                transform: instrumento === inst.id ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.15s'
              }}
            >
              {inst.emoji} {inst.nombre}
            </button>
          ))}
        </div>
      )}

      {/* TECLADO MULTICOLOR DE PIANO (8 NOTAS) */}
      {(modo === 'libre' || modo === 'canciones') && (
        <div style={{
          width: '100%', maxWidth: '920px', display: 'flex', gap: 'clamp(4px, 1.2vw, 12px)',
          justifyContent: 'center', alignItems: 'flex-end', zIndex: 10, paddingBottom: '8px'
        }}>
          {NOTAS.map(nota => {
            const esLaSugerida = notaEsperadaActual === nota.id
            const estaPulsada = teclaPulsada === nota.id

            return (
              <div
                key={nota.id}
                onPointerDown={(e) => tocarNota(nota, e)}
                className={`tecla-piano-3d ${esLaSugerida ? 'tecla-sugerida' : ''} ${estaPulsada ? 'activa' : ''}`}
                style={{
                  '--tecla-shadow': nota.sombra,
                  backgroundColor: nota.color,
                  boxShadow: estaPulsada 
                    ? `0 2px 0 ${nota.sombra}, inset 0 4px 8px rgba(0,0,0,0.2)`
                    : `0 10px 0 ${nota.sombra}, 0 14px 20px rgba(0,0,0,0.15)`
                }}
              >
                {/* ESTRELLA FLOTANTE DE GUÍA */}
                {esLaSugerida && (
                  <div className="anim-estrella-guia" style={{ position: 'absolute', top: '-34px', fontSize: '32px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                    ⭐
                  </div>
                )}

                <span className="emoji-tecla" style={{ fontSize: '26px', marginBottom: '6px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
                  {nota.emoji}
                </span>
                <span className="nombre-tecla" style={{ color: 'white', fontSize: '1.4rem', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  {nota.nombre}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL DE VICTORIA AL COMPLETAR CANCIÓN */}
      {victoria && (
        <div style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(30, 41, 59, 0.65)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px'
        }}>
          <div className="anim-victoria" style={{
            backgroundColor: 'white', borderRadius: '35px', padding: '32px 28px', maxWidth: '380px', width: '100%',
            textAlign: 'center', border: '6px solid #FFD166', boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
          }}>
            <div style={{ fontSize: '70px', marginBottom: '8px' }}>🎉🎹</div>
            <h2 style={{ color: '#1E293B', fontSize: '1.8rem', fontWeight: '900', margin: '0 0 6px 0' }}>
              ¡Eres un Gran Músico!
            </h2>
            <p style={{ color: '#64748B', fontSize: '1.05rem', margin: '0 0 14px 0', fontWeight: '700' }}>
              Completaste <b>{cancionSeleccionada?.titulo}</b> ✨
            </p>
            <div style={{ fontSize: '2.4rem', marginBottom: '20px' }}>⭐⭐⭐</div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => empezarCancion(cancionSeleccionada)}
                style={{
                  flex: 1, backgroundColor: '#FFD166', color: '#7A5C00', border: '3px solid white',
                  borderRadius: '20px', padding: '12px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer',
                  boxShadow: '0 6px 0 #CCAC00', fontFamily: '"Fredoka", sans-serif'
                }}
              >
                🔁 Repetir
              </button>
              <button
                onClick={() => setModo('selector_canciones')}
                style={{
                  flex: 1, backgroundColor: '#1DD1A1', color: 'white', border: '3px solid white',
                  borderRadius: '20px', padding: '12px', fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer',
                  boxShadow: '0 6px 0 #10AC84', fontFamily: '"Fredoka", sans-serif'
                }}
              >
                🎵 Otra canción
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
