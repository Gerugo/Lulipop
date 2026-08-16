import { useRef, useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { supabase } from './supabaseClient'
import NivelSelector from './NivelSelector'
import useMejoresNiveles from './useMejoresNiveles'

// ------------------------------------------------------------------
// CONSTRUCTOR MÁGICO 3D
// El niño coloca piezas en una mesa 3D real y puede arrastrar el dedo
// para girar la cámara y admirar su construcción desde cualquier ángulo.
// Cada nivel propone un reto distinto sobre la misma mesa de juego.
// ------------------------------------------------------------------

const TIPOS_PIEZA = [
  { id: 'cubo', nombre: 'Cubo', emoji: '🧊' },
  { id: 'esfera', nombre: 'Bola', emoji: '⚽' },
  { id: 'cilindro', nombre: 'Cilindro', emoji: '🥫' },
  { id: 'cono', nombre: 'Pirámide', emoji: '🔺' },
]

const COLORES_PIEZA = [
  '#FF5E62', '#4facfe', '#FFD166', '#43e97b', '#a18cd1', '#FF9966'
]

const GRID_LIMITE = 2 // celdas de -2 a 2 -> mesa de 5x5
const ESPACIADO = 1.15
const ALTURA_PIEZA = 1
const MAX_PIEZAS = 40

const NIVELES = [
  { id: 'facil', nombre: 'Fácil', descripcion: 'Torre de 4 pisos', emoji: '🌱', color: '#43e97b', sombra: '#27ae60', objetivo: { tipo: 'altura', valor: 4 }, metaTexto: 'Apila 4 piezas, una encima de otra' },
  { id: 'medio', nombre: 'Medio', descripcion: 'Construye una casita', emoji: '🌿', color: '#4facfe', sombra: '#005580', objetivo: { tipo: 'combo', base: 'cubo', encima: 'cono' }, metaTexto: 'Pon un cubo y encima una pirámide 🏠' },
  { id: 'dificil', nombre: 'Difícil', descripcion: 'Ciudad de 10 piezas', emoji: '🌳', color: '#FF9966', sombra: '#D9534F', objetivo: { tipo: 'cantidad', piezas: 10, columnas: 3 }, metaTexto: 'Usa 10 piezas repartidas en al menos 3 sitios' },
]

function crearGeometria(tipo) {
  switch (tipo) {
    case 'esfera': return new THREE.SphereGeometry(0.48, 24, 18)
    case 'cilindro': return new THREE.CylinderGeometry(0.42, 0.42, 0.92, 20)
    case 'cono': return new THREE.ConeGeometry(0.56, 0.95, 4)
    case 'cubo':
    default: return new THREE.BoxGeometry(0.9, 0.9, 0.9)
  }
}

export default function JuegoConstructor3D({ perfil, onVolver }) {
  const mountRef = useRef(null)
  const escenaRef = useRef(null)
  const camaraRef = useRef(null)
  const rendererRef = useRef(null)
  const controlesRef = useRef(null)
  const raycasterRef = useRef(new THREE.Raycaster())
  const planoSueloRef = useRef(new THREE.Plane(new THREE.Vector3(0, 1, 0), 0))
  const columnasRef = useRef({}) // { "x,z": [{tipo, mesh}, ...] }
  const grupoConstruccionRef = useRef(null)
  const pointerDownRef = useRef({ x: 0, y: 0, tiempo: 0 })
  const animFrameRef = useRef(null)

  const [nivelId, setNivelId] = useState(null)
  const [tipoSeleccionado, setTipoSeleccionado] = useState('cubo')
  const [colorSeleccionado, setColorSeleccionado] = useState(COLORES_PIEZA[0])
  const [totalPiezas, setTotalPiezas] = useState(0)
  const [puedeDeshacer, setPuedeDeshacer] = useState(false)
  const [nivelSuperado, setNivelSuperado] = useState(false)
  const [avisoMesaLlena, setAvisoMesaLlena] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [listoParaJugar, setListoParaJugar] = useState(false)

  const { mejores, guardarMejorNivel } = useMejoresNiveles('constructor3d', perfil?.id)
  const nivel = NIVELES.find((n) => n.id === nivelId)
  const historialRef = useRef([]) // orden de colocación, para "deshacer"

  const empezarNivel = (id) => {
    setNivelId(id)
    setNivelSuperado(false)
  }

  // --------------------------------------------------------------
  // Inicialización de la escena 3D (una sola vez por nivel elegido)
  // --------------------------------------------------------------
  useEffect(() => {
    if (!nivel || !mountRef.current) return

    const contenedor = mountRef.current
    const ancho = contenedor.clientWidth
    const alto = contenedor.clientHeight

    const escena = new THREE.Scene()
    escenaRef.current = escena

    const camara = new THREE.PerspectiveCamera(45, ancho / alto, 0.1, 100)
    camara.position.set(4.2, 4.2, 6.2)
    camaraRef.current = camara

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(ancho, alto)
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    contenedor.innerHTML = ''
    contenedor.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Luces
    const luzAmbiente = new THREE.HemisphereLight('#BFEFFF', '#FFD8E4', 0.85)
    escena.add(luzAmbiente)

    const luzSol = new THREE.DirectionalLight('#FFFFFF', 1.1)
    luzSol.position.set(5, 8, 4)
    luzSol.castShadow = true
    luzSol.shadow.mapSize.set(1024, 1024)
    luzSol.shadow.camera.left = -6
    luzSol.shadow.camera.right = 6
    luzSol.shadow.camera.top = 6
    luzSol.shadow.camera.bottom = -6
    escena.add(luzSol)

    // Mesa / plataforma
    const mesa = new THREE.Mesh(
      new THREE.CylinderGeometry(4.3, 4.5, 0.4, 48),
      new THREE.MeshStandardMaterial({ color: '#FFE8D6', roughness: 0.85 })
    )
    mesa.position.y = -0.2
    mesa.receiveShadow = true
    escena.add(mesa)

    const rejilla = new THREE.GridHelper(ESPACIADO * (GRID_LIMITE * 2 + 1), GRID_LIMITE * 2 + 1, '#ffffff', '#ffffff')
    rejilla.position.y = 0.005
    rejilla.material.transparent = true
    rejilla.material.opacity = 0.35
    escena.add(rejilla)

    const grupoConstruccion = new THREE.Group()
    escena.add(grupoConstruccion)
    grupoConstruccionRef.current = grupoConstruccion

    // Controles de cámara: arrastrar para girar
    const controles = new OrbitControls(camara, renderer.domElement)
    controles.enableDamping = true
    controles.dampingFactor = 0.1
    controles.enablePan = false
    controles.minDistance = 4
    controles.maxDistance = 11
    controles.minPolarAngle = 0.35
    controles.maxPolarAngle = 1.35
    controles.target.set(0, 0.6, 0)
    controles.update()
    controlesRef.current = controles

    // Reset de estado de construcción
    columnasRef.current = {}
    historialRef.current = []
    setTotalPiezas(0)
    setPuedeDeshacer(false)
    setAvisoMesaLlena(false)

    const animar = () => {
      controles.update()
      renderer.render(escena, camara)
      animFrameRef.current = requestAnimationFrame(animar)
    }
    animar()
    setListoParaJugar(true)

    const alRedimensionar = () => {
      if (!contenedor) return
      const w = contenedor.clientWidth
      const h = contenedor.clientHeight
      camara.aspect = w / h
      camara.updateProjectionMatrix()
      renderer.setSize(w, h)
    }
    window.addEventListener('resize', alRedimensionar)
    const observador = new ResizeObserver(alRedimensionar)
    observador.observe(contenedor)

    return () => {
      window.removeEventListener('resize', alRedimensionar)
      observador.disconnect()
      cancelAnimationFrame(animFrameRef.current)
      controles.dispose()
      renderer.dispose()
      escena.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose()
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
          else obj.material.dispose()
        }
      })
      if (contenedor) contenedor.innerHTML = ''
      setListoParaJugar(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivelId])

  const guardarProgreso = useCallback(async () => {
    if (!perfil?.id) return
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'constructor_3d', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }, [perfil])

  // --------------------------------------------------------------
  // Colocar una pieza nueva encima de la columna tocada
  // --------------------------------------------------------------
  const colocarPieza = useCallback((gx, gz) => {
    if (totalPiezas >= MAX_PIEZAS) {
      setAvisoMesaLlena(true)
      setTimeout(() => setAvisoMesaLlena(false), 1800)
      return
    }

    const clave = `${gx},${gz}`
    const columna = columnasRef.current[clave] || []

    const geometria = crearGeometria(tipoSeleccionado)
    const material = new THREE.MeshStandardMaterial({
      color: colorSeleccionado, roughness: 0.35, metalness: 0.08
    })
    const mesh = new THREE.Mesh(geometria, material)
    mesh.castShadow = true
    mesh.receiveShadow = true

    if (tipoSeleccionado === 'cono') mesh.rotation.y = Math.PI / 4

    const y = columna.length * ALTURA_PIEZA + ALTURA_PIEZA / 2
    mesh.position.set(gx * ESPACIADO, y, gz * ESPACIADO)
    mesh.scale.set(0.001, 0.001, 0.001) // aparición animada

    grupoConstruccionRef.current.add(mesh)

    const nuevaPieza = { tipo: tipoSeleccionado, mesh }
    const nuevasColumnas = { ...columnasRef.current, [clave]: [...columna, nuevaPieza] }
    columnasRef.current = nuevasColumnas
    historialRef.current.push(clave)

    // Pequeña animación de "pop" al aparecer, sin librerías extra
    const inicio = performance.now()
    const animarAparicion = (ahora) => {
      const t = Math.min((ahora - inicio) / 260, 1)
      const s = t < 1 ? 1 - Math.pow(1 - t, 3) : 1 // ease-out cúbico
      mesh.scale.set(s, s, s)
      if (t < 1) requestAnimationFrame(animarAparicion)
    }
    requestAnimationFrame(animarAparicion)

    setTotalPiezas((prev) => prev + 1)
    setPuedeDeshacer(true)

    // Comprobar objetivo inmediatamente tras colocar pieza
    if (nivel && !nivelSuperado) {
      const cols = Object.values(nuevasColumnas).filter((c) => c.length > 0)
      const obj = nivel.objetivo
      let logrado = false

      if (obj.tipo === 'altura') {
        logrado = cols.some((c) => c.length >= obj.valor)
      } else if (obj.tipo === 'combo') {
        logrado = cols.some((c) => c.some((p, i) => p.tipo === obj.base && c[i + 1]?.tipo === obj.encima))
      } else if (obj.tipo === 'cantidad') {
        const total = cols.reduce((acc, c) => acc + c.length, 0)
        logrado = total >= obj.piezas && cols.length >= obj.columnas
      }

      if (logrado) {
        setNivelSuperado(true)
        guardarMejorNivel(nivelId, 3)
        guardarProgreso()
      }
    }
  }, [tipoSeleccionado, colorSeleccionado, totalPiezas, nivel, nivelSuperado, nivelId, guardarMejorNivel, guardarProgreso])

  const deshacerUltima = () => {
    const ultimaClave = historialRef.current.pop()
    if (!ultimaClave) return

    const columna = columnasRef.current[ultimaClave]
    if (!columna || columna.length === 0) return

    const pieza = columna.pop()
    grupoConstruccionRef.current.remove(pieza.mesh)
    pieza.mesh.geometry.dispose()
    pieza.mesh.material.dispose()

    setTotalPiezas((prev) => Math.max(0, prev - 1))
    setPuedeDeshacer(historialRef.current.length > 0)
  }

  const vaciarMesa = () => {
    Object.values(columnasRef.current).forEach((columna) => {
      columna.forEach((pieza) => {
        grupoConstruccionRef.current.remove(pieza.mesh)
        pieza.mesh.geometry.dispose()
        pieza.mesh.material.dispose()
      })
    })
    columnasRef.current = {}
    historialRef.current = []
    setTotalPiezas(0)
    setPuedeDeshacer(false)
    setNivelSuperado(false)
  }

  // --------------------------------------------------------------
  // Distinguir un TOQUE (colocar pieza) de un ARRASTRE (girar cámara)
  // --------------------------------------------------------------
  const alPuntoBajar = (e) => {
    pointerDownRef.current = { x: e.clientX, y: e.clientY, tiempo: Date.now() }
  }

  const alPuntoSoltar = (e) => {
    if (nivelSuperado) return
    const dx = e.clientX - pointerDownRef.current.x
    const dy = e.clientY - pointerDownRef.current.y
    const distancia = Math.sqrt(dx * dx + dy * dy)
    const duracion = Date.now() - pointerDownRef.current.tiempo
    if (distancia > 8 || duracion > 500) return // fue un arrastre de cámara, no un toque

    const rect = rendererRef.current.domElement.getBoundingClientRect()
    const puntero = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    )

    raycasterRef.current.setFromCamera(puntero, camaraRef.current)
    const punto = new THREE.Vector3()
    const huboInterseccion = raycasterRef.current.ray.intersectPlane(planoSueloRef.current, punto)
    if (!huboInterseccion) return

    const gx = Math.round(punto.x / ESPACIADO)
    const gz = Math.round(punto.z / ESPACIADO)
    if (Math.abs(gx) > GRID_LIMITE || Math.abs(gz) > GRID_LIMITE) return

    colocarPieza(gx, gz)
  }

  if (!nivel) {
    return (
      <NivelSelector
        onVolver={onVolver}
        emojiJuego="🧱"
        titulo="Constructor Mágico 3D"
        subtitulo="Elige tu reto"
        niveles={NIVELES}
        mejores={mejores}
        onSeleccionar={empezarNivel}
      />
    )
  }

  return (
    <div style={{
      minHeight: '100dvh', width: '100vw',
      background: 'linear-gradient(180deg, #BFEFFF 0%, #E8F7FF 55%, #FFF3E4 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', touchAction: 'none'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        .anim-pop-3d { animation: popIn3d 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn3d { 0% { transform: scale(0.8) translate(-50%, -50%); opacity: 0; } 100% { transform: scale(1) translate(-50%, -50%); opacity: 1; } }

        .anim-victoria3d { animation: victoria3d 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria3d { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        .anim-estrella3d { animation: rotaEstrella3d 3s linear infinite; }
        @keyframes rotaEstrella3d { 100% { transform: rotate(360deg); } }

        .btn-pieza-3d {
          width: 56px; height: 56px; border-radius: 18px; font-size: 26px;
          display: flex; align-items: center; justify-content: center; cursor: pointer;
          border: 3px solid rgba(255,255,255,0.9); background: white;
          box-shadow: 0 6px 0 #E0E0E0, 0 8px 14px rgba(0,0,0,0.12);
          transition: transform 0.12s;
        }
        .btn-pieza-3d.activo { border-color: #334155; box-shadow: 0 6px 0 #94A3B8, 0 0 0 3px rgba(51,65,85,0.15); transform: translateY(-2px); }
        .btn-pieza-3d:active { transform: translateY(5px); }

        .swatch-color-3d {
          width: 38px; height: 38px; border-radius: 50%; cursor: pointer;
          border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.15);
          transition: transform 0.12s;
        }
        .swatch-color-3d.activo { transform: scale(1.2); box-shadow: 0 0 0 3px #334155, 0 4px 10px rgba(0,0,0,0.2); }
      `}</style>

      {/* CABECERA */}
      <div style={{ position: 'absolute', top: '18px', left: '18px', right: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 30 }}>
        <button onClick={nivelId ? () => setNivelId(null) : onVolver} style={{
          width: '52px', height: '52px', borderRadius: '18px', backgroundColor: '#FFFFFF', color: '#FF5E62',
          border: 'none', fontSize: '22px', cursor: 'pointer', boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>❮</button>

        <div style={{
          backgroundColor: 'rgba(255,255,255,0.92)', padding: '8px 18px', borderRadius: '20px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '62%'
        }}>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#94A3B8' }}>{nivel.emoji} RETO</div>
          <div style={{ fontSize: '0.95rem', fontWeight: '900', color: '#334155' }}>{nivel.metaTexto}</div>
        </div>

        <button onClick={vaciarMesa} style={{
          width: '52px', height: '52px', borderRadius: '18px', backgroundColor: '#FFFFFF', color: '#333',
          border: 'none', fontSize: '20px', cursor: 'pointer', boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>🧹</button>
      </div>

      {/* LIENZO 3D */}
      <div
        ref={mountRef}
        onPointerDown={alPuntoBajar}
        onPointerUp={alPuntoSoltar}
        style={{ width: '100%', flex: 1, marginTop: '90px', cursor: 'grab' }}
      />

      {!listoParaJugar && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: '2rem' }}>
          🧱 Preparando la mesa...
        </div>
      )}

      {avisoMesaLlena && (
        <div className="anim-pop-3d" style={{
          position: 'absolute', top: '50%', left: '50%', backgroundColor: 'white', padding: '14px 26px',
          borderRadius: '20px', border: '3px solid #FFD166', boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
          fontWeight: '900', color: '#7A5C00', zIndex: 60
        }}>
          ¡La mesa está llena! Vacía un poco con 🧹
        </div>
      )}

      {/* BARRA INFERIOR: elegir forma y color */}
      <div style={{
        position: 'relative', zIndex: 30, width: '100%', maxWidth: '620px',
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
        borderRadius: '30px 30px 0 0', padding: '16px 18px 20px 18px', margin: '0 auto',
        boxShadow: '0 -10px 30px rgba(0,0,0,0.12)', boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '14px', flexWrap: 'wrap' }}>
          {TIPOS_PIEZA.map((t) => (
            <button
              key={t.id}
              className={`btn-pieza-3d ${tipoSeleccionado === t.id ? 'activo' : ''}`}
              onClick={() => setTipoSeleccionado(t.id)}
              title={t.nombre}
            >
              {t.emoji}
            </button>
          ))}

          <button onClick={deshacerUltima} disabled={!puedeDeshacer} className="btn-pieza-3d" style={{ opacity: puedeDeshacer ? 1 : 0.35 }} title="Deshacer">
            ↩️
          </button>
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {COLORES_PIEZA.map((c) => (
            <div
              key={c}
              className={`swatch-color-3d ${colorSeleccionado === c ? 'activo' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColorSeleccionado(c)}
            />
          ))}
        </div>
      </div>

      {/* VICTORIA */}
      {nivelSuperado && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(15px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px', boxSizing: 'border-box'
        }}>
          <div className="anim-victoria3d" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="anim-estrella3d" style={{ fontSize: 'clamp(70px, 20vw, 110px)', filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.3))' }}>🏗️🌟</div>
            <h1 style={{
              color: '#FFD166', fontSize: 'clamp(2.5rem, 9vw, 4rem)', margin: '15px 0 8px 0',
              textShadow: '0 8px 0 #CCAC00, 0 15px 25px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900'
            }}>¡Genial construcción!</h1>
            <p style={{
              color: '#4facfe', fontSize: 'clamp(1.1rem, 4.5vw, 1.6rem)', fontWeight: '900', margin: '0 0 30px 0',
              backgroundColor: 'white', padding: '14px 28px', borderRadius: '35px',
              border: '4px solid #E0F2FE', boxShadow: '0 8px 0 #bae6fd'
            }}>
              ¡Nivel {nivel.nombre} superado! 🧱
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => { setNivelSuperado(false) }} style={{
                padding: '14px 28px', fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', fontWeight: '900',
                background: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', color: 'white',
                border: '4px solid white', borderRadius: '35px', cursor: 'pointer',
                boxShadow: '0 8px 0 #8970ba, 0 16px 25px rgba(0,0,0,0.2)', fontFamily: '"Fredoka", sans-serif'
              }}>
                🏗️ Seguir construyendo
              </button>
              <button onClick={() => setNivelId(null)} style={{
                padding: '14px 28px', fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', fontWeight: '900',
                background: 'linear-gradient(135deg, #FFD166 0%, #FFB347 100%)', color: '#7A5C00',
                border: '4px solid white', borderRadius: '35px', cursor: 'pointer',
                boxShadow: '0 8px 0 #CCAC00, 0 16px 25px rgba(0,0,0,0.2)', fontFamily: '"Fredoka", sans-serif'
              }}>
                🔁 Otro nivel
              </button>
              <button onClick={onVolver} style={{
                padding: '14px 28px', fontSize: 'clamp(1.1rem, 4.5vw, 1.4rem)', fontWeight: '900',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white',
                border: '4px solid white', borderRadius: '35px', cursor: 'pointer',
                boxShadow: '0 8px 0 #27ae60, 0 16px 25px rgba(0,0,0,0.2)', fontFamily: '"Fredoka", sans-serif'
              }}>
                {guardando ? 'Guardando... ⏳' : '¡Continuar! 🚀'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
