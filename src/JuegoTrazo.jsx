import React, { useState, useRef, useEffect } from 'react'
import fondoImg from './fondo-lulipop.png'

export default function JuegoTrazo({ perfil, onVolver }) {
  const [textoActual, setTextoActual] = useState('A')
  const [colorTrazo, setColorTrazo] = useState('#FF5E62')
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [inputPersonalizado, setInputPersonalizado] = useState('')
  
  const canvasRef = useRef(null)
  const hitCanvasRef = useRef(null) // Lienzo invisible para detectar si te sales
  const scoreRef = useRef(0) // Usamos ref para el score para no ralentizar el dibujo con renders de React
  const brushSizeRef = useRef(30)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [dimensiones, setDimensiones] = useState({ w: window.innerWidth, h: window.innerHeight })

  const palabrasPreset = ['A', 'B', 'C', 'MAMA', 'PAPA', 'SOL', 'LULU', '123']
  const colores = [
    { id: '#FF5E62', shadow: '#C0392B' },
    { id: '#4facfe', shadow: '#005580' },
    { id: '#43e97b', shadow: '#27ae60' },
    { id: '#FFD166', shadow: '#CCAC00' },
    { id: '#a18cd1', shadow: '#6b4c9a' }
  ]

  useEffect(() => {
    const handleResize = () => setDimensiones({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', handleResize)
    // Inicializar lienzo oculto
    if (!hitCanvasRef.current) {
      hitCanvasRef.current = document.createElement('canvas')
    }
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    document.fonts.ready.then(() => {
      inicializarCanvas()
    })
  }, [textoActual, dimensiones])

  const inicializarCanvas = () => {
    const canvas = canvasRef.current
    const hitCanvas = hitCanvasRef.current
    if (!canvas || !hitCanvas) return
    
    const ctx = canvas.getContext('2d')
    const hitCtx = hitCanvas.getContext('2d', { willReadFrequently: true }) // Optimizado para leer píxeles
    
    // Sincronizar tamaños
    hitCanvas.width = canvas.width
    hitCanvas.height = canvas.height
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hitCtx.clearRect(0, 0, hitCanvas.width, hitCanvas.height)
    
    const isWord = textoActual.length > 1
    const maxFontSize = isWord ? (canvas.width * 0.85) / textoActual.length : canvas.height * 0.5
    const fontSize = Math.min(maxFontSize, 450) 
    
    // Pincel dinámico al 12% del tamaño
    brushSizeRef.current = Math.max(fontSize * 0.12, 15)

    const fontStyle = "900 " + fontSize + "px 'Fredoka', sans-serif"
    ctx.font = fontStyle
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    hitCtx.font = fontStyle
    hitCtx.textAlign = 'center'
    hitCtx.textBaseline = 'middle'
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2 - 20 

    // --- DIBUJAR LIENZO INVISIBLE (MAPA DE CHOQUE) ---
    // Dibujamos la letra en negro puro para saber dónde puede pisar el niño.
    // Le damos un "borde de tolerancia" para que no sea excesivamente difícil.
    hitCtx.fillStyle = '#000000'
    hitCtx.fillText(textoActual, centerX, centerY)
    hitCtx.lineWidth = brushSizeRef.current * 1.5 // Margen de error o tolerancia
    hitCtx.lineJoin = 'round'
    hitCtx.strokeStyle = '#000000'
    hitCtx.strokeText(textoActual, centerX, centerY)

    // --- DIBUJAR LIENZO VISIBLE ---
    ctx.globalCompositeOperation = 'source-over'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
    ctx.fillText(textoActual, centerX, centerY)
    
    ctx.lineWidth = Math.max(fontSize * 0.015, 4)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineJoin = 'round'
    ctx.strokeText(textoActual, centerX, centerY)
  }

  // Actualizar el DOM directamente para no congelar el juego con React renders
  const updateScore = (points) => {
    scoreRef.current = Math.max(0, scoreRef.current + points) // El mínimo es 0
    const scoreEl = document.getElementById('marcador-puntos')
    if (scoreEl) {
      scoreEl.innerText = scoreRef.current
      scoreEl.className = points > 0 ? 'score-up' : 'score-down'
      // Reset de animación
      void scoreEl.offsetWidth
    }
  }

  const getCoordinates = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e, canvas)
    
    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(x, y)
    
    ctx.globalCompositeOperation = 'source-atop'
    ctx.strokeStyle = colorTrazo
    ctx.lineWidth = brushSizeRef.current
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const hitCtx = hitCanvasRef.current.getContext('2d')
    const { x, y } = getCoordinates(e, canvas)
    
    // COMPROBAR SI ESTÁ DENTRO O FUERA LEYENDO EL PÍXEL INVISIBLE
    const pixelAlpha = hitCtx.getImageData(x, y, 1, 1).data[3]
    const isInside = pixelAlpha > 0 // Si el pixel no es transparente, está dentro

    if (isInside) {
      // ESTÁ DENTRO: ¡Sumamos puntos!
      updateScore(10)
      
      ctx.globalCompositeOperation = 'source-atop'
      ctx.lineTo(x, y)
      ctx.stroke()

      // Chispas mágicas de premio
      if (Math.random() > 0.6) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.beginPath()
        const offsetX = x + (Math.random() - 0.5) * brushSizeRef.current
        const offsetY = y + (Math.random() - 0.5) * brushSizeRef.current
        ctx.arc(offsetX, offsetY, Math.random() * 6 + 2, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowBlur = 10
        ctx.shadowColor = colorTrazo
        ctx.fill()
        ctx.shadowBlur = 0 
        
        ctx.globalCompositeOperation = 'source-atop'
        ctx.beginPath()
        ctx.moveTo(x, y)
      }
    } else {
      // SE HA SALIDO: Restamos puntos
      updateScore(-5)
      
      // Mostrar cruces/puntos rojos de error por salirse de la línea
      if (Math.random() > 0.4) {
        ctx.globalCompositeOperation = 'source-over' // Esto permite dibujar fuera de la letra
        ctx.beginPath()
        const offsetX = x + (Math.random() - 0.5) * (brushSizeRef.current * 1.5)
        const offsetY = y + (Math.random() - 0.5) * (brushSizeRef.current * 1.5)
        ctx.arc(offsetX, offsetY, Math.random() * 4 + 2, 0, Math.PI * 2)
        ctx.fillStyle = '#FF4B4B' // Rojo error
        ctx.fill()
        
        ctx.globalCompositeOperation = 'source-atop'
        ctx.beginPath()
        ctx.moveTo(x, y) // Recuperar la posición para no romper la línea principal
      }
    }
  }

  const stopDrawing = () => setIsDrawing(false)

  const guardarPersonalizada = (e) => {
    e.preventDefault()
    if (inputPersonalizado.trim() !== '') {
      setTextoActual(inputPersonalizado.toUpperCase().substring(0, 7))
      setMostrarMenu(false)
      setInputPersonalizado('')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      backgroundImage: "url(" + fondoImg + ")",
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;900&display=swap');
        .anim-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        
        /* Animaciones del marcador de puntos */
        .score-up { animation: popGreen 0.3s ease; color: #27ae60; text-shadow: 0 4px 0 #1e8449; }
        .score-down { animation: shakeRed 0.3s ease; color: #e74c3c; text-shadow: 0 4px 0 #c0392b; }
        
        @keyframes popGreen {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); color: #2ecc71; }
          100% { transform: scale(1); }
        }
        @keyframes shakeRed {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) scale(0.9); }
          75% { transform: translateX(5px) scale(0.9); }
        }
      `}</style>

      {/* MARCADOR DE PUNTOS SUPERIOR CENTRAL */}
      <div style={{
        position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '10px 25px',
        borderRadius: '25px', border: '4px solid white',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center',
        gap: '10px', zIndex: 20, fontSize: '28px', fontWeight: '900', pointerEvents: 'none'
      }}>
        ⭐ <span id="marcador-puntos" style={{ color: '#FFD166', transition: 'color 0.2s', textShadow: '0 4px 0 #CCAC00', minWidth: '70px', textAlign: 'center' }}>0</span>
      </div>

      {/* LIENZO DE DIBUJO */}
      <canvas
        ref={canvasRef}
        width={dimensiones.w} height={dimensiones.h}
        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none', zIndex: 1 }}
      />

      {/* CABECERA (Controles Superiores Responsivos) */}
      <div style={{ 
        position: 'absolute', top: '20px', left: '20px', right: '20px', 
        display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none' 
      }}>
        <button onClick={onVolver} style={{
          width: '50px', height: '50px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
          fontSize: '22px', cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>❮</button>

        <button onClick={inicializarCanvas} style={{
          height: '50px', padding: '0 20px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#333', border: 'none', 
          fontSize: '18px', fontWeight: '900', cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>🧹</button>
      </div>

      {/* DOCK INFERIOR (Responsivo y Adaptable) */}
      <div style={{
        position: 'absolute', bottom: '25px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '12px 15px',
        borderRadius: '25px', backdropFilter: 'blur(20px)', border: '4px solid white',
        boxShadow: '0 15px 30px rgba(0,0,0,0.2)', display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center', alignItems: 'center', gap: '12px', zIndex: 10,
        width: '90%', maxWidth: '450px' 
      }}>
        
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {colores.map(c => (
            <div key={c.id} onClick={() => setColorTrazo(c.id)} style={{
              width: '38px', height: '38px', borderRadius: '50%', backgroundColor: c.id, 
              cursor: 'pointer', border: colorTrazo === c.id ? '4px solid white' : '3px solid rgba(255,255,255,0.8)',
              boxShadow: colorTrazo === c.id ? "0 0 15px " + c.id : "0 4px 0 " + c.shadow,
              transform: colorTrazo === c.id ? 'translateY(-3px) scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} />
          ))}
        </div>

        <button onClick={() => setMostrarMenu(true)} style={{
          backgroundColor: '#FFD166', color: '#7A5C00', border: 'none',
          padding: '10px 18px', borderRadius: '20px', fontSize: '18px',
          fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
          boxShadow: '0 5px 0 #CCAC00'
        }}>✨ A-B-C</button>
      </div>

      {/* MENÚ MODAL */}
      {mostrarMenu && (
        <div className="anim-pop" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(15px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', padding: '30px 20px', borderRadius: '35px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '5px solid #F8FAFC',
            width: '100%', maxWidth: '450px', display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', boxSizing: 'border-box'
          }}>
            <button onClick={() => setMostrarMenu(false)} style={{
              position: 'absolute', top: '-15px', right: '-15px', width: '45px', height: '45px',
              borderRadius: '50%', backgroundColor: '#FF6B6B', color: 'white', border: 'none',
              fontSize: '20px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 5px 0 #C0392B'
            }}>X</button>
            <h2 style={{ textAlign: 'center', color: '#333', fontSize: '1.6rem', margin: 0 }}>¿Qué trazamos ahora?</h2>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {palabrasPreset.map(p => (
                <button key={p} onClick={() => { setTextoActual(p); setMostrarMenu(false); }} style={{ 
                  backgroundColor: '#F1F5F9', border: 'none', padding: '12px 20px', borderRadius: '18px',
                  fontSize: '1.2rem', fontWeight: '900', color: '#475569', cursor: 'pointer',
                  boxShadow: '0 5px 0 #CBD5E1'
                }}>{p}</button>
              ))}
            </div>
            
            <form onSubmit={guardarPersonalizada} style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
              <input type="text" placeholder="Tu palabra..." value={inputPersonalizado} onChange={(e) => setInputPersonalizado(e.target.value)} maxLength={7} style={{
                padding: '12px 15px', borderRadius: '16px', border: '3px solid #E2E8F0',
                fontFamily: 'Fredoka', fontSize: '1.2rem', outline: 'none', width: '140px',
                textAlign: 'center', color: '#333', textTransform: 'uppercase'
              }} />
              <button type="submit" style={{
                backgroundColor: '#43e97b', color: 'white', border: 'none', padding: '0 20px',
                borderRadius: '16px', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 5px 0 #27ae60'
              }}>¡Vale!</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
