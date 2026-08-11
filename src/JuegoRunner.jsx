import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'

// ============================================================
// SINTETIZADOR DE AUDIO
// ============================================================
function usarSonidosRunner() {
  const ctxRef = useRef(null)
  const obtenerContexto = () => {
    if (!ctxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) ctxRef.current = new AudioCtx()
    }
    if (ctxRef.current && ctxRef.current.state === 'suspended') ctxRef.current.resume()
    return ctxRef.current
  }

  const crearTono = (freqInicio, freqFin, inicio, duracion, tipo = 'sine', volumen = 0.15) => {
    const ctx = obtenerContexto()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = tipo
    osc.frequency.setValueAtTime(freqInicio, ctx.currentTime + inicio)
    if (freqFin) osc.frequency.exponentialRampToValueAtTime(freqFin, ctx.currentTime + inicio + duracion)
    gain.gain.setValueAtTime(0, ctx.currentTime + inicio)
    gain.gain.linearRampToValueAtTime(volumen, ctx.currentTime + inicio + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + duracion)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime + inicio)
    osc.stop(ctx.currentTime + inicio + duracion)
  }

  return {
    sonidoSalto: () => { crearTono(400, 800, 0, 0.3, 'sine', 0.2) },
    sonidoEstrella: () => {
      crearTono(880, null, 0, 0.1, 'sine', 0.1)
      crearTono(1318, null, 0.08, 0.15, 'sine', 0.1)
      crearTono(1760, null, 0.16, 0.2, 'sine', 0.15)
    },
    sonidoGema: () => {
      crearTono(1200, 1900, 0, 0.12, 'triangle', 0.12)
      crearTono(1900, 2400, 0.08, 0.16, 'triangle', 0.1)
    },
    sonidoVida: () => {
      crearTono(600, 900, 0, 0.15, 'sine', 0.16)
      crearTono(900, 1300, 0.1, 0.22, 'sine', 0.16)
    },
    sonidoCombo: () => {
      crearTono(500, 1000, 0, 0.1, 'triangle', 0.12)
      crearTono(1000, 1500, 0.08, 0.12, 'triangle', 0.12)
      crearTono(1500, 2100, 0.16, 0.18, 'triangle', 0.14)
    },
    sonidoChoque: () => { crearTono(150, 80, 0, 0.4, 'sawtooth', 0.15) },
    sonidoGameOver: () => {
      crearTono(500, 200, 0, 0.5, 'sine', 0.14)
      crearTono(350, 150, 0.15, 0.5, 'sine', 0.1)
    },
    sonidoInicio: () => { crearTono(500, 750, 0, 0.18, 'sine', 0.15) }
  }
}

// ============================================================
// CONSTANTES Y HELPERS DE ESCENA (sin dependencias de React)
// ============================================================
const VIDAS_MAX = 3

const claveRecord = (perfilId) => `lulipop_runner_record_${perfilId || 'anon'}`

const geoDonut = new THREE.TorusGeometry(0.4, 0.15, 12, 24)
const matPremio = new THREE.MeshStandardMaterial({ color: '#ffa502', metalness: 0.3, roughness: 0.2 })
const matGema = new THREE.MeshStandardMaterial({ color: '#7d5fff', emissive: '#7d5fff', emissiveIntensity: 0.45, metalness: 0.5, roughness: 0.2 })
const matCorazon = new THREE.MeshStandardMaterial({ color: '#ff6b81', emissive: '#ff4757', emissiveIntensity: 0.3, roughness: 0.3 })

// ----------------------------------------------------------------
// OBSTÁCULOS "GOLOSINA": árboles de caramelo y piruletas reales
// (sprites 2D con transparencia, siempre mirando a cámara)
// ----------------------------------------------------------------
const BASE_ASSETS = import.meta.env.BASE_URL
const cargadorObstaculos = new THREE.TextureLoader()
const CANDY_ASSETS = [
  { archivo: 'arbol-menta-a.png', w: 367, h: 741 },
  { archivo: 'arbol-menta-b.png', w: 346, h: 755 },
  { archivo: 'arbol-verde.png', w: 318, h: 706 },
  { archivo: 'piruleta-naranja.png', w: 370, h: 717 },
  { archivo: 'piruleta-rosa.png', w: 261, h: 719 }
]
const COLORES_RESPALDO = ['#a9ecc7', '#a9ecc7', '#8fe0b8', '#ffb454', '#ff9fc7']
const materialesCandy = CANDY_ASSETS.map(({ archivo }, i) => {
  const mat = new THREE.SpriteMaterial({ transparent: true, color: COLORES_RESPALDO[i] })
  cargadorObstaculos.load(
    `${BASE_ASSETS}assets/obstaculos/${archivo}`,
    (tex) => {
      if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace
      mat.map = tex
      mat.color.set('#ffffff')
      mat.needsUpdate = true
    },
    undefined,
    (error) => { console.warn('No se pudo cargar la textura de obstáculo:', archivo, error) }
  )
  return mat
})

function crearObstaculoCandy() {
  const indice = Math.floor(Math.random() * CANDY_ASSETS.length)
  const { w, h } = CANDY_ASSETS[indice]
  const alturaMundo = 1.85
  const anchoMundo = alturaMundo * (w / h)

  const g = new THREE.Group()
  const sprite = new THREE.Sprite(materialesCandy[indice])
  sprite.scale.set(anchoMundo, alturaMundo, 1)
  sprite.position.y = alturaMundo / 2
  g.add(sprite)
  return g
}

function crearGema() {
  const g = new THREE.Group()
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(0.32, 0), matGema)
  m.castShadow = true
  g.add(m)
  return g
}

function crearCorazon() {
  const g = new THREE.Group()
  const izq = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), matCorazon)
  izq.position.set(-0.15, 0.12, 0)
  const der = izq.clone()
  der.position.set(0.15, 0.12, 0)
  const punta = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.42, 4), matCorazon)
  punta.rotation.y = Math.PI / 4
  punta.rotation.z = Math.PI
  punta.position.set(0, -0.16, 0)
  g.add(izq, der, punta)
  g.children.forEach(ch => { ch.castShadow = true })
  return g
}

// Elige el tipo de objeto que aparecerá en un carril reciclado
function elegirTipo(vidasActuales) {
  const r = Math.random()
  if (r < 0.42) return 'obstaculo'
  if (r < 0.48 && vidasActuales < VIDAS_MAX) return 'corazon'
  if (r < 0.62) return 'gema'
  return 'premio'
}

// Rellena un grupo (carril) ya existente con el contenido visual de un tipo
function poblarObjeto(grupo, tipo, sueloY) {
  grupo.clear()
  grupo.scale.set(1, 1, 1)
  if (tipo === 'obstaculo') {
    grupo.add(crearObstaculoCandy())
    grupo.position.y = sueloY
  } else if (tipo === 'premio') {
    const donut = new THREE.Mesh(geoDonut, matPremio)
    donut.castShadow = true
    grupo.add(donut)
    grupo.position.y = sueloY + 1.1 + Math.random() * 1.3
  } else if (tipo === 'gema') {
    grupo.add(crearGema())
    grupo.position.y = sueloY + 1.3 + Math.random() * 1.2
  } else if (tipo === 'corazon') {
    grupo.add(crearCorazon())
    grupo.position.y = sueloY + 1.0 + Math.random() * 0.7
  }
  grupo.userData = {
    tipo,
    activo: true,
    baseY: grupo.position.y,
    offset: Math.random() * Math.PI * 2
  }
  return grupo
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function JuegoRunner({ perfil, onVolver }) {
  const mountRef = useRef(null)
  const animFrameRef = useRef(null)

  // --- Estado visible en React ---
  const [estado, setEstado] = useState('inicio') // 'inicio' | 'jugando' | 'gameover'
  const [puntos, setPuntos] = useState(0)
  const [vidas, setVidas] = useState(VIDAS_MAX)
  const [combo, setCombo] = useState(0)
  const [mensaje, setMensaje] = useState('')
  const [record, setRecord] = useState(0)
  const [esNuevoRecord, setEsNuevoRecord] = useState(false)

  const {
    sonidoSalto, sonidoEstrella, sonidoGema, sonidoVida,
    sonidoCombo, sonidoChoque, sonidoGameOver, sonidoInicio
  } = usarSonidosRunner()

  // --- Refs "espejo" para usar dentro del bucle de animación sin closures viejas ---
  const estadoRef = useRef('inicio')
  const jugandoRef = useRef(false)
  const vidasRef = useRef(VIDAS_MAX)
  const puntosRef = useRef(0)
  const comboRef = useRef(0)
  const montadoRef = useRef(true)
  const timeoutsRef = useRef([])
  const accionesRef = useRef({}) // puente entre React (botones/toques) y el mundo Three.js

  const lulipopSpriteRef = useRef(null)
  const obstaculosRef = useRef([])
  const particulasRef = useRef([])
  const colisionCooldownRef = useRef(0)
  const spriteAnimRef = useRef({ tipo: null, t: 0, total: 1 })
  const shakeRef = useRef({ tiempo: 0, intensidad: 0 })

  const baseUrl = import.meta.env.BASE_URL

  const fisicas = useRef({
    vy: 0,
    gravedad: 0.012,
    salto: 0.26,
    sueloY: -0.2,
    enSuelo: true,
    velocidadBase: 0.10,
    velocidadJuego: 0.10,
    tiempo: 0
  })

  const programarTimeout = (fn, ms) => {
    const id = setTimeout(() => { if (montadoRef.current) fn() }, ms)
    timeoutsRef.current.push(id)
    return id
  }

  const cambiarEstado = (nuevo) => {
    estadoRef.current = nuevo
    if (montadoRef.current) setEstado(nuevo)
  }

  // --- Cargar mejor puntuación guardada ---
  useEffect(() => {
    try {
      const guardado = parseInt(localStorage.getItem(claveRecord(perfil?.id)) || '0', 10)
      if (!Number.isNaN(guardado)) setRecord(guardado)
    } catch { /* localStorage no disponible: seguimos sin récord persistente */ }
  }, [perfil?.id])

  useEffect(() => {
    const contenedor = mountRef.current
    if (!contenedor) return

    montadoRef.current = true

    const escena = new THREE.Scene()

    const aspecto = contenedor.clientWidth / contenedor.clientHeight
    const tamanoCamara = 4.5
    const camaraBaseX = 0
    const camaraBaseY = 1.5
    const camara = new THREE.OrthographicCamera(-tamanoCamara * aspecto, tamanoCamara * aspecto, tamanoCamara, -tamanoCamara, 0.1, 100)
    camara.position.set(camaraBaseX, camaraBaseY, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    contenedor.appendChild(renderer.domElement)

    // LUCES
    const luzAmbiente = new THREE.HemisphereLight('#ffffff', '#FFD8E4', 0.8)
    escena.add(luzAmbiente)
    const luzSol = new THREE.DirectionalLight('#FFF3E0', 1.2)
    luzSol.position.set(5, 12, 6)
    luzSol.castShadow = true
    luzSol.shadow.mapSize.width = 1024
    luzSol.shadow.mapSize.height = 1024
    escena.add(luzSol)

    // El cielo, el sol, las nubes y las colinas ahora son ilustraciones reales
    // en capas CSS detrás del canvas (ver el JSX), así que aquí solo queda el suelo.

    // ----------------------------------------------------------------
    // SUELO DE CÉSPED (con textura real, tipo "cinta transportadora")
    // ----------------------------------------------------------------
    const textureLoader = new THREE.TextureLoader()

    // Degradado vertical procedural para la tierra (en vez de un marrón plano)
    const canvasGradiente = document.createElement('canvas')
    canvasGradiente.width = 8
    canvasGradiente.height = 128
    const ctxGradiente = canvasGradiente.getContext('2d')
    const degradado = ctxGradiente.createLinearGradient(0, 0, 0, 128)
    degradado.addColorStop(0, '#e0b463')
    degradado.addColorStop(0.35, '#c99a52')
    degradado.addColorStop(1, '#9c7539')
    ctxGradiente.fillStyle = degradado
    ctxGradiente.fillRect(0, 0, 8, 128)
    const texturaTierra = new THREE.CanvasTexture(canvasGradiente)
    const materialTierra = new THREE.MeshStandardMaterial({ map: texturaTierra, roughness: 1 })

    const texturaCesped = textureLoader.load(`${baseUrl}assets/textura-cesped.jpg`)
    texturaCesped.wrapS = THREE.RepeatWrapping
    texturaCesped.wrapT = THREE.RepeatWrapping
    texturaCesped.repeat.set(48, 1.4)
    if ('colorSpace' in texturaCesped) texturaCesped.colorSpace = THREE.SRGBColorSpace
    const materialSuelo = new THREE.MeshStandardMaterial({ map: texturaCesped, roughness: 1 })

    // La parte de arriba del césped debe coincidir EXACTAMENTE con fisicas.sueloY,
    // si no el personaje parece flotar sobre el suelo.
    const alturaCesped = 0.55
    const alturaTierra = 3
    const cesped = new THREE.Mesh(new THREE.BoxGeometry(34, alturaCesped, 3), materialSuelo)
    cesped.position.set(0, fisicas.current.sueloY - alturaCesped / 2, -1.6)
    cesped.receiveShadow = true
    escena.add(cesped)

    const tierra = new THREE.Mesh(new THREE.BoxGeometry(34, alturaTierra, 3), materialTierra)
    tierra.position.set(0, fisicas.current.sueloY - alturaCesped - alturaTierra / 2, -1.6)
    escena.add(tierra)

    // Sombra elíptica bajo Lulipop: ancla visualmente al personaje al suelo,
    // se encoge y se desvanece un poco cuando salta más alto
    const sombraLulipop = new THREE.Mesh(
      new THREE.CircleGeometry(0.55, 24),
      new THREE.MeshBasicMaterial({ color: '#2f3542', transparent: true, opacity: 0.22 })
    )
    sombraLulipop.position.set(-3.5, fisicas.current.sueloY + 0.02, 0.4)
    escena.add(sombraLulipop)

    // ----------------------------------------------------------------
    // PROTAGONISTA: SPRITE DE LULIPOP
    // ----------------------------------------------------------------
    const grupoLulipop = new THREE.Group()
    const escalaBaseSprite = 2.2

    textureLoader.load(`${baseUrl}assets/mascota.png`, (textura) => {
      const materialLulipop = new THREE.SpriteMaterial({ map: textura, color: 0xffffff })
      const spriteLulipop = new THREE.Sprite(materialLulipop)
      spriteLulipop.scale.set(escalaBaseSprite, escalaBaseSprite, 1)
      spriteLulipop.position.y = 1.1
      grupoLulipop.add(spriteLulipop)
      lulipopSpriteRef.current = spriteLulipop
    })

    grupoLulipop.position.set(-3.5, fisicas.current.sueloY, 0)
    escena.add(grupoLulipop)

    // ----------------------------------------------------------------
    // CARRILES DE OBJETOS (obstáculos, donuts, gemas, corazones)
    // ----------------------------------------------------------------
    const NUM_CARRILES = 6
    let proximoSpawnX = 6

    for (let i = 0; i < NUM_CARRILES; i++) {
      const grupo = new THREE.Group()
      // Los dos primeros carriles son siempre premios amistosos para un inicio suave,
      // y el tercero siempre es un obstáculo para que se vean desde el principio
      const tipo = i < 2 ? 'premio' : i === 2 ? 'obstaculo' : elegirTipo(VIDAS_MAX)
      poblarObjeto(grupo, tipo, fisicas.current.sueloY)
      grupo.position.x = proximoSpawnX
      proximoSpawnX += 4.5 + Math.random() * 2.2
      escena.add(grupo)
      obstaculosRef.current.push(grupo)
    }

    const boxLulipop = new THREE.Box3()
    const boxObjeto = new THREE.Box3()

    // ----------------------------------------------------------------
    // PARTÍCULAS
    // ----------------------------------------------------------------
    const dispararParticulas = (posicion, color, cantidad) => {
      for (let i = 0; i < cantidad; i++) {
        const tam = 0.06 + Math.random() * 0.09
        const mat = new THREE.MeshBasicMaterial({ color, transparent: true })
        const p = new THREE.Mesh(new THREE.BoxGeometry(tam, tam, tam), mat)
        p.position.copy(posicion)
        const angulo = Math.random() * Math.PI * 2
        const velocidad = 0.05 + Math.random() * 0.09
        p.userData = {
          vx: Math.cos(angulo) * velocidad,
          vy: Math.random() * 0.13 + 0.05,
          vz: (Math.random() - 0.5) * 0.05,
          vida: 1
        }
        escena.add(p)
        particulasRef.current.push(p)
      }
    }

    // ----------------------------------------------------------------
    // LÓGICA DE JUEGO
    // ----------------------------------------------------------------
    const finalizarJuego = () => {
      jugandoRef.current = false
      cambiarEstado('gameover')
      sonidoGameOver()
      const puntosFinales = puntosRef.current
      try {
        const clave = claveRecord(perfil?.id)
        const anterior = parseInt(localStorage.getItem(clave) || '0', 10) || 0
        if (puntosFinales > anterior) {
          localStorage.setItem(clave, String(puntosFinales))
          if (montadoRef.current) { setRecord(puntosFinales); setEsNuevoRecord(true) }
        } else {
          if (montadoRef.current) { setRecord(anterior); setEsNuevoRecord(false) }
        }
      } catch {
        if (montadoRef.current) setEsNuevoRecord(false)
      }
    }

    const manejarColision = () => {
      sonidoChoque()
      vidasRef.current = Math.max(0, vidasRef.current - 1)
      if (montadoRef.current) setVidas(vidasRef.current)
      comboRef.current = 0
      if (montadoRef.current) setCombo(0)

      dispararParticulas(grupoLulipop.position, '#ff6b6b', 12)
      shakeRef.current = { tiempo: 14, intensidad: 0.18 }
      fisicas.current.velocidadJuego = fisicas.current.velocidadBase * 0.3
      if (lulipopSpriteRef.current) lulipopSpriteRef.current.material.rotation = -0.3
      colisionCooldownRef.current = 45

      programarTimeout(() => {
        if (fisicas.current.enSuelo && lulipopSpriteRef.current) lulipopSpriteRef.current.material.rotation = 0
      }, 500)

      if (vidasRef.current <= 0) {
        finalizarJuego()
      } else {
        if (montadoRef.current) {
          setMensaje(vidasRef.current === 1 ? '¡Cuidado! Última vida 💔' : '¡Uy! 😅')
          programarTimeout(() => setMensaje(''), 1200)
        }
      }
    }

    const manejarRecogida = (tipo, obj) => {
      obj.userData.activo = false
      const posicionOrigen = obj.position.clone()

      // Pequeño "pop" de escala antes de esconder el objeto: se siente mucho
      // más satisfactorio que desaparecer de golpe
      obj.userData.animRecogida = { t: 0, total: 10 }

      if (tipo === 'premio') {
        comboRef.current += 1
        if (montadoRef.current) setCombo(comboRef.current)
        sonidoEstrella()
        dispararParticulas(posicionOrigen, '#ffd166', 10)
        let extra = 0
        if (comboRef.current % 5 === 0) {
          extra = 1
          sonidoCombo()
          if (montadoRef.current) {
            setMensaje('¡Racha de 5! +1 extra 🌟')
            programarTimeout(() => setMensaje(''), 1300)
          }
        }
        puntosRef.current += 1 + extra
        if (montadoRef.current) setPuntos(puntosRef.current)
      } else if (tipo === 'gema') {
        comboRef.current += 1
        if (montadoRef.current) setCombo(comboRef.current)
        sonidoGema()
        dispararParticulas(posicionOrigen, '#7d5fff', 12)
        puntosRef.current += 3
        if (montadoRef.current) setPuntos(puntosRef.current)
      } else if (tipo === 'corazon') {
        sonidoVida()
        dispararParticulas(posicionOrigen, '#ff6b81', 12)
        if (vidasRef.current < VIDAS_MAX) {
          vidasRef.current += 1
          if (montadoRef.current) {
            setVidas(vidasRef.current)
            setMensaje('¡Vida extra! 💗')
          }
        } else {
          comboRef.current += 1
          if (montadoRef.current) setCombo(comboRef.current)
          puntosRef.current += 2
          if (montadoRef.current) { setPuntos(puntosRef.current); setMensaje('+2 puntos 💗') }
        }
        if (montadoRef.current) programarTimeout(() => setMensaje(''), 1200)
      }
    }

    const iniciarSalto = () => {
      if (!fisicas.current.enSuelo) return
      sonidoSalto()
      fisicas.current.vy = fisicas.current.salto
      fisicas.current.enSuelo = false
      spriteAnimRef.current = { tipo: 'salto', t: 8, total: 8 }
    }

    const manejarToqueInterno = () => {
      if (estadoRef.current === 'inicio') {
        sonidoInicio()
        jugandoRef.current = true
        cambiarEstado('jugando')
        return
      }
      if (estadoRef.current === 'gameover') return
      iniciarSalto()
    }

    const reiniciarJuego = () => {
      puntosRef.current = 0
      if (montadoRef.current) setPuntos(0)
      vidasRef.current = VIDAS_MAX
      if (montadoRef.current) setVidas(VIDAS_MAX)
      comboRef.current = 0
      if (montadoRef.current) setCombo(0)

      fisicas.current.vy = 0
      fisicas.current.enSuelo = true
      fisicas.current.velocidadBase = 0.10
      fisicas.current.velocidadJuego = 0.10
      fisicas.current.tiempo = 0
      grupoLulipop.position.y = fisicas.current.sueloY

      if (lulipopSpriteRef.current) {
        lulipopSpriteRef.current.material.rotation = 0
        lulipopSpriteRef.current.scale.set(escalaBaseSprite, escalaBaseSprite, 1)
      }

      let siguienteX = 6
      obstaculosRef.current.forEach((obj, i) => {
        const tipo = i < 2 ? 'premio' : i === 2 ? 'obstaculo' : elegirTipo(VIDAS_MAX)
        poblarObjeto(obj, tipo, fisicas.current.sueloY)
        obj.position.x = siguienteX
        siguienteX += 4.5 + Math.random() * 2.2
      })

      if (montadoRef.current) setEsNuevoRecord(false)
      if (montadoRef.current) setMensaje('')
      jugandoRef.current = true
      cambiarEstado('jugando')
    }

    accionesRef.current = { tocar: manejarToqueInterno, reiniciar: reiniciarJuego }

    // Teclado (accesibilidad / pruebas de escritorio)
    const manejarTecla = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        manejarToqueInterno()
      }
    }
    window.addEventListener('keydown', manejarTecla)

    // ----------------------------------------------------------------
    // BUCLE PRINCIPAL
    // ----------------------------------------------------------------
    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop)

      // El césped "corre" bajo los pies como una cinta transportadora, incluso
      // con un pequeño avance de fondo en las pantallas de inicio/fin
      texturaCesped.offset.x -= (jugandoRef.current ? fisicas.current.velocidadJuego : 0.01) * 0.35

      if (jugandoRef.current) {
        fisicas.current.tiempo += 0.1

        // Dificultad progresiva: la velocidad objetivo sube suavemente con la puntuación
        fisicas.current.velocidadBase = Math.min(0.10 + puntosRef.current * 0.0025, 0.20)
        fisicas.current.velocidadJuego += (fisicas.current.velocidadBase - fisicas.current.velocidadJuego) * 0.04

        // Animación de correr / saltar (balanceo)
        if (lulipopSpriteRef.current) {
          if (fisicas.current.enSuelo) {
            lulipopSpriteRef.current.material.rotation = Math.sin(fisicas.current.tiempo * 1.5) * 0.1
          } else {
            lulipopSpriteRef.current.material.rotation = 0.15
          }
        }

        // Squash & stretch al saltar/aterrizar
        let escalaX = 1, escalaY = 1
        if (spriteAnimRef.current.t > 0) {
          const progreso = spriteAnimRef.current.t / spriteAnimRef.current.total
          if (spriteAnimRef.current.tipo === 'salto') {
            escalaX = 1 - 0.15 * progreso
            escalaY = 1 + 0.15 * progreso
          } else if (spriteAnimRef.current.tipo === 'aterrizaje') {
            escalaX = 1 + 0.18 * progreso
            escalaY = 1 - 0.18 * progreso
          }
          spriteAnimRef.current.t -= 1
        }
        if (lulipopSpriteRef.current) {
          lulipopSpriteRef.current.scale.set(escalaBaseSprite * escalaX, escalaBaseSprite * escalaY, 1)
        }

        // Físicas de salto
        if (!fisicas.current.enSuelo) {
          fisicas.current.vy -= fisicas.current.gravedad
          grupoLulipop.position.y += fisicas.current.vy

          if (grupoLulipop.position.y <= fisicas.current.sueloY) {
            grupoLulipop.position.y = fisicas.current.sueloY
            fisicas.current.enSuelo = true
            fisicas.current.vy = 0
            spriteAnimRef.current = { tipo: 'aterrizaje', t: 10, total: 10 }
            if (lulipopSpriteRef.current) lulipopSpriteRef.current.material.rotation = 0
          }
        }

        if (colisionCooldownRef.current > 0) colisionCooldownRef.current -= 1

        // La sombra sigue a Lulipop y se encoge/desvanece cuanto más alto salta
        const alturaSalto = Math.max(0, grupoLulipop.position.y - fisicas.current.sueloY)
        const factorSombra = Math.max(0.35, 1 - alturaSalto / 3)
        sombraLulipop.position.x = grupoLulipop.position.x
        sombraLulipop.scale.set(factorSombra, factorSombra, 1)
        sombraLulipop.material.opacity = 0.22 * factorSombra

        boxLulipop.setFromObject(grupoLulipop)
        boxLulipop.expandByScalar(-0.6)

        obstaculosRef.current.forEach(obj => {
          obj.position.x -= fisicas.current.velocidadJuego

          const tipo = obj.userData.tipo
          if (tipo === 'premio' || tipo === 'gema') {
            obj.rotation.y += 0.04
          } else if (tipo === 'corazon') {
            obj.position.y = obj.userData.baseY + Math.sin(fisicas.current.tiempo * 3 + obj.userData.offset) * 0.15
            obj.rotation.y += 0.02
          }

          if (obj.userData.activo) {
            boxObjeto.setFromObject(obj)
            boxObjeto.expandByScalar(tipo === 'obstaculo' ? -0.32 : -0.1)
            if (colisionCooldownRef.current === 0 && boxLulipop.intersectsBox(boxObjeto)) {
              if (tipo === 'obstaculo') manejarColision()
              else manejarRecogida(tipo, obj)
            }
          }

          if (obj.userData.animRecogida) {
            const anim = obj.userData.animRecogida
            anim.t += 1
            const progreso = anim.t / anim.total
            const escalaPop = progreso < 0.4
              ? 1 + 0.5 * (progreso / 0.4)
              : Math.max(0, 1.5 * (1 - (progreso - 0.4) / 0.6))
            obj.scale.set(escalaPop, escalaPop, escalaPop)
            if (anim.t >= anim.total) {
              obj.userData.animRecogida = null
              obj.scale.set(1, 1, 1)
              obj.position.y += 20
            }
          }

          if (obj.position.x < -6) {
            const gap = 4.5 + Math.random() * 2.3 + fisicas.current.velocidadBase * 11
            obj.position.x = proximoSpawnX
            proximoSpawnX += gap
            poblarObjeto(obj, elegirTipo(vidasRef.current), fisicas.current.sueloY)
          }
        })
      } else if (estadoRef.current === 'inicio') {
        // Pantalla de inicio: pequeño balanceo de bienvenida
        grupoLulipop.position.y = fisicas.current.sueloY + Math.sin(fisicas.current.tiempo * 0.6) * 0.08
        fisicas.current.tiempo += 0.05
        if (lulipopSpriteRef.current) lulipopSpriteRef.current.material.rotation = Math.sin(fisicas.current.tiempo * 1.2) * 0.06
      }

      // Partículas (siguen su curso incluso si el juego está en pausa/fin)
      particulasRef.current = particulasRef.current.filter(p => {
        p.userData.vida -= 0.035
        if (p.userData.vida <= 0) {
          escena.remove(p)
          p.geometry.dispose()
          p.material.dispose()
          return false
        }
        p.userData.vy -= 0.006
        p.position.x += p.userData.vx
        p.position.y += p.userData.vy
        p.position.z += p.userData.vz
        p.material.opacity = Math.max(p.userData.vida, 0)
        p.rotation.x += 0.12
        p.rotation.y += 0.12
        return true
      })

      // Sacudida de cámara al chocar
      if (shakeRef.current.tiempo > 0) {
        const intensidad = shakeRef.current.intensidad * (shakeRef.current.tiempo / 14)
        camara.position.x = camaraBaseX + (Math.random() - 0.5) * intensidad
        camara.position.y = camaraBaseY + (Math.random() - 0.5) * intensidad
        shakeRef.current.tiempo -= 1
      } else if (camara.position.x !== camaraBaseX || camara.position.y !== camaraBaseY) {
        camara.position.x = camaraBaseX
        camara.position.y = camaraBaseY
      }

      renderer.render(escena, camara)
    }

    loop()

    return () => {
      montadoRef.current = false
      timeoutsRef.current.forEach(id => clearTimeout(id))
      timeoutsRef.current = []
      window.removeEventListener('keydown', manejarTecla)
      cancelAnimationFrame(animFrameRef.current)
      particulasRef.current.forEach(p => { p.geometry.dispose(); p.material.dispose() })
      particulasRef.current = []
      texturaCesped.dispose()
      texturaTierra.dispose()
      renderer.dispose()
      if (contenedor) contenedor.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const manejarToque = () => { accionesRef.current.tocar?.() }
  const manejarReinicio = () => { accionesRef.current.reiniciar?.() }

  const estrellasFinales = puntos >= 30 ? 3 : puntos >= 15 ? 2 : puntos >= 5 ? 1 : 0

  return (
    <div
      onPointerDown={manejarToque}
      style={{
        width: '100vw', height: '100dvh',
        background: 'linear-gradient(180deg, #c7ecee 0%, #dff9fb 100%)',
        position: 'absolute', top: 0, left: 0, zIndex: 10,
        overflow: 'hidden', touchAction: 'none', userSelect: 'none',
        fontFamily: '"Fredoka", sans-serif'
      }}
    >
      {/* CIELO: ilustración real con sol y nubes, en bucle horizontal lento */}
      <div className="capa-cielo" style={{
        position: 'absolute', top: 0, left: 0, width: '200%', height: '100%',
        backgroundImage: `url(${baseUrl}assets/fondo-cielo.jpg)`,
        backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundPosition: 'left top',
        zIndex: 0
      }} />

      {/* COLINAS: ilustración real con flores, capa intermedia con parallax más rápido */}
      <div className="capa-colinas" style={{
        position: 'absolute', bottom: 0, left: 0, width: '200%', height: '42%',
        backgroundImage: `url(${baseUrl}assets/fondo-colinas.png)`,
        backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundPosition: 'left bottom',
        zIndex: 0
      }} />

      <div ref={mountRef} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }} />

      {/* BARRA SUPERIOR */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
        <button onClick={onVolver} style={{
          width: '55px', height: '55px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#FF5E62',
          border: '3px solid white', fontSize: '24px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
        }}>❮</button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.9)', padding: '10px 25px', borderRadius: '25px',
            border: '4px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}>
            <span style={{ fontSize: '28px' }}>🍩</span>
            <span style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFD166', textShadow: '0 2px 0 #CCAC00' }}>{puntos}</span>
          </div>

          <div style={{ display: 'flex', gap: '4px' }}>
            {Array.from({ length: VIDAS_MAX }).map((_, i) => (
              <span key={i} style={{ fontSize: '1.5rem', filter: i < vidas ? 'none' : 'grayscale(1) opacity(0.5)' }}>
                {i < vidas ? '❤️' : '🤍'}
              </span>
            ))}
          </div>

          {combo >= 2 && estado === 'jugando' && (
            <div className="anim-fade-scale" style={{
              backgroundColor: 'rgba(255,209,102,0.95)', padding: '4px 14px', borderRadius: '16px',
              fontWeight: '800', fontSize: '0.95rem', color: '#a6660b', boxShadow: '0 4px 10px rgba(0,0,0,0.12)'
            }}>
              🔥 Racha x{combo}
            </div>
          )}
        </div>
      </div>

      {/* MENSAJE FLOTANTE */}
      {mensaje && (
        <div key={mensaje} className="anim-pop" style={{
          position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255,255,255,0.85)', padding: '12px 30px', borderRadius: '30px',
          border: '3px solid white', fontWeight: '900', fontSize: '1.2rem', color: '#2ed573',
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', zIndex: 10,
          pointerEvents: 'none', whiteSpace: 'nowrap'
        }}>
          {mensaje}
        </div>
      )}

      {/* PANTALLA DE INICIO */}
      {estado === 'inicio' && (
        <div className="anim-fade-scale" style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 15, pointerEvents: 'none'
        }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '32px', padding: '36px 32px',
            border: '5px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center',
            maxWidth: '340px'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '4px' }}>🏃‍♀️🍩</div>
            <div style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FF5E62', marginBottom: '10px' }}>
              ¡Carrera con Lulipop!
            </div>
            <div style={{ fontSize: '1rem', color: '#576574', marginBottom: '18px', lineHeight: 1.4 }}>
              Toca la pantalla para saltar. Esquiva arbustos y piedras, recoge donuts y gemas ✨ y cuida tus corazones 💗
            </div>
            {record > 0 && (
              <div style={{ fontSize: '0.95rem', color: '#a6660b', fontWeight: '700', marginBottom: '14px' }}>
                🏆 Mejor puntuación: {record}
              </div>
            )}
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={manejarToque}
              style={{
                pointerEvents: 'auto', border: 'none', borderRadius: '20px', padding: '14px 40px',
                background: 'linear-gradient(180deg, #FF9F43 0%, #FF5E62 100%)', color: 'white',
                fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 8px 0 #c0392b'
              }}
            >
              ¡Vamos! 🚀
            </button>
          </div>
        </div>
      )}

      {/* PANTALLA DE FIN DE JUEGO */}
      {estado === 'gameover' && (
        <div className="anim-fade-scale" style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 15, pointerEvents: 'none'
        }}>
          <div style={{
            backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '32px', padding: '32px', textAlign: 'center',
            border: '5px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', maxWidth: '340px'
          }}>
            <div style={{ fontSize: '2.6rem', marginBottom: '4px' }}>{esNuevoRecord ? '🏆' : '🎈'}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#FF5E62', marginBottom: '6px' }}>
              {esNuevoRecord ? '¡Nuevo récord!' : '¡Buen intento!'}
            </div>
            <div style={{ fontSize: '1.7rem', marginBottom: '4px' }}>
              {'⭐'.repeat(estrellasFinales)}{'☆'.repeat(3 - estrellasFinales)}
            </div>
            <div style={{ fontSize: '1.1rem', color: '#576574', marginBottom: '4px' }}>
              Puntuación: <strong style={{ color: '#FFD166' }}>{puntos} 🍩</strong>
            </div>
            <div style={{ fontSize: '0.95rem', color: '#a6660b', fontWeight: '700', marginBottom: '20px' }}>
              🏆 Mejor puntuación: {record}
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={manejarReinicio}
                style={{
                  pointerEvents: 'auto', border: 'none', borderRadius: '18px', padding: '12px 26px',
                  background: 'linear-gradient(180deg, #FF9F43 0%, #FF5E62 100%)', color: 'white',
                  fontWeight: '900', fontSize: '1.05rem', cursor: 'pointer', boxShadow: '0 6px 0 #c0392b'
                }}
              >
                Jugar de nuevo 🔄
              </button>
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onVolver}
                style={{
                  pointerEvents: 'auto', border: '3px solid #dfe4ea', borderRadius: '18px', padding: '12px 26px',
                  backgroundColor: 'white', color: '#576574',
                  fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer'
                }}
              >
                Volver al mundo
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .anim-pop { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: translateX(-50%) scale(0.8); opacity: 0; } 100% { transform: translateX(-50%) scale(1); opacity: 1; } }
        .anim-fade-scale { animation: fadeScaleIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes fadeScaleIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .capa-cielo { animation: desplazarFondo 90s linear infinite; }
        .capa-colinas { animation: desplazarFondo 26s linear infinite; }
        @keyframes desplazarFondo { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>
    </div>
  )
}
