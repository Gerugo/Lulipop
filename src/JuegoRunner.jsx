import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import fondoImg from './fondo-lulipop.png'

// SINTETIZADOR DE AUDIO (Mantenemos la misma magia)
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
    sonidoSalto: () => { crearTono(300, 600, 0, 0.25, 'sine', 0.2) }, 
    sonidoEstrella: () => { 
      crearTono(880, null, 0, 0.1, 'sine', 0.1)
      crearTono(1318, null, 0.08, 0.15, 'sine', 0.1)
      crearTono(1760, null, 0.16, 0.2, 'sine', 0.15)
    }, 
    sonidoChoque: () => { crearTono(200, 100, 0, 0.3, 'sawtooth', 0.1) } 
  }
}

export default function JuegoRunner({ perfil, onVolver }) {
  const mountRef = useRef(null)
  const animFrameRef = useRef(null)
  
  const [puntos, setPuntos] = useState(0)
  const [juegoActivo, setJuegoActivo] = useState(false)
  const [mensaje, setMensaje] = useState('¡Toca para saltar!')

  const { sonidoSalto, sonidoEstrella, sonidoChoque } = usarSonidosRunner()

  const lulipopRef = useRef(null)
  const piesRef = useRef([]) // Para animar las zapatillas
  const obstaculosRef = useRef([]) 
  const nubesRef = useRef([]) 
  const colisionCooldownRef = useRef(0) 
  
  const fisicas = useRef({
    vy: 0,
    gravedad: 0.018, // Un pelín más de gravedad para que el salto se sienta más "pesado"
    salto: 0.30,
    sueloY: 0.5,
    enSuelo: true,
    velocidadJuego: 0.12,
    tiempo: 0 // Para calcular animaciones
  })

  useEffect(() => {
    const contenedor = mountRef.current
    if (!contenedor) return

    const escena = new THREE.Scene()
    
    // Cámara ortográfica para ese look plano pero 3D
    const aspecto = contenedor.clientWidth / contenedor.clientHeight
    const tamanoCamara = 5.5
    const camara = new THREE.OrthographicCamera(-tamanoCamara * aspecto, tamanoCamara * aspecto, tamanoCamara, -tamanoCamara, 0.1, 100)
    camara.position.set(0, 2.5, 10)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(contenedor.clientWidth, contenedor.clientHeight)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    contenedor.appendChild(renderer.domElement)

    // LUCES (Más cálidas para el estilo arcilla)
    const luzAmbiente = new THREE.HemisphereLight('#ffffff', '#FFD8E4', 0.8)
    escena.add(luzAmbiente)
    const luzSol = new THREE.DirectionalLight('#FFF3E0', 1.2)
    luzSol.position.set(5, 12, 6)
    luzSol.castShadow = true
    luzSol.shadow.mapSize.width = 1024
    luzSol.shadow.mapSize.height = 1024
    escena.add(luzSol)

    // ----------------------------------------------------------------
    // EL MUNDO (Suelo estilo Keiki)
    // ----------------------------------------------------------------
    const materialSuelo = new THREE.MeshStandardMaterial({ color: '#A8E6CF', roughness: 0.6 })
    const suelo = new THREE.Mesh(new THREE.BoxGeometry(30, 2, 3), materialSuelo)
    suelo.position.y = -0.5
    suelo.receiveShadow = true
    escena.add(suelo)

    // Nubes de fondo decorativas
    const matNube = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 1 })
    for(let i=0; i<4; i++) {
      const nube = new THREE.Group()
      const n1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), matNube)
      const n2 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), matNube)
      n2.position.set(0.6, -0.2, 0)
      const n3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), matNube)
      n3.position.set(-0.6, -0.2, 0)
      nube.add(n1, n2, n3)
      nube.position.set(Math.random() * 20 - 10, 3 + Math.random() * 2, -3)
      escena.add(nube)
      nubesRef.current.push(nube)
    }

    // ----------------------------------------------------------------
    // EL PROTAGONISTA: LULIPOP
    // ----------------------------------------------------------------
    const grupoLulipop = new THREE.Group()
    
    // Cabeza de caramelo (Cilindro aplanado)
    const cabeza = new THREE.Mesh(
      new THREE.CylinderGeometry(0.7, 0.7, 0.25, 32),
      new THREE.MeshStandardMaterial({ color: '#FFB3BA', roughness: 0.4 })
    )
    cabeza.rotation.x = Math.PI / 2
    cabeza.position.y = 0.8
    cabeza.castShadow = true
    grupoLulipop.add(cabeza)

    // Carita (Ojos y mofletes)
    const matOjo = new THREE.MeshBasicMaterial({ color: '#2D3436' })
    const matRubor = new THREE.MeshBasicMaterial({ color: '#FF758C' })
    
    const ojoI = new THREE.Mesh(new THREE.SphereGeometry(0.08, 16, 16), matOjo)
    ojoI.position.set(-0.25, 0.9, 0.13)
    const ojoD = ojoI.clone(); ojoD.position.set(0.25, 0.9, 0.13)
    
    const ruborI = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.05, 16), matRubor)
    ruborI.rotation.x = Math.PI / 2
    ruborI.position.set(-0.45, 0.75, 0.13)
    const ruborD = ruborI.clone(); ruborD.position.set(0.45, 0.75, 0.13)
    
    grupoLulipop.add(ojoI, ojoD, ruborI, ruborD)

    // Palito
    const palito = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16),
      new THREE.MeshStandardMaterial({ color: '#FFF3E0' })
    )
    palito.position.y = 0.2
    palito.castShadow = true
    grupoLulipop.add(palito)

    // Zapatillas
    const matZapa = new THREE.MeshStandardMaterial({ color: '#AEE1FF', roughness: 0.3 })
    const pieI = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.2, 4, 12), matZapa)
    pieI.position.set(-0.25, -0.2, 0)
    pieI.rotation.z = Math.PI / 2
    pieI.castShadow = true
    const pieD = pieI.clone()
    pieD.position.set(0.25, -0.2, 0)
    
    grupoLulipop.add(pieI, pieD)
    piesRef.current = [pieI, pieD]

    grupoLulipop.position.set(-3.5, fisicas.current.sueloY, 0)
    escena.add(grupoLulipop)
    lulipopRef.current = grupoLulipop

    // ----------------------------------------------------------------
    // OBSTÁCULOS (Arbustos) Y PREMIOS (Donuts Dorados)
    // ----------------------------------------------------------------
    const matArbusto = new THREE.MeshStandardMaterial({ color: '#10ac84', roughness: 0.9 })
    const matPremio = new THREE.MeshStandardMaterial({ color: '#FFD166', metalness: 0.2, roughness: 0.1 })
    
    // Función para crear un arbustito mono
    const crearArbusto = () => {
      const g = new THREE.Group()
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), matArbusto)
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), matArbusto); l.position.set(-0.35, -0.15, 0)
      const r = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), matArbusto); r.position.set(0.35, -0.15, 0)
      g.add(c, l, r)
      g.children.forEach(ch => ch.castShadow = true)
      return g
    }
    
    const geoDonut = new THREE.TorusGeometry(0.35, 0.15, 12, 24)

    for (let i = 0; i < 5; i++) {
      const esPremio = Math.random() > 0.5
      let objeto
      
      if (esPremio) {
        objeto = new THREE.Mesh(geoDonut, matPremio)
        objeto.castShadow = true
      } else {
        objeto = crearArbusto()
      }

      objeto.position.set(6 + i * 4.5, fisicas.current.sueloY + (esPremio ? 1.2 : 0.2), 0) 
      objeto.userData = { tipo: esPremio ? 'premio' : 'obstaculo', activo: true }
      escena.add(objeto)
      obstaculosRef.current.push(objeto)
    }

    const boxLulipop = new THREE.Box3()
    const boxObjeto = new THREE.Box3()

    // ----------------------------------------------------------------
    // EL MOTOR DEL JUEGO
    // ----------------------------------------------------------------
    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop)
      fisicas.current.tiempo += 0.1

      // A. ANIMACIONES DE LULIPOP
      if (fisicas.current.enSuelo) {
        // Animación de correr: Mover las zapatillas adelante y atrás
        piesRef.current[0].position.x = -0.25 + Math.sin(fisicas.current.tiempo * 2.5) * 0.2
        piesRef.current[1].position.x = 0.25 + Math.cos(fisicas.current.tiempo * 2.5) * 0.2
      } else {
        // Zapatillas quietas en el aire
        piesRef.current[0].position.x = -0.25
        piesRef.current[1].position.x = 0.25
      }

      // B. FÍSICAS DE SALTO
      if (!fisicas.current.enSuelo) {
        fisicas.current.vy -= fisicas.current.gravedad 
        grupoLulipop.position.y += fisicas.current.vy
        
        // Efecto visual: inclinarse ligeramente al saltar
        grupoLulipop.rotation.z = fisicas.current.vy * 0.5

        if (grupoLulipop.position.y <= fisicas.current.sueloY) {
          grupoLulipop.position.y = fisicas.current.sueloY
          fisicas.current.enSuelo = true
          fisicas.current.vy = 0
          grupoLulipop.rotation.z = 0 
        }
      }

      // C. ANIMAR NUBES
      nubesRef.current.forEach(nube => {
        nube.position.x -= fisicas.current.velocidadJuego * 0.2 // Parallax suave
        if (nube.position.x < -10) nube.position.x = 10
      })

      // D. MOVER EL MUNDO Y COLISIONES
      if (colisionCooldownRef.current > 0) colisionCooldownRef.current -= 1
      
      // Achicamos un poco la caja de colisión de Lulipop para que sea más permisivo con los peques
      boxLulipop.setFromObject(grupoLulipop) 
      boxLulipop.expandByScalar(-0.15) 

      obstaculosRef.current.forEach(obj => {
        if (!obj.userData.activo) return

        obj.position.x -= fisicas.current.velocidadJuego
        
        if (obj.userData.tipo === 'premio') {
          obj.rotation.y += 0.04
        }

        boxObjeto.setFromObject(obj)
        if (boxLulipop.intersectsBox(boxObjeto) && colisionCooldownRef.current === 0) {
          if (obj.userData.tipo === 'premio') {
            sonidoEstrella()
            setPuntos(p => p + 1)
            obj.position.y += 10 // Ocultar
          } else {
            sonidoChoque()
            setMensaje('¡Uy! 😅')
            setTimeout(() => setMensaje('¡Toca para saltar!'), 1000)
            
            // Efecto visual de daño (Frenazo y rotación hacia atrás)
            fisicas.current.velocidadJuego = 0.03 
            grupoLulipop.rotation.z = 0.5
            setTimeout(() => { 
              fisicas.current.velocidadJuego = 0.12
              if(fisicas.current.enSuelo) grupoLulipop.rotation.z = 0
            }, 800)
            
            colisionCooldownRef.current = 40 // Inmunidad más larga
          }
        }

        // Reciclar objetos fuera de pantalla
        if (obj.position.x < -6) {
          obj.position.x = 12 + Math.random() * 4 
          const esPremio = Math.random() > 0.4
          
          // Reconstruimos el objeto según lo que toque
          obj.clear() 
          if (esPremio) {
            obj.add(new THREE.Mesh(geoDonut, matPremio))
            obj.position.y = fisicas.current.sueloY + 1.2 + Math.random() * 1.5
          } else {
            obj.add(crearArbusto())
            obj.position.y = fisicas.current.sueloY + 0.2
          }
          
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

  const manejarToque = () => {
    if (!juegoActivo) setJuegoActivo(true)
    
    if (fisicas.current.enSuelo) {
      sonidoSalto() 
      fisicas.current.vy = fisicas.current.salto
      fisicas.current.enSuelo = false
    }
  }

  return (
    <div 
      onPointerDown={manejarToque}
      style={{
        width: '100vw', height: '100dvh',
        background: 'linear-gradient(180deg, #E0F7FA 0%, #B2EBF2 100%)', // Cielo azul pastel
        position: 'absolute', top: 0, left: 0, zIndex: 10,
        overflow: 'hidden', touchAction: 'none', userSelect: 'none',
        fontFamily: '"Fredoka", sans-serif'
      }}
    >
      {/* CAPA 3D */}
      <div ref={mountRef} style={{ position: 'absolute', width: '100%', height: '100%', zIndex: 1 }} />

      {/* INTERFAZ UI */}
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
          <span style={{ fontSize: '28px' }}>🍩</span>
          <span style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFD166', textShadow: '0 2px 0 #CCAC00' }}>{puntos}</span>
        </div>
      </div>

      <div className="anim-pop" style={{
        position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255,255,255,0.85)', padding: '12px 30px', borderRadius: '30px',
        border: '3px solid white', fontWeight: '900', fontSize: '1.2rem', color: '#4facfe',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)', backdropFilter: 'blur(5px)', zIndex: 10,
        pointerEvents: 'none'
      }}>
        {mensaje}
      </div>

      <style>{`
        .anim-pop { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: translateX(-50%) scale(0.8); opacity: 0; } 100% { transform: translateX(-50%) scale(1); opacity: 1; } }
      `}</style>
    </div>
  )
}
