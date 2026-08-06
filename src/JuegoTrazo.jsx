import React, { useState, useRef, useEffect } from 'react'
import fondoImg from './fondo-lulipop.png'

export default function JuegoTrazo({ perfil, onVolver }) {
  const [textoActual, setTextoActual] = useState('A')
  const [colorTrazo, setColorTrazo] = useState('#FF5E62')
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [inputPersonalizado, setInputPersonalizado] = useState('')
  
  const canvasRef = useRef(null)
  const hitCanvasRef = useRef(null)
  const scoreRef = useRef(0)
  const brushSizeRef = useRef(30)
  const lastPosRef = useRef({ x: 0, y: 0 }) 
  const scoreTimeoutRef = useRef(null) 
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [dimensiones, setDimensiones] = useState({ w: window.innerWidth, h: window.innerHeight })

  const palabrasPreset = ['A', 'B', 'C', 'MAMA', 'PAPA', 'SOL', 'LULU', '123']
  const colores = [
    { id: '#FF5E62', shadow: '#C0392B' }, // Rojo Sandía
    { id: '#4facfe', shadow: '#005580' }, // Azul Hielo
    { id: '#43e97b', shadow: '#27ae60' }, // Verde Lima
    { id: '#FFD166', shadow: '#CCAC00' }, // Amarillo Sol
    { id: '#a18cd1', shadow: '#6b4c9a' }  // Morado Mágico
  ]

  useEffect(() => {
    const handleResize = () => setDimensiones({ w: window.innerWidth, h: window.innerHeight })
    window.addEventListener('resize', handleResize)
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
    const hitCtx = hitCanvas.getContext('2d', { willReadFrequently: true })
    
    hitCanvas.width = canvas.width
    hitCanvas.height = canvas.height
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hitCtx.clearRect(0, 0, hitCanvas.width, hitCanvas.height)
    
    const isWord = textoActual.length > 1
    const maxFontSize = isWord ? (canvas.width * 0.85) / textoActual.length : canvas.height * 0.5
    const fontSize = Math.min(maxFontSize, 450) 
    
    brushSizeRef.current = Math.max(fontSize * 0.12, 18)

    const fontStyle = "900 " + fontSize + "px 'Fredoka', sans-serif"
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2 - 20 

    // --- LIENZO INVISIBLE (MAPA RGB ANTI-TRAMPAS) ---
    hitCtx.font = fontStyle
    hitCtx.textAlign = 'center'
    hitCtx.textBaseline = 'middle'
    hitCtx.lineJoin = 'round'
    
    // Zona Verde = Área válida sin pintar
    hitCtx.fillStyle = '#00FF00'
    hitCtx.fillText(textoActual, centerX, centerY)
    hitCtx.lineWidth = brushSizeRef.current * 0.85 
    hitCtx.strokeStyle = '#00FF00'
    hitCtx.strokeText(textoActual, centerX, centerY)

    // --- LIENZO VISIBLE (ESTÉTICA PREMIUM TIPO KEIKI) ---
    ctx.font = fontStyle
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.globalCompositeOperation = 'source-over'
    
    // 1. Relleno cristalino suave
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.fillText(textoActual, centerX, centerY)
    
    // 2. Borde exterior con brillo (Glow)
    ctx.lineWidth = Math.max(fontSize * 0.02, 6)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineJoin = 'round'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'
    ctx.shadowBlur = 15
    ctx.strokeText(textoActual, centerX, centerY)
    ctx.shadowBlur = 0 // Resetear sombra para lo siguiente
  }

  const updateScore = (points) => {
    scoreRef.current = Math.max(0, scoreRef.current + points)
    const scoreEl = document.getElementById('marcador-puntos')
    if (scoreEl) {
      scoreEl.innerText = scoreRef.current
      if (points < 0) {
        scoreEl.style.color = '#FF4B4B'
        scoreEl.style.textShadow = '0 4px 0 #C0392B'
        scoreEl.style.transform = 'scale(0.8)'
      } else if (points > 0) {
        scoreEl.style.color = '#43e97b'
        scoreEl.style.textShadow = '0 4px 0 #27ae60'
        scoreEl.style.transform = 'scale(1.2)'
      }

      clearTimeout(scoreTimeoutRef.current)
      scoreTimeoutRef.current = setTimeout(() => {
        scoreEl.style.color = '#FFD166'
        scoreEl.style.textShadow = '0 4px 0 #CCAC00'
        scoreEl.style.transform = 'scale(1)'
      }, 300)
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
    const { x, y } = getCoordinates(e, canvasRef.current)
    setIsDrawing(true)
    lastPosRef.current = { x, y }
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const hitCtx = hitCanvasRef.current.getContext('2d')
    const { x, y } = getCoordinates(e, canvas)
    
    const dx = x - lastPosRef.current.x
    const dy = y - lastPosRef.current.y
    const distancia = Math.sqrt(dx * dx + dy * dy)

    if (distancia >= 3) { // Solo evaluamos si hay movimiento real
      const px = Math.min(Math.max(Math.floor(x), 0), canvas.width - 1)
      const py = Math.min(Math.max(Math.floor(y), 0), canvas.height - 1)
      
      const pixel = hitCtx.getImageData(px, py, 1, 1).data
      const g = pixel[1] // Canal Verde
      const b = pixel[2] // Canal Azul
      const a = pixel[3] // Transparencia

      const isUnpainted = (g > 150 && b < 100) // Zona verde pura (No pintada)
      const isPainted = (b > 150)              // Zona azul (Ya pintada por el niño)
      const isOutside = (a < 100)              // Zona vacía (Fuera de la letra)

      // 1. DIBUJAMOS EL TRAZO VISUAL SIEMPRE (Para que no se corte la línea)
      ctx.globalCompositeOperation = 'source-atop'
      ctx.beginPath()
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
      ctx.lineTo(x, y)
      ctx.strokeStyle = colorTrazo
      ctx.lineWidth = brushSizeRef.current
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = colorTrazo // Efecto Glow en la pintura
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.shadowBlur = 0 // Reset

      if (isUnpainted) {
        updateScore(3) // +3 puntos por descubrir zona nueva
        
        // MARCAR ZONA COMO PINTADA (Azul) EN EL LIENZO INVISIBLE
        hitCtx.globalCompositeOperation = 'source-over'
        hitCtx.beginPath()
        hitCtx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
        hitCtx.lineTo(x, y)
        hitCtx.strokeStyle = '#0000FF' // Pure Blue
        hitCtx.lineWidth = brushSizeRef.current
        hitCtx.lineCap = 'round'
        hitCtx.lineJoin = 'round'
        hitCtx.stroke()

        // CHISPAS MÁGICAS (Estrellas) AL ACERTAR
        if (Math.random() > 0.4) {
          ctx.globalCompositeOperation = 'source-over'
          ctx.beginPath()
          ctx.arc(x + (Math.random() - 0.5) * brushSizeRef.current, y + (Math.random() - 0.5) * brushSizeRef.current, Math.random() * 4 + 2, 0, Math.PI * 2)
          ctx.fillStyle = '#FFFFFF'
          ctx.shadowBlur = 12
          ctx.shadowColor = '#FFFFFF'
          ctx.fill()
          ctx.shadowBlur = 0
        }
      } else if (isOutside) {
        updateScore(-2) // -2 puntos por salirse
        
        // CHISPAS DE ERROR (Rojas)
        if (Math.random() > 0.3) {
          ctx.globalCompositeOperation = 'source-over'
          ctx.beginPath()
          ctx.arc(x + (Math.random() - 0.5) * (brushSizeRef.current * 1.2), y + (Math.random() - 0.5) * (brushSizeRef.current * 1.2), Math.random() * 5 + 2, 0, Math.PI * 2)
          ctx.fillStyle = '#FF4B4B'
          ctx.fill()
        }
      }
      // Si "isPainted" es true, simplemente no hace nada (ni suma ni resta), permitiendo repasar.

      lastPosRef.current = { x, y }
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
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;900&display=swap');
        .anim-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        @keyframes popIn { 0% { transform: scale(0.8); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* MARCADOR DE PUNTOS SUPERIOR CENTRAL */}
      <div style={{
        position: 'absolute', top: '25px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px 30px',
        borderRadius: '30px', border: '4px solid white',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center',
        gap: '12px', zIndex: 20, fontSize: '32px', fontWeight: '900', pointerEvents: 'none'
      }}>
        ⭐ <span id="marcador-puntos" style={{ color: '#FFD166', transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', textShadow: '0 4px 0 #CCAC00', minWidth: '80px', textAlign: 'center', display: 'inline-block' }}>0</span>
      </div>

      {/* LIENZO DE DIBUJO */}
      <canvas
        ref={canvasRef}
        width={dimensiones.w} height={dimensiones.h}
        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none', zIndex: 1 }}
      />

      {/* CABECERA (Controles Laterales) */}
      <div style={{ 
        position: 'absolute', top: '25px', left: '20px', right: '20px', 
        display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none' 
      }}>
        <button onClick={onVolver} style={{
          width: '55px', height: '55px', borderRadius: '18px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
          fontSize: '24px', cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>❮</button>

        <button onClick={inicializarCanvas} style={{
          height: '55px', padding: '0 20px', borderRadius: '18px',
          backgroundColor: '#FFFFFF', color: '#333', border: 'none', 
          fontSize: '22px', fontWeight: '900', cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center'
        }}>🧹</button>
      </div>

      {/* DOCK INFERIOR (Colores y Menú) */}
      <div style={{
        position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '15px 20px',
        borderRadius: '35px', backdropFilter: 'blur(20px)', border: '4px solid white',
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)', display: 'flex', flexWrap: 'wrap',
        justifyContent: 'center', alignItems: 'center', gap: '15px', zIndex: 10,
        width: '90%', maxWidth: '480px' 
      }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {colores.map(c => (
            <div key={c.id} onClick={() => setColorTrazo(c.id)} style={{
              width: '42px', height: '42px', borderRadius: '50%', backgroundColor: c.id, 
              cursor: 'pointer', border: colorTrazo === c.id ? '4px solid white' : '3px solid rgba(255,255,255,0.8)',
              boxShadow: colorTrazo === c.id ? `0 0 18px ${c.id}` : `0 4px 0 ${c.shadow}`,
              transform: colorTrazo === c.id ? 'translateY(-4px) scale(1.15)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} />
          ))}
        </div>
        <button onClick={() => setMostrarMenu(true)} style={{
          backgroundColor: '#FFD166', color: '#7A5C00', border: 'none',
          padding: '12px 22px', borderRadius: '25px', fontSize: '20px',
          fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 5px 0 #CCAC00'
        }}>✨ A-B-C</button>
      </div>

      {/* MENÚ MODAL (Selección de letras) */}
      {mostrarMenu && (
        <div className="anim-pop" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', boxSizing: 'border-box'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', padding: '35px 25px', borderRadius: '40px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)', border: '6px solid #F8FAFC',
            width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative', boxSizing: 'border-box'
          }}>
            <button onClick={() => setMostrarMenu(false)} style={{
              position: 'absolute', top: '-15px', right: '-15px', width: '50px', height: '50px',
              borderRadius: '50%', backgroundColor: '#FF6B6B', color: 'white', border: 'none',
              fontSize: '22px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 6px 0 #C0392B'
            }}>X</button>
            <h2 style={{ textAlign: 'center', color: '#333', fontSize: '1.8rem', margin: 0 }}>¿Qué trazamos ahora?</h2>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {palabrasPreset.map(p => (
                <button key={p} onClick={() => { setTextoActual(p); setMostrarMenu(false); }} style={{ 
                  backgroundColor: '#F1F5F9', border: 'none', padding: '14px 22px', borderRadius: '20px',
                  fontSize: '1.3rem', fontWeight: '900', color: '#475569', cursor: 'pointer',
                  boxShadow: '0 5px 0 #CBD5E1', transition: 'transform 0.1s'
                }}>{p}</button>
              ))}
            </div>
            
            <form onSubmit={guardarPersonalizada} style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '15px' }}>
              <input type="text" placeholder="Tu palabra..." value={inputPersonalizado} onChange={(e) => setInputPersonalizado(e.target.value)} maxLength={7} style={{
                padding: '14px 18px', borderRadius: '18px', border: '4px solid #E2E8F0',
                fontFamily: 'Fredoka', fontSize: '1.3rem', outline: 'none', width: '150px',
                textAlign: 'center', color: '#333', textTransform: 'uppercase'
              }} />
              <button type="submit" style={{
                backgroundColor: '#43e97b', color: 'white', border: 'none', padding: '0 25px',
                borderRadius: '18px', fontSize: '1.3rem', fontWeight: '900', cursor: 'pointer', boxShadow: '0 6px 0 #27ae60'
              }}>¡Vale!</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
