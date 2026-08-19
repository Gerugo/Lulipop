import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'
import useMejoresNiveles from './useMejoresNiveles'
import NivelSelector from './NivelSelector'

const baseUrl = import.meta.env.BASE_URL

// NOTAS MUSICALES (Escala de Do Mayor Diatónica)
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
  { id: 'frog', nombre: 'Crazy Frog', emoji: '🐸', color: '#10B981' },
  { id: 'animales', nombre: 'Gatito Miau', emoji: '🐱', color: '#1DD1A1' },
  { id: 'campanas', nombre: 'Campanitas', emoji: '✨', color: '#9B5DE5' }
]

// CANCIONERO COMPLETO CON 9 CANCIONES (INCLUYE CRAZY FROG)
const CANCIONES = [
  {
    id: 'crazyfrog',
    titulo: 'Crazy Frog (Axel F - Ring Ding)',
    emoji: '🐸',
    nivel: 'Divertido • 46 notas',
    color: '#10B981',
    sombra: '#059669',
    notas: [
      'RE', 'FA', 'RE', 'RE', 'SOL', 'RE', 'DO',
      'RE', 'LA', 'RE', 'RE', 'DO2', 'LA', 'FA',
      'RE', 'LA', 'DO2', 'RE', 'DO', 'DO', 'LA', 'MI', 'RE',
      'RE', 'FA', 'RE', 'RE', 'SOL', 'RE', 'DO',
      'RE', 'LA', 'RE', 'RE', 'DO2', 'LA', 'FA',
      'RE', 'LA', 'DO2', 'RE', 'DO', 'DO', 'LA', 'MI', 'RE'
    ]
  },
  {
    id: 'estrellita',
    titulo: 'Estrellita dónde estás',
    emoji: '⭐',
    nivel: 'Fácil • 42 notas',
    color: '#FFD166',
    sombra: '#CCAC00',
    notas: [
      'DO', 'DO', 'SOL', 'SOL', 'LA', 'LA', 'SOL',
      'FA', 'FA', 'MI', 'MI', 'RE', 'RE', 'DO',
      'SOL', 'SOL', 'FA', 'FA', 'MI', 'MI', 'RE',
      'SOL', 'SOL', 'FA', 'FA', 'MI', 'MI', 'RE',
      'DO', 'DO', 'SOL', 'SOL', 'LA', 'LA', 'SOL',
      'FA', 'FA', 'MI', 'MI', 'RE', 'RE', 'DO'
    ]
  },
  {
    id: 'cumpleanos',
    titulo: 'Cumpleaños Feliz',
    emoji: '🎂',
    nivel: 'Medio • 24 notas',
    color: '#FF9F43',
    sombra: '#E58E26',
    notas: [
      'DO', 'DO', 'RE', 'DO', 'FA', 'MI',
      'DO', 'DO', 'RE', 'DO', 'SOL', 'FA',
      'DO', 'DO', 'DO2', 'LA', 'FA', 'MI', 'RE',
      'LA', 'LA', 'FA', 'SOL', 'FA'
    ]
  },
  {
    id: 'pollitos',
    titulo: 'Los Pollitos Dicen',
    emoji: '🐣',
    nivel: 'Fácil • 44 notas',
    color: '#1DD1A1',
    sombra: '#10AC84',
    notas: [
      'DO', 'RE', 'MI', 'FA', 'SOL', 'SOL', 'LA', 'LA', 'SOL',
      'FA', 'FA', 'MI', 'MI', 'RE', 'RE', 'DO',
      'DO', 'RE', 'MI', 'FA', 'SOL', 'SOL', 'LA', 'LA', 'SOL',
      'FA', 'FA', 'MI', 'MI', 'RE', 'RE', 'DO',
      'SOL', 'SOL', 'LA', 'LA', 'FA', 'FA', 'SOL', 'SOL',
      'MI', 'MI', 'FA', 'FA', 'RE', 'RE', 'DO'
    ]
  },
  {
    id: 'alegria',
    titulo: 'Himno de la Alegría',
    emoji: '🎶',
    nivel: 'Medio • 60 notas',
    color: '#4facfe',
    sombra: '#0083B0',
    notas: [
      'MI', 'MI', 'FA', 'SOL', 'SOL', 'FA', 'MI', 'RE', 'DO', 'DO', 'RE', 'MI', 'MI', 'RE', 'RE',
      'MI', 'MI', 'FA', 'SOL', 'SOL', 'FA', 'MI', 'RE', 'DO', 'DO', 'RE', 'MI', 'RE', 'DO', 'DO',
      'RE', 'RE', 'MI', 'DO', 'RE', 'MI', 'FA', 'MI', 'DO', 'RE', 'MI', 'FA', 'MI', 'RE', 'DO', 'RE',
      'MI', 'MI', 'FA', 'SOL', 'SOL', 'FA', 'MI', 'RE', 'DO', 'DO', 'RE', 'MI', 'RE', 'DO', 'DO'
    ]
  },
  {
    id: 'martinillo',
    titulo: 'Martinillo (Fray Santiago)',
    emoji: '🔔',
    nivel: 'Fácil • 32 notas',
    color: '#9B5DE5',
    sombra: '#7B3CC4',
    notas: [
      'DO', 'RE', 'MI', 'DO', 'DO', 'RE', 'MI', 'DO',
      'MI', 'FA', 'SOL', 'MI', 'FA', 'SOL',
      'SOL', 'LA', 'SOL', 'FA', 'MI', 'DO', 'SOL', 'LA', 'SOL', 'FA', 'MI', 'DO',
      'DO', 'SOL', 'DO', 'DO', 'SOL', 'DO'
    ]
  },
  {
    id: 'barquito',
    titulo: 'Rema Tu Barquito',
    emoji: '🚣',
    nivel: 'Medio • 27 notas',
    color: '#54A0FF',
    sombra: '#2E86DE',
    notas: [
      'DO', 'DO', 'DO', 'RE', 'MI', 'MI', 'RE', 'MI', 'FA', 'SOL',
      'DO2', 'DO2', 'DO2', 'SOL', 'SOL', 'SOL', 'MI', 'MI', 'MI', 'DO', 'DO', 'DO',
      'SOL', 'FA', 'MI', 'RE', 'DO'
    ]
  },
  {
    id: 'vacalola',
    titulo: 'La Vaca Lola',
    emoji: '🐮',
    nivel: 'Fácil • 36 notas',
    color: '#FF6B81',
    sombra: '#D9385E',
    notas: [
      'DO', 'DO', 'DO', 'RE', 'MI', 'DO', 'DO', 'DO', 'RE', 'MI',
      'SOL', 'SOL', 'SOL', 'FA', 'MI', 'FA', 'FA', 'FA', 'MI', 'RE',
      'DO', 'DO', 'DO', 'RE', 'MI', 'DO', 'DO', 'DO', 'RE', 'MI',
      'SOL', 'SOL', 'FA', 'MI', 'RE', 'DO'
    ]
  },
  {
    id: 'lechera',
    titulo: 'Tengo una Vaca Lechera',
    emoji: '🥛',
    nivel: 'Avanzado • 37 notas',
    color: '#38ef7d',
    sombra: '#11998e',
    notas: [
      'DO', 'MI', 'SOL', 'DO', 'MI', 'SOL', 'SOL',
      'LA', 'SOL', 'FA', 'MI', 'FA', 'SOL', 'MI',
      'DO', 'MI', 'SOL', 'DO', 'MI', 'SOL', 'SOL',
      'LA', 'SOL', 'FA', 'MI', 'FA', 'RE', 'DO',
      'SOL', 'DO2', 'SOL', 'MI', 'SOL', 'DO2', 'SOL', 'MI', 'DO'
    ]
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
  
  // Grabadora y auto-demostración
  const [grabando, setGrabando] = useState(false)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [grabacion, setGrabacion] = useState([])
  const tiempoInicioGrabacion = useRef(null)
  const timerDemoRef = useRef([])

  const audioCtxRef = useRef(null)
  const { mejores, guardarMejorNivel } = useMejoresNiveles('musica', perfil?.id)

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
      else if (tipoInstrumento === 'frog') {
        // CRAZY FROG SYNTH: Onda Sawtooth + Square con modulación formántica retro ("Ring-ding-ding!")
        const osc = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const filter = ctx.createBiquadFilter()
        const gainNode = ctx.createGain()

        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(freq * 1.5, now)
        osc.frequency.exponentialRampToValueAtTime(freq, now + 0.04)

        osc2.type = 'square'
        osc2.frequency.setValueAtTime(freq * 1.51, now)
        osc2.frequency.exponentialRampToValueAtTime(freq, now + 0.04)

        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(1400, now)
        filter.frequency.exponentialRampToValueAtTime(800, now + 0.15)
        filter.Q.setValueAtTime(4.0, now)

        gainNode.gain.setValueAtTime(0.85, now)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.38)

        osc.connect(filter)
        osc2.connect(filter)
        filter.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc.start(now)
        osc2.start(now)
        osc.stop(now + 0.4)
        osc2.stop(now + 0.4)
      }
      else if (tipoInstrumento === 'animales') {
        const osc = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq * 0.9, now)
        osc.frequency.linearRampToValueAtTime(freq * 1.3, now + 0.15)
        osc.frequency.linearRampToValueAtTime(freq * 0.85, now + 0.4)

        gainNode.gain.setValueAtTime(0.7, now)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.45)

        osc.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc.start(now)
        osc.stop(now + 0.5)
      } 
      else if (tipoInstrumento === 'campanas') {
        const osc1 = ctx.createOscillator()
        const osc2 = ctx.createOscillator()
        const osc3 = ctx.createOscillator()
        const gainNode = ctx.createGain()

        osc1.type = 'sine'
        osc2.type = 'sine'
        osc3.type = 'sine'

        osc1.frequency.setValueAtTime(freq, now)
        osc2.frequency.setValueAtTime(freq * 2.75, now)
        osc3.frequency.setValueAtTime(freq * 5.4, now)

        gainNode.gain.setValueAtTime(0.6, now)
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.6)

        osc1.connect(gainNode)
        osc2.connect(gainNode)
        osc3.connect(gainNode)
        gainNode.connect(ctx.destination)

        osc1.start(now)
        osc2.start(now)
        osc3.start(now)
        osc1.stop(now + 1.65)
        osc2.stop(now + 0.9)
        osc3.stop(now + 0.5)
      }
    } catch {
      // Audio fallback silencioso
    }
  }, [getAudioContext, instrumento])

  // LANZADOR DE PARTÍCULAS
  const lanzarParticula = (x, y, emoji) => {
    const id = Date.now() + Math.random()
    const emojisNotas = ['🎵', '🎶', '⭐', '✨', '💖', '🌈', '🍓', '🍋']
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

    if (e) {
      const clientX = e.clientX !== undefined ? e.clientX : (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2)
      const clientY = e.clientY !== undefined ? e.clientY : (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2)
      lanzarParticula(clientX, clientY, notaObj.emoji)
    }

    if (grabando) {
      const offsetMs = Date.now() - tiempoInicioGrabacion.current
      setGrabacion(prev => [...prev, { nota: notaObj, tiempo: offsetMs }])
    }

    if (modo === 'canciones' && cancionSeleccionada && !victoria) {
      const notaEsperada = cancionSeleccionada.notas[pasoCancion]
      if (notaObj.id === notaEsperada) {
        setPuntos(prev => prev + 10)
        const siguientePaso = pasoCancion + 1
        
        if (siguientePaso >= cancionSeleccionada.notas.length) {
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

  // CONTROL DE GRABACIÓN MODO LIBRE
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

  // AUTO-DEMOSTRACIÓN DE LA CANCIÓN COMPLETA
  const reproducirDemoCancion = () => {
    if (!cancionSeleccionada || reproduciendo) return
    setReproduciendo(true)
    timerDemoRef.current.forEach(t => clearTimeout(t))
    timerDemoRef.current = []

    cancionSeleccionada.notas.forEach((notaId, index) => {
      const t = setTimeout(() => {
        const notaObj = NOTAS.find(n => n.id === notaId)
        if (notaObj) {
          reproducirTono(notaObj.freq)
          setTeclaPulsada(notaObj.id)
          setTimeout(() => setTeclaPulsada(null), 220)
        }

        if (index === cancionSeleccionada.notas.length - 1) {
          setTimeout(() => setReproduciendo(false), 600)
        }
      }, index * 380)
      timerDemoRef.current.push(t)
    })
  }

  const detenerDemoCancion = () => {
    timerDemoRef.current.forEach(t => clearTimeout(t))
    timerDemoRef.current = []
    setReproduciendo(false)
    setTeclaPulsada(null)
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
    detenerDemoCancion()
    setCancionSeleccionada(cancion)
    setPasoCancion(0)
    setVictoria(false)
    if (cancion.id === 'crazyfrog') {
      setInstrumento('frog')
    }
    setModo('canciones')
  }

  const notaEsperadaActual = modo === 'canciones' && cancionSeleccionada && !victoria 
    ? cancionSeleccionada.notas[pasoCancion] 
    : null

  // PANTALLA DE SELECCIÓN DE CANCIONES (100% Adaptada a móviles)
  if (modo === 'selector_canciones') {
    return (
      <NivelSelector
        onVolver={() => setModo('menu')}
        emojiJuego="🎵"
        titulo="Cancionero Mágico"
        subtitulo="Elige tu canción completa favorita"
        niveles={CANCIONES.map(c => ({
          id: c.id,
          nombre: c.titulo,
          descripcion: c.nivel,
          emoji: c.emoji,
          color: c.color,
          sombra: c.sombra
        }))}
        mejores={mejores}
        onSeleccionar={(id) => {
          const c = CANCIONES.find(x => x.id === id)
          if (c) empezarCancion(c)
        }}
      />
    )
  }

  // Notas que vienen a continuación para la cinta musical
  const proximasNotas = cancionSeleccionada && modo === 'canciones'
    ? cancionSeleccionada.notas.slice(pasoCancion, pasoCancion + 5).map(id => NOTAS.find(n => n.id === id))
    : []

  const progresoCancion = cancionSeleccionada
    ? Math.round((pasoCancion / cancionSeleccionada.notas.length) * 100)
    : 0

  return (
    <div className="juego-musica-raiz" style={{
      height: '100dvh', minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
      display: 'flex', flexDirection: 'column',
      justifyContent: modo === 'menu' ? 'center' : 'space-between',
      alignItems: 'center', fontFamily: '"Fredoka", sans-serif',
      boxSizing: 'border-box', padding: '14px', overflowY: modo === 'menu' ? 'auto' : 'hidden', userSelect: 'none'
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
            padding: 6px 12px !important;
          }
          .header-barra-musica {
            margin-bottom: 4px !important;
          }
          .btn-header-musica {
            width: 40px !important;
            height: 40px !important;
            font-size: 18px !important;
            border-radius: 12px !important;
          }
          .badge-cabecera-musica {
            padding: 4px 14px !important;
            font-size: 0.95rem !important;
            border-radius: 18px !important;
          }
          .tecla-piano-3d {
            height: clamp(100px, 44vh, 160px) !important;
            border-radius: 16px !important;
            padding-bottom: 6px !important;
          }
          .emoji-tecla {
            font-size: 18px !important;
          }
          .nombre-tecla {
            font-size: 1.05rem !important;
          }
          .btn-instrumento-item {
            padding: 3px 8px !important;
            font-size: 0.78rem !important;
            border-radius: 12px !important;
          }
          .modal-menu-musica {
            padding: 10px 16px !important;
            max-width: 520px !important;
            border-radius: 22px !important;
          }
          .icono-menu-piano {
            width: 50px !important;
            height: 50px !important;
          }
          .titulo-menu-musica {
            font-size: 1.2rem !important;
            margin: 2px 0 !important;
          }
          .subtitulo-menu-musica {
            font-size: 0.82rem !important;
            margin-bottom: 8px !important;
          }
          .grid-modos-musica {
            gap: 10px !important;
          }
          .cinta-notas-guia {
            margin: 2px 0 !important;
            padding: 4px 10px !important;
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
      <div className="header-barra-musica" style={{ width: '100%', maxWidth: '950px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button 
          onClick={() => {
            detenerDemoCancion()
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
            backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: '6px 18px', borderRadius: '25px',
            border: '4px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span style={{ fontSize: '22px' }}>{cancionSeleccionada.emoji}</span>
            <span style={{ fontWeight: '900', color: '#334155', fontSize: '1.05rem' }}>{cancionSeleccionada.titulo}</span>
            <span style={{ backgroundColor: '#FFD166', color: '#7A5C00', padding: '2px 8px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: '900' }}>
              {pasoCancion}/{cancionSeleccionada.notas.length} ({progresoCancion}%)
            </span>
            <button
              onClick={reproduciendo ? detenerDemoCancion : reproducirDemoCancion}
              style={{
                backgroundColor: reproduciendo ? '#FF4757' : '#38ef7d',
                color: 'white', border: 'none', borderRadius: '14px',
                padding: '4px 10px', fontSize: '0.78rem', fontWeight: '900',
                cursor: 'pointer', fontFamily: '"Fredoka", sans-serif',
                boxShadow: '0 3px 0 rgba(0,0,0,0.15)'
              }}
            >
              {reproduciendo ? '⏹️ Parar' : '▶️ Oír Melodía'}
            </button>
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
        <div className="anim-pop modal-menu-musica" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.92)', borderRadius: '35px', padding: '22px 26px',
          border: '6px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', maxWidth: '580px', width: '100%',
          textAlign: 'center', zIndex: 30, boxSizing: 'border-box', maxHeight: 'calc(100dvh - 80px)', overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '4px' }}>
            <img 
              src={`${baseUrl}assets/icono-musica.png`} 
              alt="Piano Mágico"
              className="icono-menu-piano"
              style={{ width: '90px', height: '90px', objectFit: 'contain', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.15))' }}
            />
          </div>
          <h2 className="titulo-menu-musica" style={{ color: '#1E293B', fontSize: '1.7rem', fontWeight: '900', margin: '4px 0 4px 0' }}>
            🎹 Piano & Música Mágica
          </h2>
          <p className="subtitulo-menu-musica" style={{ color: '#64748B', fontSize: '0.95rem', fontWeight: '600', margin: '0 0 16px 0' }}>
            ¿Qué aventura musical quieres vivir hoy? ✨
          </p>

          <div className="grid-modos-musica" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* MODO LIBRE */}
            <div 
              onClick={() => setModo('libre')}
              className="card-modo-musica"
              style={{
                backgroundColor: '#EFF6FF', border: '4px solid #3B82F6', borderRadius: '24px',
                padding: '16px 12px', cursor: 'pointer', transition: 'transform 0.15s',
                boxShadow: '0 8px 0 #2563EB, 0 12px 20px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="emoji-modo-musica" style={{ fontSize: '38px', marginBottom: '4px' }}>🌈🎹</div>
              <h3 style={{ color: '#1E40AF', margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '900' }}>Toca Libre</h3>
              <p style={{ color: '#60A5FA', fontSize: '0.82rem', margin: 0, fontWeight: '700' }}>¡Crea tus canciones y grábalas!</p>
            </div>

            {/* MODO CANCIONES */}
            <div 
              onClick={() => setModo('selector_canciones')}
              className="card-modo-musica"
              style={{
                backgroundColor: '#FEF3C7', border: '4px solid #F59E0B', borderRadius: '24px',
                padding: '16px 12px', cursor: 'pointer', transition: 'transform 0.15s',
                boxShadow: '0 8px 0 #D97706, 0 12px 20px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div className="emoji-modo-musica" style={{ fontSize: '38px', marginBottom: '4px' }}>⭐🎵</div>
              <h3 style={{ color: '#92400E', margin: '0 0 4px 0', fontSize: '1.2rem', fontWeight: '900' }}>Cancionero (8)</h3>
              <p style={{ color: '#FBBF24', fontSize: '0.82rem', margin: 0, fontWeight: '700' }}>Aprende canciones completas</p>
            </div>
          </div>
        </div>
      )}

      {/* CINTA DE PRÓXIMAS NOTAS EN MODO CANCIONES */}
      {modo === 'canciones' && cancionSeleccionada && (
        <div className="cinta-notas-guia" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.88)', padding: '6px 16px', borderRadius: '24px',
          border: '3px solid white', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
          gap: '8px', zIndex: 15, boxShadow: '0 6px 16px rgba(0,0,0,0.1)'
        }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#475569' }}>Siguiente nota:</span>
          {proximasNotas.map((n, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: idx === 0 ? n?.color : 'rgba(255, 255, 255, 0.7)',
                color: idx === 0 ? 'white' : '#475569',
                border: idx === 0 ? '3px solid white' : '2px solid rgba(0,0,0,0.05)',
                borderRadius: '16px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '4px',
                fontWeight: '900', fontSize: idx === 0 ? '1.1rem' : '0.85rem',
                transform: idx === 0 ? 'scale(1.12)' : 'scale(0.92)',
                boxShadow: idx === 0 ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <span>{n?.emoji}</span>
              <span>{n?.nombre}</span>
            </div>
          ))}
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
              Completaste toda la canción <b>{cancionSeleccionada?.titulo}</b> ✨
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
