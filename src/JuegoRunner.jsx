import React, { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import fondoImg from './fondo-lulipop.png'

// --- SINTETIZADOR DE AUDIO ---
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
    sonidoSalto: () => { crearTono(400, 800, 0, 0.3, 'sine', 0.2) }, // Salto más alegre
    sonidoEstrella: () => { 
      crearTono(880, null, 0, 0.1, 'sine', 0.1)
      crearTono(1318, null, 0.08, 0.15, 'sine', 0.1)
      crearTono(1760, null, 0.16, 0.2, 'sine', 0.15)
    }, 
    sonidoChoque: () => { crearTono(150, 80, 0, 0.4, 'sawtooth', 0.15) } // Choque más notorio
  }
}

export default function JuegoRunner({ perfil, onVolver }) {
  const mountRef = useRef(null)
  const animFrameRef = useRef(null)
  
  const [puntos, setPuntos] = useState(0)
  const [juegoActivo, setJuegoActivo] = useState(false)
  const [mensaje, setMensaje] = useState('¡Toca para saltar!')

  const { sonidoSalto, sonidoEstrella, sonidoChoque } = usarSonidosRunner()

  const lulipopSpriteRef = useRef(null) // Referencia al sprite 2D de Lulipop
  const obstaculosRef = useRef([]) 
  const nubesRef = useRef([]) 
  const colisionCooldownRef = useRef(0) 
  
  // baseUrl para cargar la textura correcta de mascota.png
  const baseUrl = import.meta.env.BASE_URL

  const fisicas = useRef({
    vy: 0,
    // Ajustes de salto más "flotantes" y permisivos
    gravedad: 0.012, 
    salto: 0.26,
    sueloY: -0.2, // Ajustado para que el sprite pise bien el césped
    enSuelo: true,
    velocidadJuego: 0.10, // Un poco más lento para mejor sincronización
    tiempo: 0 
  })

  useEffect(() => {
    const contenedor = mountRef.current
    if (!contenedor) return

    const escena = new THREE.Scene()
    
    // Cámara más cercana para ver bien a la mascota
    const aspecto = contenedor.clientWidth / contenedor.clientHeight
    const tamanoCamara = 4.5 
    const camara = new THREE.OrthographicCamera(-tamanoCamara * aspecto, tamanoCamara * aspecto, tamanoCamara, -tamanoCamara, 0.1, 100)
    camara.position.set(0, 1.5, 10)

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

    // ----------------------------------------------------------------
    // EL SUELO DE CÉSPED
    // ----------------------------------------------------------------
    const materialSuelo = new THREE.MeshStandardMaterial({ 
      color: '#7bed9f', // Verde césped vibrante
      roughness: 1,
    })
    
    // Añadimos una franja de tierra debajo del césped para darle profundidad
    const materialTierra = new THREE.MeshStandardMaterial({ color: '#eccc68', roughness: 1 })
    
    const grupoSuelo = new THREE.Group()
    
    const cesped = new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 3), materialSuelo)
    cesped.position.y = -0.2
    cesped.receiveShadow = true
    grupoSuelo.add(cesped)

    const tierra = new THREE.Mesh(new THREE.BoxGeometry(30, 2, 3), materialTierra)
    tierra.position.y = -1.4
    grupoSuelo.add(tierra)

    grupoSuelo.position.y = -1
    escena.add(grupoSuelo)

    // Nubes
    const matNube = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 1 })
    for(let i=0; i<4; i++) {
      const nube = new THREE.Group()
      const n1 = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), matNube)
      const n2 = new THREE.Mesh(new THREE.SphereGeometry(0.6, 16, 16), matNube)
      n2.position.set(0.6, -0.2, 0)
      const n3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), matNube)
      n3.position.set(-0.6, -0.2, 0)
      nube.add(n1, n2, n3)
      nube.position.set(Math.random() * 20 - 10, 2.5 + Math.random() * 2, -3)
      escena.add(nube)
      nubesRef.current.push(nube)
    }

    // ----------------------------------------------------------------
    // EL PROTAGONISTA: SPRITE DE LULIPOP (mascota.png)
    // ----------------------------------------------------------------
    const textureLoader = new THREE.TextureLoader()
    
    const grupoLulipop = new THREE.Group()
    
    // Cargamos la imagen real de la mascota
    textureLoader.load(`${baseUrl}assets/mascota.png`, (textura) => {
      const materialLulipop = new THREE.SpriteMaterial({ map: textura, color: 0xffffff })
      const spriteLulipop = new THREE.Sprite(materialLulipop)
      
      // Ajustamos la escala para que tenga buen tamaño
      spriteLulipop.scale.set(2.2, 2.2, 1) 
      
      // Lo movemos un poco hacia arriba dentro de su grupo para que el pivote (centro) sea la base de los pies
      spriteLulipop.position.y = 1.1 
      
      grupoLulipop.add(spriteLulipop)
      lulipopSpriteRef.current = spriteLulipop // Guardamos ref para animarlo
    })

    grupoLulipop.position.set(-3.5, fisicas.current.sueloY, 0)
    escena.add(grupoLulipop)

    // ----------------------------------------------------------------
    // OBSTÁCULOS (Arbustos) Y PREMIOS (Donuts)
    // ----------------------------------------------------------------
    const matArbusto = new THREE.MeshStandardMaterial({ color: '#2ed573', roughness: 0.9 })
    const matPremio = new THREE.MeshStandardMaterial({ color: '#ffa502', metalness: 0.3, roughness: 0.2 })
    
    const crearArbusto = () => {
      const g = new THREE.Group()
      // Arbusto más redondito y amigable
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), matArbusto)
      c.position.y = 0.5
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), matArbusto)
      l.position.set(-0.4, 0.35, 0)
      const r = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), matArbusto)
      r.position.set(0.4, 0.35, 0)
      g.add(c, l, r)
      g.children.forEach(ch => ch.castShadow = true)
      return g
    }
    
    const geoDonut = new THREE.TorusGeometry(0.4, 0.15, 12, 24)

    for (let i = 0; i < 5; i++) {
      const esPremio = Math.random() > 0.5
      let objeto
      
      if (esPremio) {
        objeto = new THREE.Mesh(geoDonut, matPremio)
        objeto.castShadow = true
      } else {
        objeto = crearArbusto()
      }

      objeto.position.set(6 + i * 5, fisicas.current.sueloY + (esPremio ? 1.5 : 0), 0) 
      objeto.userData = { tipo: esPremio ? 'premio' : 'obstaculo', activo: true }
      escena.add(objeto)
      obstaculosRef.current.push(objeto)
    }

    // HITBOXES (Cajas de colisión invisibles)
    const boxLulipop = new THREE.Box3()
    const boxObjeto = new THREE.Box3()

    // ----------------------------------------------------------------
    // EL MOTOR DEL JUEGO
    // ----------------------------------------------------------------
    const loop = () => {
      animFrameRef.current = requestAnimationFrame(loop)
      fisicas.current.tiempo += 0.1

      // A. ANIMACIÓN DE LULIPOP (Mascota real)
      if (lulipopSpriteRef.current) {
        if (fisicas.current.enSuelo) {
          // Balanceo al correr
          lulipopSpriteRef.current.material.rotation = Math.sin(fisicas.current.tiempo * 1.5) * 0.1
        } else {
          // Rotación fija al saltar
          lulipopSpriteRef.current.material.rotation = 0.15
        }
      }

      // B. FÍSICAS DE SALTO
      if (!fisicas.current.enSuelo) {
        fisicas.current.vy -= fisicas.current.gravedad 
        grupoLulipop.position.y += fisicas.current.vy

        if (grupoLulipop.position.y <= fisicas.current.sueloY) {
          grupoLulipop.position.y = fisicas.current.sueloY
          fisicas.current.enSuelo = true
          fisicas.current.vy = 0
          if (lulipopSpriteRef.current) lulipopSpriteRef.current.material.rotation = 0
        }
      }

      // C. ANIMAR NUBES
      nubesRef.current.forEach(nube => {
        nube.position.x -= fisicas.current.velocidadJuego * 0.2 
        if (nube.position.x < -10) nube.position.x = 10
      })

      // D. MOVER OBJETOS Y DETECTAR COLISIONES (MUY PERMISIVAS)
      if (colisionCooldownRef.current > 0) colisionCooldownRef.current -= 1
      
      // Actualizar hitbox de Lulipop. 
      boxLulipop.setFromObject(grupoLulipop)
      // REDUCIMOS DRÁSTICAMENTE LA HITBOX DEL PROTAGONISTA
      // Hacemos que sea un cuadradito muy pequeño en el centro de Lulipop
      boxLulipop.expandByScalar(-0.6) 

      obstaculosRef.current.forEach(obj => {
        if (!obj.userData.activo) return

        obj.position.x -= fisicas.current.velocidadJuego
        
        if (obj.userData.tipo === 'premio') {
          obj.rotation.y += 0.04
        }

        boxObjeto.setFromObject(obj)
        // Reducimos también la hitbox de los obstáculos/premios
        boxObjeto.expandByScalar(-0.1)

        if (boxLulipop.intersectsBox(boxObjeto) && colisionCooldownRef.current === 0) {
          if (obj.userData.tipo === 'premio') {
            sonidoEstrella()
            setPuntos(p => p + 1)
            obj.position.y += 10 
          } else {
            sonidoChoque()
            setMensaje('¡Uy! 😅')
            setTimeout(() => setMensaje('¡Toca para saltar!'), 1000)
            
            // Efecto visual de daño
            fisicas.current.velocidadJuego = 0.03 
            if(lulipopSpriteRef.current) lulipopSpriteRef.current.material.rotation = -0.3
            setTimeout(() => { 
              fisicas.current.velocidadJuego = 0.10
              if(fisicas.current.enSuelo && lulipopSpriteRef.current) lulipopSpriteRef.current.material.rotation = 0
            }, 800)
            
            colisionCooldownRef.current = 40 
          }
        }

        // Reciclar objetos (Se ha aumentado la distancia entre ellos `Math.random() * 6` para que sea más fácil)
        if (obj.position.x < -6) {
          obj.position.x = 12 + Math.random() * 6 
          const esPremio = Math.random() > 0.4
          
          obj.clear() 
          if (esPremio) {
            obj.add(new THREE.Mesh(geoDonut, matPremio))
            obj.position.y = fisicas.current.sueloY + 1.2 + Math.random() * 1.5
          } else {
            obj.add(crearArbusto())
            obj.position.y = fisicas.current.sueloY 
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
        background: 'linear-gradient(180deg, #c7ecee 0%, #dff9fb 100%)', // Cielo suave
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
          <span style={{ fontSize: '28px' }}>🍩</span>
          <span style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFD166', textShadow: '0 2px 0 #CCAC00' }}>{puntos}</span>
        </div>
      </div>

      <div className="anim-pop" style={{
        position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255,255,255,0.85)', padding: '12px 30px', borderRadius: '30px',
        border: '3px solid white', fontWeight: '900', fontSize: '1.2rem', color: '#2ed573', // Verde a juego con arbustos
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
