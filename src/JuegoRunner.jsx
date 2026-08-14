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
// CONSTANTES Y HELPERS DE ESCENA
// ============================================================
const VIDAS_MAX = 3
const claveRecord = (perfilId) => `lulipop_runner_record_${perfilId || 'anon'}`

const geoDonut = new THREE.TorusGeometry(0.4, 0.15, 12, 24)
const matPremio = new THREE.MeshStandardMaterial({ color: '#ffa502', metalness: 0.3, roughness: 0.2 })
const matGema = new THREE.MeshStandardMaterial({ color: '#7d5fff', emissive: '#7d5fff', emissiveIntensity: 0.45, metalness: 0.5, roughness: 0.2 })
const matCorazon = new THREE.MeshStandardMaterial({ color: '#ff6b81', emissive: '#ff4757', emissiveIntensity: 0.3, roughness: 0.3 })

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
  const mat = new THREE.SpriteMaterial({ transparent: true, color: COLORES_RESPALDO[i], opacity: 0.9 })
  cargadorObstaculos.load(
    `${BASE_ASSETS}assets/obstaculos/${archivo}`,
    (tex) => {
      if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace
      mat.map = tex
      mat.color.set('#ffffff')
      mat.needsUpdate = true
    },
    undefined,
    (error) => { console.warn('No se pudo cargar la textura decorativa:', archivo, error) }
  )
  return mat
})

function crearDecoracionCandy() {
  const indice = Math.floor(Math.random() * CANDY_ASSETS.length)
  const { w, h } = CANDY_ASSETS[indice]
  const variacion = 0.85 + Math.random() * 0.3
  const alturaMundo = 1.7 * variacion
  const anchoMundo = alturaMundo * (w / h)

  const g = new THREE.Group()
  const sprite = new THREE.Sprite(materialesCandy[indice])
  sprite.scale.set(anchoMundo, alturaMundo, 1)
  sprite.position.y = alturaMundo / 2
  g.add(sprite)
  return g
}

function crearTexturaSombraGenerica() {
  const c = document.createElement('canvas')
  c.width = 128
  c.height = 128
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
  g.addColorStop(0, 'rgba(40,40,50,0.4)')
  g.addColorStop(0.7, 'rgba(40,40,50,0.18)')
  g.addColorStop(1, 'rgba(40,40,50,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}
const matSombraObstaculo = new THREE.MeshBasicMaterial({
  map: crearTexturaSombraGenerica(), transparent: true, depthWrite: false
})

const COLORES_CARAMELO = ['#e84150', '#c0392b', '#8b4513', '#3d3d5c', '#2f3542']

function crearObstaculoCaramelo() {
  const color = COLORES_CARAMELO[Math.floor(Math.random() * COLORES_CARAMELO.length)]
  const tam = 0.8 + Math.random() * 0.25
  const matCuerpo = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1 })
  const matEnvoltorio = new THREE.MeshStandardMaterial({ color, roughness: 0.5 })
  const matBrillo = new THREE.MeshStandardMaterial({
    color: '#ffffff', transparent: true, opacity: 0.45, roughness: 0.1
  })

  const g = new THREE.Group()

  const sombra = new THREE.Mesh(
    new THREE.PlaneGeometry(tam * 1.6, tam * 0.6),
    matSombraObstaculo
  )
  sombra.position.set(0, 0.03, 0.05)
  g.add(sombra)

  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(tam, tam, tam), matCuerpo)
  cuerpo.position.y = tam / 2
  cuerpo.castShadow = true
  g.add(cuerpo)

  const brillo = new THREE.Mesh(new THREE.BoxGeometry(tam * 0.2, tam * 0.8, tam * 1.01), matBrillo)
  brillo.position.set(-tam * 0.22, tam / 2, 0)
  brillo.rotation.z = 0.5
  g.add(brillo)

  const envIzq = new THREE.Mesh(new THREE.ConeGeometry(tam * 0.34, tam * 0.42, 6), matEnvoltorio)
  envIzq.rotation.z = Math.PI / 2
  envIzq.position.set(-tam * 0.64, tam / 2, 0)
  envIzq.castShadow = true
  g.add(envIzq)

  const envDer = envIzq.clone()
  envDer.rotation.z = -Math.PI / 2
  envDer.position.set(tam * 0.64, tam / 2, 0)
  g.add(envDer)

  return g
}

const COLORES_PLATAFORMA = ['#ffb3c6', '#bcd4ff', '#c9f2c7', '#ffe4a3']

function crearPlataforma() {
  const ancho = 1.7 + Math.random() * 0.7
  const alto = 0.32
  const profundo = 0.85
  const color = COLORES_PLATAFORMA[Math.floor(Math.random() * COLORES_PLATAFORMA.length)]
  const matCuerpo = new THREE.MeshStandardMaterial({ color, roughness: 0.4 })
  const matRaya = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.45 })

  const g = new THREE.Group()

  const cuerpo = new THREE.Mesh(new THREE.BoxGeometry(ancho, alto, profundo), matCuerpo)
  cuerpo.castShadow = true
  cuerpo.receiveShadow = true
  g.add(cuerpo)

  const numRayas = 3
  for (let i = 0; i < numRayas; i++) {
    const raya = new THREE.Mesh(new THREE.BoxGeometry(ancho * 0.14, alto * 1.02, profundo * 1.02), matRaya)
    raya.position.x = (i - (numRayas - 1) / 2) * (ancho / numRayas)
    g.add(raya)
  }

  g.userData.ancho = ancho
  g.userData.alto = alto
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

function elegirTipo(vidasActuales) {
  const r = Math.random()
  if (r < 0.42) return 'obstaculo'
  if (r < 0.48 && vidasActuales < VIDAS_MAX) return 'corazon'
  if (r < 0.62) return 'gema'
  return 'premio'
}

function poblarObjeto(grupo, tipo, sueloY) {
  grupo.clear()
  grupo.scale.set(1, 1, 1)
  if (tipo === 'obstaculo') {
    grupo.add(crearObstaculoCaramelo())
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

  const [estado, setEstado] = useState('inicio')
  const [puntos, setPuntos] = useState(0)
  const [distancia, setDistancia] = useState(0)
  const [vidas, setVidas] = useState(VIDAS_MAX)
  const [combo, setCombo] = useState(0)
  const [mensaje, setMensaje] = useState('')
  const [record, setRecord] = useState(0)
  const [esNuevoRecord, setEsNuevoRecord] = useState(false)

  const {
    sonidoSalto, sonidoEstrella, sonidoGema, sonidoVida,
    sonidoCombo, sonidoChoque, sonidoGameOver, sonidoInicio
  } = usarSonidosRunner()

  const estadoRef = useRef('inicio')
  const jugandoRef = useRef(false)
  const vidasRef = useRef(VIDAS_MAX)
  const puntosRef = useRef(0)
  const distanciaRef = useRef(0)
  const distanciaMostradaRef = useRef(0)
  const comboMaxRef = useRef(0)
  const ultimoHitoRef = useRef(0)
  const comboRef = useRef(0)
  const montadoRef = useRef(true)
  const timeoutsRef = useRef([])
  const accionesRef = useRef({})

  const lulipopSpriteRef = useRef(null)
  const piernaIzqRef = useRef(null)
  const piernaDerRef = useRef(null)
  const obstaculosRef = useRef([])
  const decorativosRef = useRef([])
  const plataformasRef = useRef([])
  const particulasRef = useRef([])
  const colisionCooldownRef = useRef(0)
  const spriteAnimRef = useRef({ tipo: null, t: 0, total: 1 })
  const shakeRef = useRef({ tiempo: 0, intensidad: 0 })

  const baseUrl = import.meta.env.BASE_URL

  const fisicas = useRef({
    vy: 0,
    gravedad: 0.012,
    salto: 0.26,
    sueloY: -1.6,
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

  useEffect(() => {
    try {
      const guardado = parseInt(localStorage.getItem(claveRecord(perfil?.id)) || '0', 10)
      if (!Number.isNaN(guardado)) setRecord(guardado)
    } catch { /* continuar sin localStorage */ }
  }, [perfil?.id])

  useEffect(() => {
    const contenedor = mountRef.current
    if (!contenedor) return

    montadoRef.current = true

    const escena = new THREE.Scene()
    const textureLoader = new THREE.TextureLoader() // Instancia única para todo el componente

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

    const ajustarTamano = () => {
      const w = contenedor.clientWidth
      const h = contenedor.clientHeight
      if (!w || !h) return
      const nuevoAspecto = w / h
      camara.left = -tamanoCamara * nuevoAspecto
      camara.right = tamanoCamara * nuevoAspecto
      camara.top = tamanoCamara
      camara.bottom = -tamanoCamara
      camara.updateProjectionMatrix()
      renderer.setSize(w, h)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    }
    ajustarTamano()

    window.addEventListener('resize', ajustarTamano)
    window.addEventListener('orientationchange', ajustarTamano)
    let observadorTamano = null
    if (typeof ResizeObserver !== 'undefined') {
      observadorTamano = new ResizeObserver(ajustarTamano)
      observadorTamano.observe(contenedor)
    }

    // LUCES
    const luzAmbiente = new THREE.HemisphereLight('#ffffff', '#FFD8E4', 0.8)
    escena.add(luzAmbiente)
    const luzSol = new THREE.DirectionalLight('#FFF3E0', 1.2)
    luzSol.position.set(5, 12, 6)
    luzSol.castShadow = true
    luzSol.shadow.mapSize.width = 1024
    luzSol.shadow.mapSize.height = 1024
    escena.add(luzSol)

    // SUELO PROCEDURAL
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

    const anchoTexCesped = 256
    const altoTexCesped = 110
    const canvasCesped = document.createElement('canvas')
    canvasCesped.width = anchoTexCesped
    canvasCesped.height = altoTexCesped
    const cctx = canvasCesped.getContext('2d')

    cctx.fillStyle = '#8ee6a8'
    cctx.fillRect(0, 0, anchoTexCesped, altoTexCesped)

    cctx.fillStyle = '#7ad696'
    for (let i = 0; i < 8; i++) {
      const cx = (i + 0.5) * (anchoTexCesped / 8)
      const cy = 55 + 18 * Math.sin(i * 1.7)
      const r = 14 + 5 * Math.cos(i * 0.9)
      cctx.beginPath()
      cctx.ellipse(cx, cy, r, r * 0.55, 0, 0, Math.PI * 2)
      cctx.fill()
    }

    const numBriznas = 26
    cctx.fillStyle = '#5fc47f'
    for (let i = 0; i < numBriznas; i++) {
      const x = (i / numBriznas) * anchoTexCesped
      const h = 16 + 8 * Math.sin(i * 1.3)
      cctx.beginPath()
      cctx.moveTo(x - 5, 30)
      cctx.quadraticCurveTo(x - 3, 30 - h * 0.7, x, 30 - h)
      cctx.quadraticCurveTo(x + 3, 30 - h * 0.7, x + 5, 30)
      cctx.closePath()
      cctx.fill()
    }

    const coloresFlor = ['#ffd166', '#ff9fc7', '#ffffff']
    for (let i = 0; i < 12; i++) {
      cctx.fillStyle = coloresFlor[i % coloresFlor.length]
      const x = (i + 0.5) * (anchoTexCesped / 12)
      const y = 66 + 20 * Math.cos(i * 2.1)
      cctx.beginPath()
      cctx.arc(x, y, 2.6, 0, Math.PI * 2)
      cctx.fill()
    }

    const texturaCesped = new THREE.CanvasTexture(canvasCesped)
    texturaCesped.wrapS = THREE.RepeatWrapping
    texturaCesped.wrapT = THREE.ClampToEdgeWrapping
    texturaCesped.repeat.set(14, 1)
    if ('colorSpace' in texturaCesped) texturaCesped.colorSpace = THREE.SRGBColorSpace
    const materialSuelo = new THREE.MeshStandardMaterial({ map: texturaCesped, roughness: 1 })

    const alturaCesped = 0.7
    const alturaTierra = 3
    const cesped = new THREE.Mesh(new THREE.BoxGeometry(34, alturaCesped, 3), materialSuelo)
    cesped.position.set(0, fisicas.current.sueloY - alturaCesped / 2, -1.6)
    cesped.receiveShadow = true
    escena.add(cesped)

    const tierra = new THREE.Mesh(new THREE.BoxGeometry(34, alturaTierra, 3), materialTierra)
    tierra.position.set(0, fisicas.current.sueloY - alturaCesped - alturaTierra / 2, -1.6)
    escena.add(tierra)

    // SOMBRA DE LULIPOP
    const canvasSombra = document.createElement('canvas')
    canvasSombra.width = 128
    canvasSombra.height = 128
    const ctxSombra = canvasSombra.getContext('2d')
    const gradienteSombra = ctxSombra.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradienteSombra.addColorStop(0, 'rgba(40,40,50,0.45)')
    gradienteSombra.addColorStop(0.7, 'rgba(40,40,50,0.22)')
    gradienteSombra.addColorStop(1, 'rgba(40,40,50,0)')
    ctxSombra.fillStyle = gradienteSombra
    ctxSombra.fillRect(0, 0, 128, 128)
    const texturaSombra = new THREE.CanvasTexture(canvasSombra)

    const sombraLulipop = new THREE.Mesh(
      new THREE.PlaneGeometry(1.3, 0.55),
      new THREE.MeshBasicMaterial({ map: texturaSombra, transparent: true, depthWrite: false })
    )
    sombraLulipop.position.set(-3.5, fisicas.current.sueloY + 0.03, 0.35)
    escena.add(sombraLulipop)

    // PERSONAJE LULIPOP
    const grupoLulipop = new THREE.Group()
    const grupoVisual = new THREE.Group()
    grupoLulipop.add(grupoVisual)

    const ESCALA_PX = 2.2 / 500
    const ALTURA_PIERNA = 66 * ESCALA_PX

    const cargarParte = (archivo, w, h, anclaY) => new Promise((resolve) => {
      textureLoader.load(`${baseUrl}assets/${archivo}`, (tex) => {
        if ('colorSpace' in tex) tex.colorSpace = THREE.SRGBColorSpace
        const mat = new THREE.SpriteMaterial({ map: tex, color: 0xffffff })
        const sprite = new THREE.Sprite(mat)
        sprite.center.set(0.5, anclaY)
        sprite.scale.set(w * ESCALA_PX, h * ESCALA_PX, 1)
        resolve(sprite)
      })
    })

    Promise.all([
      cargarParte('mascota-cuerpo.png', 500, 389, 0),
      cargarParte('mascota-pierna-izq.png', 73, 66, 1),
      cargarParte('mascota-pierna-der.png', 107, 66, 1)
    ]).then(([spriteCuerpo, spritePiernaIzq, spritePiernaDer]) => {
      spriteCuerpo.position.y = ALTURA_PIERNA
      spritePiernaIzq.position.set(-0.301, ALTURA_PIERNA, 0.01)
      spritePiernaDer.position.set(0.227, ALTURA_PIERNA, 0.01)

      grupoVisual.add(spritePiernaIzq, spritePiernaDer, spriteCuerpo)
      lulipopSpriteRef.current = spriteCuerpo
      piernaIzqRef.current = spritePiernaIzq
      piernaDerRef.current = spritePiernaDer
    })

    grupoLulipop.position.set(-3.5, fisicas.current.sueloY, 0)
    escena.add(grupoLulipop)

    // CARRILES
    const NUM_CARRILES = 6
    let proximoSpawnX = 6

    for (let i = 0; i < NUM_CARRILES; i++) {
      const grupo = new THREE.Group()
      const tipo = i < 2 ? 'premio' : i === 2 ? 'obstaculo' : elegirTipo(VIDAS_MAX)
      poblarObjeto(grupo, tipo, fisicas.current.sueloY)
      grupo.position.x = proximoSpawnX
      proximoSpawnX += 4.5 + Math.random() * 2.2
      escena.add(grupo)
      obstaculosRef.current.push(grupo)
    }

    // DECORATIVOS PARALLAX
    const NUM_DECOR = 5
    for (let i = 0; i < NUM_DECOR; i++) {
      const deco = crearDecoracionCandy()
      deco.position.set(-6 + i * 6.5 + Math.random() * 3, fisicas.current.sueloY, -1.1)
      escena.add(deco)
      decorativosRef.current.push(deco)
    }

    // PLATAFORMAS
    const NUM_PLATAFORMAS = 3
    let proximoSpawnPlataforma = 14
    for (let i = 0; i < NUM_PLATAFORMAS; i++) {
      const plat = crearPlataforma()
      plat.position.set(proximoSpawnPlataforma, fisicas.current.sueloY + 1.0 + Math.random() * 0.5, 0)
      proximoSpawnPlataforma += 9 + Math.random() * 5
      escena.add(plat)
      plataformasRef.current.push(plat)
    }

    const calcularSueloEnX = (x) => {
      let mejor = fisicas.current.sueloY
      plataformasRef.current.forEach(p => {
        const mitad = p.userData.ancho / 2
        if (x > p.position.x - mitad && x < p.position.x + mitad) {
          const tope = p.position.y + p.userData.alto / 2
          if (tope > mejor) mejor = tope
        }
      })
      return mejor
    }

    const boxLulipop = new THREE.Box3()
    const boxObjeto = new THREE.Box3()

    // PARTÍCULAS
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

    // LÓGICA DE JUEGO
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
      distanciaRef.current = 0
      distanciaMostradaRef.current = 0
      if (montadoRef.current) setDistancia(0)
      comboMaxRef.current = 0
      ultimoHitoRef.current = 0

      fisicas.current.vy = 0
      fisicas.current.enSuelo = true
      fisicas.current.velocidadBase = 0.10
      fisicas.current.velocidadJuego = 0.10
      fisicas.current.tiempo = 0
      grupoLulipop.position.y = fisicas.current.sueloY

      if (lulipopSpriteRef.current) {
        lulipopSpriteRef.current.material.rotation = 0
        grupoVisual.scale.set(1, 1, 1)
      }
      if (piernaIzqRef.current) piernaIzqRef.current.rotation.z = 0
      if (piernaDerRef.current) piernaDerRef.current.rotation.z = 0

      let siguienteX = 6
      obstaculosRef.current.forEach((obj, i) => {
        const tipo = i < 2 ? 'premio' : i === 2 ? 'obstaculo' : elegirTipo(VIDAS_MAX)
        poblarObjeto(obj, tipo, fisicas.current.sueloY)
        obj.position.x = siguienteX
        siguienteX += 4.5 + Math.random() * 2.2
      })
      proximoSpawnX = siguienteX

      let siguientePlataforma = 14
      plataformasRef.current.forEach(plat => {
        plat.position.x = siguientePlataforma
        plat.position.y = fisicas.current.sueloY + 1.0 + Math.random() * 0.5
        siguientePlataforma += 9 + Math.random() * 5
      })
      proximoSpawnPlataforma = siguientePlataforma

      if (montadoRef.current) setEsNuevoRecord(false)
      if (montadoRef.current) setMensaje('')
      jugandoRef.current = true
      cambiarEstado('jugando')
    }

    accionesRef.current = { tocar: manejarToqueInterno, reiniciar: reiniciarJuego }

    const manejarTecla = (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        manejarToqueInterno()
      }
    }
    window.addEventListener('keydown', manejarTecla)

    // BUCLE PRINCIPAL
    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop)

      texturaCesped.offset.x -= (jugandoRef.current ? fisicas.current.velocidadJuego : 0.01) * 0.35

      const velocidadDecor = jugandoRef.current ? fisicas.current.velocidadJuego * 0.45 : 0.008
      decorativosRef.current.forEach(deco => {
        deco.position.x -= velocidadDecor
        if (deco.position.x < -9) deco.position.x = 9 + Math.random() * 4
      })

      if (jugandoRef.current) {
        fisicas.current.tiempo += 0.1

        fisicas.current.velocidadBase = Math.min(0.10 + puntosRef.current * 0.0025, 0.20)
        fisicas.current.velocidadJuego += (fisicas.current.velocidadBase - fisicas.current.velocidadJuego) * 0.04

        distanciaRef.current += fisicas.current.velocidadJuego * 0.6
        const metros = Math.floor(distanciaRef.current)
        if (metros !== distanciaMostradaRef.current) {
          distanciaMostradaRef.current = metros
          if (montadoRef.current) setDistancia(metros)
        }
        if (comboRef.current > comboMaxRef.current) comboMaxRef.current = comboRef.current

        const hitoActual = Math.floor(puntosRef.current / 15)
        if (hitoActual > ultimoHitoRef.current && puntosRef.current > 0) {
          ultimoHitoRef.current = hitoActual
          dispararParticulas(grupoLulipop.position, '#ffd166', 6)
          dispararParticulas(grupoLulipop.position, '#7d5fff', 6)
          dispararParticulas(grupoLulipop.position, '#ff6b81', 6)
          sonidoCombo()
          if (montadoRef.current) {
            setMensaje('¡Racha imparable! 🎉')
            programarTimeout(() => setMensaje(''), 1300)
          }
        }

        if (lulipopSpriteRef.current) {
          if (fisicas.current.enSuelo) {
            lulipopSpriteRef.current.material.rotation = Math.sin(fisicas.current.tiempo * 1.5) * 0.1
            const fase = fisicas.current.tiempo * (16 + fisicas.current.velocidadJuego * 30)
            const zancada = Math.sin(fase) * 0.6
            if (piernaIzqRef.current) piernaIzqRef.current.rotation.z = zancada
            if (piernaDerRef.current) piernaDerRef.current.rotation.z = -zancada
          } else {
            lulipopSpriteRef.current.material.rotation = 0.15
            if (piernaIzqRef.current) piernaIzqRef.current.rotation.z += (0.45 - piernaIzqRef.current.rotation.z) * 0.2
            if (piernaDerRef.current) piernaDerRef.current.rotation.z += (0.3 - piernaDerRef.current.rotation.z) * 0.2
          }
        }

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
        grupoVisual.scale.set(escalaX, escalaY, 1)

        const sueloActual = calcularSueloEnX(grupoLulipop.position.x)

        if (fisicas.current.enSuelo && grupoLulipop.position.y > sueloActual + 0.05) {
          fisicas.current.enSuelo = false
        }

        if (!fisicas.current.enSuelo) {
          fisicas.current.vy -= fisicas.current.gravedad
          grupoLulipop.position.y += fisicas.current.vy

          if (grupoLulipop.position.y <= sueloActual) {
            grupoLulipop.position.y = sueloActual
            fisicas.current.enSuelo = true
            fisicas.current.vy = 0
            spriteAnimRef.current = { tipo: 'aterrizaje', t: 10, total: 10 }
            if (lulipopSpriteRef.current) lulipopSpriteRef.current.material.rotation = 0
            dispararParticulas(grupoLulipop.position, '#e8d4b0', 5)
          }
        }

        if (colisionCooldownRef.current > 0) colisionCooldownRef.current -= 1

        const alturaSalto = Math.max(0, grupoLulipop.position.y - sueloActual)
        const factorSombra = Math.max(0.35, 1 - alturaSalto / 3)
        sombraLulipop.position.x = grupoLulipop.position.x
        sombraLulipop.position.y = sueloActual + 0.03
        sombraLulipop.scale.set(factorSombra, factorSombra, 1)
        sombraLulipop.material.opacity = factorSombra

        boxLulipop.setFromObject(grupoLulipop)
        boxLulipop.min.x += 0.6; boxLulipop.max.x -= 0.6
        boxLulipop.min.y += 0.6; boxLulipop.max.y -= 0.6

        obstaculosRef.current.forEach(obj => {
          obj.position.x -= fisicas.current.velocidadJuego

          const tipo = obj.userData.tipo
          if (tipo === 'premio' || tipo === 'gema') {
            obj.rotation.z += 0.045
          } else if (tipo === 'corazon') {
            obj.position.y = obj.userData.baseY + Math.sin(fisicas.current.tiempo * 3 + obj.userData.offset) * 0.15
            obj.rotation.z += 0.02
          }

          if (obj.userData.activo) {
            boxObjeto.setFromObject(obj)
            const margen = tipo === 'obstaculo' ? 0.12 : 0.1
            boxObjeto.min.x += margen; boxObjeto.max.x -= margen
            boxObjeto.min.y += margen; boxObjeto.max.y -= margen
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

        plataformasRef.current.forEach(plat => {
          plat.position.x -= fisicas.current.velocidadJuego
          if (plat.position.x < -6 - plat.userData.ancho / 2) {
            const gap = 9 + Math.random() * 5
            plat.position.x = proximoSpawnPlataforma
            proximoSpawnPlataforma += gap
            plat.position.y = fisicas.current.sueloY + 1.0 + Math.random() * 0.5
          }
        })
      } else if (estadoRef.current === 'inicio') {
        grupoLulipop.position.y = fisicas.current.sueloY + Math.sin(fisicas.current.tiempo * 0.6) * 0.08
        fisicas.current.tiempo += 0.05
        if (lulipopSpriteRef.current) lulipopSpriteRef.current.material.rotation = Math.sin(fisicas.current.tiempo * 1.2) * 0.06
      }

      // Partículas
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

      // Sacudida de cámara
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

    // Limpieza profunda de memoria
    return () => {
      montadoRef.current = false
      timeoutsRef.current.forEach(id => clearTimeout(id))
      timeoutsRef.current = []
      window.removeEventListener('keydown', manejarTecla)
      window.removeEventListener('resize', ajustarTamano)
      window.removeEventListener('orientationchange', ajustarTamano)
      if (observadorTamano) observadorTamano.disconnect()
      cancelAnimationFrame(animFrameRef.current)

      escena.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })

      particulasRef.current.forEach(p => { p.geometry.dispose(); p.material.dispose() })
      particulasRef.current = []
      texturaCesped.dispose()
      texturaTierra.dispose()
      texturaSombra.dispose()
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
      className="lulipop-runner-raiz"
      style={{
        background: 'linear-gradient(180deg, #c7ecee 0%, #dff9fb 100%)',
        position: 'absolute', top: 0, left: 0, zIndex: 10,
        overflow: 'hidden', touchAction: 'none', userSelect: 'none',
        fontFamily: '"Fredoka", sans-serif'
      }}
    >
      {/* CIELO */}
      <div className="capa-cielo" style={{
        position: 'absolute', top: 0, left: 0, width: '200%', height: '100%',
        backgroundImage: `url(${baseUrl}assets/fondo-cielo.jpg)`,
        backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundPosition: 'left top',
        zIndex: 0
      }} />

      {/* COLINAS */}
      <div className="capa-colinas" style={{
        position: 'absolute', bottom: 0, left: 0, width: '200%', height: '48%',
        backgroundImage: `url(${baseUrl}assets/fondo-colinas.png)`,
        backgroundRepeat: 'repeat-x', backgroundSize: 'auto 100%', backgroundPosition: 'left bottom',
        zIndex: 0
      }} />

      <div ref={mountRef} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }} />

      {/* BARRA SUPERIOR */}
      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button onClick={onVolver} style={{
            width: '55px', height: '55px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#FF5E62',
            border: '3px solid white', fontSize: '24px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
          }}>❮</button>

          {estado === 'jugando' && (
            <div style={{
              backgroundColor: 'rgba(255,255,255,0.75)', padding: '5px 14px',
              borderRadius: '16px', fontWeight: '800', fontSize: '0.9rem', color: '#576574',
              display: 'inline-flex', alignItems: 'center', gap: '5px', width: 'fit-content'
            }}>
              🏃 {distancia} m
            </div>
          )}
        </div>

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
              Toca la pantalla para saltar. Esquiva obstáculos, recoge donuts y gemas ✨ y cuida tus corazones 💗
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
            <div style={{ fontSize: '0.95rem', color: '#576574', marginBottom: '4px' }}>
              🏃 {distancia} m recorridos · 🔥 Mejor racha: {comboMaxRef.current}
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
        .lulipop-runner-raiz { width: 100vw; height: 100vh; height: 100dvh; }
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
