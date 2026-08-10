import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import fondoImg from './fondo-lulipop.png'

// ------------------------------------------------------------------
// SINTETIZADOR DE AUDIO (Web Audio API)
// Genera sonidos estilo retro 8-bit / Cartoon sin cargar archivos
// ------------------------------------------------------------------
function usarSonidosRunner() {
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

  // Función base para generar tonos
  const crearTono = (freqInicio, freqFin, inicio, duracion, tipo = 'sine', volumen = 0.15) => {
    const ctx = obtenerContexto()
    if (!ctx) return
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = tipo
    
    // Si hay frecuencia final, hacemos un "barrido" (sweep) típico de juegos retro
    osc.frequency.setValueAtTime(freqInicio, ctx.currentTime + inicio)
    if (freqFin) {
      osc.frequency.exponentialRampToValueAtTime(freqFin, ctx.currentTime + inicio + duracion)
    }

    // Envolvente de volumen para que no suene un "click" brusco
    gain.gain.setValueAtTime(0, ctx.currentTime + inicio)
    gain.gain.linearRampToValueAtTime(volumen, ctx.currentTime + inicio + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + inicio + duracion)
    
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(ctx.currentTime + inicio)
    osc.stop(ctx.currentTime + inicio + duracion)
  }

  return {
    // Boing ascendente (de grave a agudo rápido)
    sonidoSalto: () => { crearTono(300, 600, 0, 0.25, 'sine', 0.2) }, 
    
    // Campanilla mágica (tres notas muy rápidas)
    sonidoEstrella: () => { 
      crearTono(880, null, 0, 0.1, 'sine', 0.1)
      crearTono(1318, null, 0.08, 0.15, 'sine', 0.1)
      crearTono(1760, null, 0.16, 0.2, 'sine', 0.15)
    }, 
    
    // Freno/boing grave descendente
    sonidoChoque: () => { crearTono(200, 100, 0, 0.3, 'sawtooth', 0.1) } 
  }
}

export default function JuegoRunner({ perfil, onVolver }) {
  const mountRef = useRef(null)
  const animFrameRef = useRef(null)
  
  // Estados de la UI
  const [puntos, setPuntos] = useState(0)
  const [juegoActivo, setJuegoActivo] = useState(false)
  const [mensaje, setMensaje] = useState('¡Toca para saltar!')

  // Hook de sonidos
  const { sonidoSalto, sonidoEstrella, sonidoChoque } = usarSonidosRunner()

  // Referencias para el Game Loop (sin re-renders)
  const lulipopRef = useRef(null)
  const obstaculosRef = useRef([]) 
  const colisionCooldownRef = useRef(0) 
  
  const fisicas = useRef({
    vy: 0,
    gravedad: 0.015,
    salto: 0.28,
    sueloY: 0.5,
    enSuelo: true,
    velocidadJuego: 0.12
  })

  useEffect(() => {
    const contenedor = mountRef.current
    if (!contenedor) return

    const escena = new THREE.Scene()
    
    const aspecto = contenedor.clientWidth / contenedor.clientHeight
    const tamanoCamara = 5
    const camara = new THREE.OrthographicCamera(-tamanoCamara * aspecto, tamanoCamara * aspecto, tamanoCamara, -tamanoCamara, 0.1, 100)
    camara.position.set(0, 2, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    contenedor.appendChild(renderer.domElement)

    // Luces suaves
    const luzAmbiente = new THREE.HemisphereLight('#BFEFFF', '#FFD8E4', 0.9)
    escena.add(luzAmbiente)
    const luzSol = new THREE.DirectionalLight('#FFFFFF', 1)
    luzSol.position.set(5, 10, 5)
    luzSol.castShadow = true
    luzSol.shadow.camera.left = -10; luzSol.shadow.camera.right = 10
    luzSol.shadow.camera.top = 5; luzSol.shadow.camera.bottom = -5
    escena.add(luzSol)

    // El Suelo
    const suelo = new THREE.Mesh(
      new THREE.BoxGeometry(30, 2, 3),
      new THREE.MeshStandardMaterial({ color: '#43e97b', roughness: 0.8 })
    )
    suelo.position.y = -0.5
    suelo.receiveShadow = true
    escena.add(suelo)

    // LULIPOP (Provisional: Esfera + Palito)
    const grupoLulipop = new THREE.Group()
    const caramelo = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshStandardMaterial({ color: '#FF758C', roughness: 0.3 })
    )
    caramelo.castShadow = true
    caramelo.position.y = 0.6
    grupoLulipop.add(caramelo)

    const palito = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: '#FFE8D6' })
    )
    palito.position.y = -0.1
    palito.castShadow = true
    grupoLulipop.add(palito)

    grupoLulipop.position.set(-3, fisicas.current.sueloY, 0)
    escena.add(grupoLulipop)
    lulipopRef.current = grupoLulipop

    // OBSTÁCULOS Y PREMIOS
    const matObstaculo = new THREE.MeshStandardMaterial({ color: '#94A3B8' })
    const matPremio = new THREE.MeshStandardMaterial({ color: '#FFD166' })
    const geoCubo = new THREE.BoxGeometry(0.8, 0.8, 0.8)
    const geoEstrella = new THREE.OctahedronGeometry(0.5, 0) 

    for (let i = 0; i < 5; i++) {
      const esPremio = Math.random() > 0.5
      const malla = new THREE.Mesh(esPremio ? geoEstrella : geoCubo, esPremio ? matPremio : matObstaculo)
      malla.castShadow = true
      malla.position.set(5 + i * 4, fisicas.current.sueloY + (esPremio ? 1 : 0), 0) 
      malla.userData = { tipo: esPremio ? 'premio' : 'obstaculo', activo: true }
      escena.add(malla)
      obstaculosRef.current.push(malla)
    }

    const boxLulipop = new THREE.Box3()
    const boxObjeto = new THREE.Box3()

    // BUCLE DE JUEGO (60 FPS)
    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop)

      // A. FÍSICAS DE SALTO
      if (!fisicas.current.enSuelo) {
        fisicas.current.vy -= fisicas.current.gravedad 
        grupoLulipop.position.y += fisicas.current.vy
        grupoLulipop.rotation.z -= 0.1

        if (grupoLulipop.position.y <= fisicas.current.sueloY) {
          grupoLulipop.position.y = fisicas.current.sueloY
          fisicas.current.enSuelo = true
          fisicas.current.vy = 0
          grupoLulipop.rotation.z = 0 
        }
      }

      // B. MOVER EL MUNDO Y COLISIONES
      if (colisionCooldownRef.current > 0) colisionCooldownRef.current -= 1
      boxLulipop.setFromObject(grupoLulipop) 

      obstaculosRef.current.forEach(obj => {
        if (!obj.userData.activo) return

        obj.position.x -= fisicas.current.velocidadJuego
        
        if (obj.userData.tipo === 'premio') {
          obj.rotation.y += 0.05
          obj.rotation.x += 0.02
        }

        boxObjeto.setFromObject(obj)
        if (boxLulipop.intersectsBox(boxObjeto) && colisionCooldownRef.current === 0) {
          if (obj.userData.tipo === 'premio') {
            // ¡Pilló una estrella! (SONIDO Y PUNTOS)
            sonidoEstrella()
            setPuntos(p => p + 1)
            obj.position.y += 10 
          } else {
            // Chocó contra un bloque gris (SONIDO Y FRENAZO)
            sonidoChoque()
            setMensaje('¡Cuidado! 😅')
            setTimeout(() => setMensaje('¡Toca para saltar!'), 1000)
            fisicas.current.velocidadJuego = 0.05 
            setTimeout(() => { fisicas.current.velocidadJuego = 0.12 }, 800)
            colisionCooldownRef.current = 30 
          }
        }

        // Reciclar objetos fuera de pantalla
        if (obj.position.x < -6) {
          obj.position.x = 10 + Math.random() * 3 
          const esPremio = Math.random() > 0.4
          obj.geometry = esPremio ? geoEstrella : geoCubo
          obj.material = esPremio ? matPremio : matObstaculo
          obj.position.y = fisicas.current.sueloY + (esPremio ? 0.8 + Math.random() * 1.5 : 0)
          obj.userData = { tipo: esPremio ? 'premio' : 'obstaculo', activo: true }
        }
      })

      renderer.render(escena, camara)
    }
    
    loop() 

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      renderer.dispose()
      if (contenedor) contenedor.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // CONTROL: TOCAR PARA SALTAR
  const manejarToque = () => {
    if (!juegoActivo) setJuegoActivo(true)
    
    if (fisicas.current.enSuelo) {
      sonidoSalto() // ¡Reproducir sonido de salto!
      fisicas.current.vy = fisicas.current.salto
      fisicas.current.enSuelo = false
    }
  }

  return (
    <div 
      onPointerDown={manejarToque}
      style={{
        width: '100vw', height: '100dvh',
        backgroundImage: `url(${fondoImg})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        position: 'absolute', top: 0, left: 0, zIndex: 10,
        overflow: 'hidden', touchAction: 'none', userSelect: 'none',
        fontFamily: '"Fredoka", sans-serif'
      }}
    >
      <div ref={mountRef} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }} />

      <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
        <button onClick={onVolver} style={{
          width: '55px', height: '55px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#FF5E62',
          border: '3px solid white', fontSize: '24px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)'
        }}>❮</button>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.9)', padding: '10px 25px', borderRadius: '25px',
          border: '4px solid white', boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <span style={{ fontSize: '28px' }}>⭐️</span>
          <span style={{ fontSize: '2rem', fontWeight: '900', color: '#FFD166', textShadow: '0 2px 0 #CCAC00' }}>{puntos}</span>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255,255,255,0.85)', padding: '12px 30px', borderRadius: '30px',
        border: '3px solid white', fontWeight: '900', fontSize: '1.2rem', color: '#4facfe',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', zIndex: 10
      }}>
        {mensaje}
      </div>
    </div>
  )
}
