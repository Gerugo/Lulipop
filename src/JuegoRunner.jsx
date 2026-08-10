import React, { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import fondoImg from './fondo-lulipop.png'

export default function JuegoRunner({ perfil, onVolver }) {
  const mountRef = useRef(null)
  const animFrameRef = useRef(null)
  
  // Estados de React para la UI (Marcador y pantallas)
  const [puntos, setPuntos] = useState(0)
  const [juegoActivo, setJuegoActivo] = useState(false)
  const [mensaje, setMensaje] = useState('¡Toca para saltar!')

  // Referencias mutables para el Game Loop (a 60fps, sin re-renderizar React)
  const lulipopRef = useRef(null)
  const obstaculosRef = useRef([]) // Pool de objetos reciclables
  const colisionCooldownRef = useRef(0) // Para no chocar varias veces seguidas
  
  const fisicas = useRef({
    vy: 0,
    gravedad: 0.015,
    salto: 0.28,
    sueloY: 0.5,
    enSuelo: true,
    velocidadJuego: 0.12
  })

  // ----------------------------------------------------------------
  // 1. INICIALIZACIÓN DEL MUNDO 3D
  // ----------------------------------------------------------------
  useEffect(() => {
    const contenedor = mountRef.current
    if (!contenedor) return

    const escena = new THREE.Scene()
    
    // Cámara Ortográfica: Elimina la perspectiva. Da el look de juego 2D plano pero con volumen 3D.
    const aspecto = contenedor.clientWidth / contenedor.clientHeight
    const tamanoCamara = 5
    const camara = new THREE.OrthographicCamera(-tamanoCamara * aspecto, tamanoCamara * aspecto, tamanoCamara, -tamanoCamara, 0.1, 100)
    camara.position.set(0, 2, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    contenedor.appendChild(renderer.domElement)

    // Luces suaves (Estilo Lulipop)
    const luzAmbiente = new THREE.HemisphereLight('#BFEFFF', '#FFD8E4', 0.9)
    escena.add(luzAmbiente)
    const luzSol = new THREE.DirectionalLight('#FFFFFF', 1)
    luzSol.position.set(5, 10, 5)
    luzSol.castShadow = true
    luzSol.shadow.camera.left = -10; luzSol.shadow.camera.right = 10
    luzSol.shadow.camera.top = 5; luzSol.shadow.camera.bottom = -5
    escena.add(luzSol)

    // El Suelo (Una cinta infinita visualmente)
    const suelo = new THREE.Mesh(
      new THREE.BoxGeometry(30, 2, 3),
      new THREE.MeshStandardMaterial({ color: '#43e97b', roughness: 0.8 })
    )
    suelo.position.y = -0.5
    suelo.receiveShadow = true
    escena.add(suelo)

    // ----------------------------------------------------------------
    // 2. CREAR AL PROTAGONISTA (LULIPOP)
    // ----------------------------------------------------------------
    const grupoLulipop = new THREE.Group()
    
    // El caramelo (Esfera)
    const caramelo = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshStandardMaterial({ color: '#FF758C', roughness: 0.3 })
    )
    caramelo.castShadow = true
    caramelo.position.y = 0.6
    grupoLulipop.add(caramelo)

    // El palito (Cilindro)
    const palito = new THREE.Mesh(
      new THREE.CylinderGeometry(0.1, 0.1, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: '#FFE8D6' })
    )
    palito.position.y = -0.1
    palito.castShadow = true
    grupoLulipop.add(palito)

    // Lulipop se queda fijo a la izquierda de la pantalla
    grupoLulipop.position.set(-3, fisicas.current.sueloY, 0)
    escena.add(grupoLulipop)
    lulipopRef.current = grupoLulipop

    // ----------------------------------------------------------------
    // 3. SISTEMA DE OBSTÁCULOS Y PREMIOS (Object Pooling)
    // ----------------------------------------------------------------
    const matObstaculo = new THREE.MeshStandardMaterial({ color: '#94A3B8' }) // Bloque gris
    const matPremio = new THREE.MeshStandardMaterial({ color: '#FFD166' })    // Estrella amarilla
    const geoCubo = new THREE.BoxGeometry(0.8, 0.8, 0.8)
    const geoEstrella = new THREE.OctahedronGeometry(0.5, 0) // Parece un diamante/estrella

    // Creamos 5 objetos que iremos reciclando (para no saturar memoria)
    for (let i = 0; i < 5; i++) {
      const esPremio = Math.random() > 0.5
      const malla = new THREE.Mesh(esPremio ? geoEstrella : geoCubo, esPremio ? matPremio : matObstaculo)
      malla.castShadow = true
      // Los colocamos fuera de la pantalla por la derecha, separados
      malla.position.set(5 + i * 4, fisicas.current.sueloY + (esPremio ? 1 : 0), 0) 
      malla.userData = { tipo: esPremio ? 'premio' : 'obstaculo', activo: true }
      escena.add(malla)
      obstaculosRef.current.push(malla)
    }

    // Cajas invisibles para calcular colisiones
    const boxLulipop = new THREE.Box3()
    const boxObjeto = new THREE.Box3()

    // ----------------------------------------------------------------
    // 4. EL MOTOR DEL JUEGO (GAME LOOP a 60 FPS)
    // ----------------------------------------------------------------
    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop)

      // A. FÍSICAS DE SALTO
      if (!fisicas.current.enSuelo) {
        fisicas.current.vy -= fisicas.current.gravedad // La gravedad tira hacia abajo
        grupoLulipop.position.y += fisicas.current.vy
        
        // Girar en el aire para que quede chulo
        grupoLulipop.rotation.z -= 0.1

        // Chocar contra el suelo
        if (grupoLulipop.position.y <= fisicas.current.sueloY) {
          grupoLulipop.position.y = fisicas.current.sueloY
          fisicas.current.enSuelo = true
          fisicas.current.vy = 0
          grupoLulipop.rotation.z = 0 // Enderezar
        }
      }

      // B. MOVER EL MUNDO (Cinta de correr)
      if (colisionCooldownRef.current > 0) colisionCooldownRef.current -= 1
      boxLulipop.setFromObject(grupoLulipop) // Actualizar la caja de choque del jugador

      obstaculosRef.current.forEach(obj => {
        if (!obj.userData.activo) return

        // Mover hacia la izquierda
        obj.position.x -= fisicas.current.velocidadJuego
        
        // Hacer girar los premios
        if (obj.userData.tipo === 'premio') {
          obj.rotation.y += 0.05
          obj.rotation.x += 0.02
        }

        // C. DETECTAR COLISIONES
        boxObjeto.setFromObject(obj)
        if (boxLulipop.intersectsBox(boxObjeto) && colisionCooldownRef.current === 0) {
          if (obj.userData.tipo === 'premio') {
            setPuntos(p => p + 1)
            obj.position.y += 10 // Lo mandamos al cielo (desaparece)
          } else {
            // Chocó contra un bloque gris (Sin castigo, solo un frenazo)
            setMensaje('¡Cuidado! 😅')
            setTimeout(() => setMensaje('¡Toca para saltar!'), 1000)
            fisicas.current.velocidadJuego = 0.05 // Frenazo temporal
            setTimeout(() => { fisicas.current.velocidadJuego = 0.12 }, 800)
            colisionCooldownRef.current = 30 // Frames de invulnerabilidad
          }
        }

        // D. RECICLAR OBJETOS (Cuando salen por la izquierda)
        if (obj.position.x < -6) {
          obj.position.x = 10 + Math.random() * 3 // Vuelve a la derecha
          const esPremio = Math.random() > 0.4
          obj.geometry = esPremio ? geoEstrella : geoCubo
          obj.material = esPremio ? matPremio : matObstaculo
          obj.position.y = fisicas.current.sueloY + (esPremio ? 0.8 + Math.random() * 1.5 : 0)
          obj.userData = { tipo: esPremio ? 'premio' : 'obstaculo', activo: true }
        }
      })

      renderer.render(escena, camara)
    }
    
    loop() // ¡Arrancar motor!

    // Limpieza de memoria al salir
    return () => {
      cancelAnimationFrame(animFrameRef.current)
      renderer.dispose()
      if (contenedor) contenedor.innerHTML = ''
    }
  }, [])

  // ----------------------------------------------------------------
  // 5. CONTROL: TOCAR PARA SALTAR
  // ----------------------------------------------------------------
  const manejarToque = () => {
    if (!juegoActivo) setJuegoActivo(true)
    
    // Solo puede saltar si está pisando el suelo
    if (fisicas.current.enSuelo) {
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
      {/* CAPA 3D (Fondo) */}
      <div ref={mountRef} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }} />

      {/* CAPA UI (Frente) */}
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
