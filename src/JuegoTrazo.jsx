import React, { useState, useRef, useEffect } from 'react'
import fondoImg from './fondo-lulipop.png'

export default function JuegoTrazo({ perfil, onVolver }) {
  const [textoActual, setTextoActual] = useState('A')
  const [colorTrazo, setColorTrazo] = useState('#FF5E62')
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [inputPersonalizado, setInputPersonalizado] = useState('')
  const [nivelSuperado, setNivelSuperado] = useState(false)
  
  const canvasRef = useRef(null)
  const hitCanvasRef = useRef(null)
  const scoreRef = useRef(0)
  const brushSizeRef = useRef(30)
  const lastPosRef = useRef({ x: 0, y: 0 }) 
  const scoreTimeoutRef = useRef(null) 
  const totalGreenRef = useRef(0) // NUEVO: Guarda el tamaño real de la letra
  
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

    // --- MAPA RGB ANTI-TRAMPAS (LIENZO INVISIBLE) ---
    hitCtx.font = fontStyle
    hitCtx.textAlign = 'center'
    hitCtx.textBaseline = 'middle'
    hitCtx.lineJoin = 'round'
    hitCtx.globalCompositeOperation = 'source-over'
    
    // Dibujamos la base verde
    hitCtx.fillStyle = '#00FF00'
    hitCtx.fillText(textoActual, centerX, centerY)
    hitCtx.lineWidth = brushSizeRef.current * 0.85 
    hitCtx.strokeStyle = '#00FF00'
    hitCtx.strokeText(textoActual, centerX, centerY)

    // Calculamos y guardamos la cantidad exacta de píxeles a pintar
    const imgData = hitCtx.getImageData(0, 0, hitCanvas.width, hitCanvas.height).data
    let totalG = 0
    // Revisamos 1 de cada 16 píxeles para ser ultrarrápidos
    for (let i = 0; i < imgData.length; i += 16) {
      if (imgData[i + 1] > 150) totalG++
    }
    totalGreenRef.current = totalG

    // --- LIENZO VISIBLE ESTILO KEIKI ---
    ctx.font = fontStyle
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.globalCompositeOperation = 'source-over'
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.fillText(textoActual, centerX, centerY)
    
    ctx.lineWidth = Math.max(fontSize * 0.02, 6)
    ctx.strokeStyle = '#FFFFFF'
    ctx.lineJoin = 'round'
    ctx.shadowColor = 'rgba(255, 255, 255, 0.9)'
    ctx.shadowBlur = 15
    ctx.strokeText(textoActual, centerX, centerY)
    ctx.shadowBlur = 0 
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
    if (nivelSuperado) return 
    e.preventDefault()
    const { x, y } = getCoordinates(e, canvasRef.current)
    setIsDrawing(true)
    lastPosRef.current = { x, y }
  }

  const draw = (e) => {
    if (!isDrawing || nivelSuperado) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const hitCtx = hitCanvasRef.current.getContext('2d')
    const { x, y } = getCoordinates(e, canvas)
    
    const dx = x - lastPosRef.current.x
    const dy = y - lastPosRef.current.y
    const distancia = Math.sqrt(dx * dx + dy * dy)

    if (distancia >= 3) { 
      const px = Math.min(Math.max(Math.floor(x), 0), canvas.width - 1)
      const py = Math.min(Math.max(Math.floor(y), 0), canvas.height - 1)
      
      const pixel = hitCtx.getImageData(px, py, 1, 1).data
      const g = pixel[1] 
      const b = pixel[2] 
      const a = pixel[3] 

      const isUnpainted = (g > 150 && b < 100) 
      const isOutside = (a < 100)              

      // 1. PINTAR EN LIENZO VISIBLE
      ctx.globalCompositeOperation = 'source-atop'
      ctx.beginPath()
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
      ctx.lineTo(x, y)
      ctx.strokeStyle = colorTrazo
      ctx.lineWidth = brushSizeRef.current
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.shadowColor = colorTrazo 
      ctx.shadowBlur = 8
      ctx.stroke()
      ctx.shadowBlur = 0 

      // 2. PINTAR EL REGISTRO INVISIBLE (¡La clave para que cuente bien!)
      hitCtx.globalCompositeOperation = 'source-atop'
      hitCtx.beginPath()
      hitCtx.moveTo(lastPosRef.current.x, lastPosRef.current.y)
      hitCtx.lineTo(x, y)
      hitCtx.strokeStyle = '#0000FF' // Marcamos como azul (Pintado)
      hitCtx.lineWidth = brushSizeRef.current
      hitCtx.lineCap = 'round'
      hitCtx.lineJoin = 'round'
      hitCtx.stroke()

      // 3. PUNTOS Y CHISPAS
      if (isUnpainted) {
        updateScore(3) 
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
        updateScore(-2) 
        if (Math.random() > 0.3) {
          ctx.globalCompositeOperation = 'source-over'
          ctx.beginPath()
          ctx.arc(x + (Math.random() - 0.5) * (brushSizeRef.current * 1.2), y + (Math.random() - 0.5) * (brushSizeRef.current * 1.2), Math.random() * 5 + 2, 0, Math.PI * 2)
          ctx.fillStyle = '#FF4B4B'
          ctx.fill()
        }
      }
      
      lastPosRef.current = { x, y }
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    if (nivelSuperado) return
    verificarProgreso() // Comprobar victoria al soltar el dedo
  }

  const verificarProgreso = () => {
    if (totalGreenRef.current === 0) return

    const hitCtx = hitCanvasRef.current.getContext('2d')
    const width = hitCanvasRef.current.width
    const height = hitCanvasRef.current.height
    const imgData = hitCtx.getImageData(0, 0, width, height).data
    
    let currentGreen = 0

    // Contamos cuánto verde queda libre
    for (let i = 0; i < imgData.length; i += 16) {
      const g = imgData[i + 1]
      const b = imgData[i + 2]
      if (g > 150 && b < 100) {
        currentGreen++
      }
    }

    // Matemática precisa: 100% - lo que falta
    const completado = 1 - (currentGreen / totalGreenRef.current)
    
    if (completado >= 0.50) { // ¡Al pasar del 50% gana!
      lanzarVictoria()
    }
  }

  const lanzarVictoria = () => {
    setNivelSuperado(true)
    updateScore(50) 

    setTimeout(() => {
      const currentIndex = palabrasPreset.indexOf(textoActual)
      let nextIndex = 0 
      
      if (currentIndex !== -1 && currentIndex < palabrasPreset.length - 1) {
        nextIndex = currentIndex + 1
      }
      
      setTextoActual(palabrasPreset[nextIndex])
      setNivelSuperado(false)
    }, 2200) 
  }

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
        
        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .anim-estrella { animation: rotaEstrella 3s linear infinite; }
        @keyframes rotaEstrella { 100% { transform: rotate(360deg); } }
      `}</style>

      {/* PANTALLA DE VICTORIA */}
      {nivelSuperado && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '100px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}>🌟</div>
            <h1 style={{
              color: '#FFD166', fontSize: '4.5rem', margin: '10px 0',
              textShadow: '0 6px 0 #CCAC00, 0 10px 20px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '2px'
            }}>¡Súper!</h1>
            <p style={{ color: '#4facfe', fontSize: '1.8rem', fontWeight: '900', margin: 0, backgroundColor: 'white', padding: '10px 30px', borderRadius: '30px', boxShadow: '0 5px 0 #cbd5e1' }}>
              +50 puntos
            </p>
          </div>
        </div>
      )}

      {/* MARCADOR SUPERIOR */}
      <div style={{
        position: 'absolute', top: '25px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px 30px',
        borderRadius: '30px', border: '4px solid white',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center',
        gap: '12px', zIndex: 20, fontSize: '32px', fontWeight: '900', pointerEvents: 'none'
      }}>
        ⭐ <span id="marcador-puntos" style={{ color: '#FFD166', transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', textShadow: '0 4px 0 #CCAC00', minWidth: '80px', textAlign: 'center', display: 'inline-block' }}>0</span>
      </div>

      <canvas
        ref={canvasRef}
        width={dimensiones.w} height={dimensiones.h}
        onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
        onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', cursor: 'crosshair', touchAction: 'none', zIndex: 1 }}
      />

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
