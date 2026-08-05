import React, { useState, useRef, useEffect } from 'react'
import fondoImg from './fondo-lulipop.png'

export default function JuegoTrazo({ perfil, onVolver }) {
  const [textoActual, setTextoActual] = useState('A')
  const [modoPersonalizado, setModoPersonalizado] = useState(false)
  const [inputPersonalizado, setInputPersonalizado] = useState('')
  const [colorTrazo, setColorTrazo] = useState('#FF5E62')
  
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const palabrasPreset = ['A', 'B', 'C', 'MAMA', 'PAPA', 'SOL', 'LULU', '123']
  const colores = ['#FF5E62', '#4facfe', '#43e97b', '#ffd166', '#ff758c']

  useEffect(() => {
    inicializarCanvas()
  }, [textoActual])

  const inicializarCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Dibujar la guía gris suave de fondo
    ctx.font = 'bold 120px Fredoka, sans-serif'
    ctx.fillStyle = '#E5E9F0'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(textoActual, canvas.width / 2, canvas.height / 2)
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
    ctx.strokeStyle = colorTrazo
    ctx.lineWidth = 28
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e, canvas)
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const guardarPersonalizada = (e) => {
    e.preventDefault()
    if (inputPersonalizado.trim() !== '') {
      setTextoActual(inputPersonalizado.toUpperCase())
      setModoPersonalizado(false)
      setInputPersonalizado('')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute',
      top: 0, left: 0, zIndex: 10,
      boxSizing: 'border-box',
      padding: '20px',
      overflowX: 'hidden'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        .btn-opcion {
          background: white;
          border: none;
          padding: 8px 16px;
          border-radius: 14px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          box-shadow: 0 4px 0 #d1d5db, 0 6px 12px rgba(0,0,0,0.1);
          transition: transform 0.1s;
        }
        .btn-opcion:active {
          transform: translateY(3px);
          box-shadow: 0 1px 0 #d1d5db, 0 3px 6px rgba(0,0,0,0.1);
        }
      `}</style>

      {/* CABECERA */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
        <button 
          onClick={onVolver}
          style={{
            width: '50px', height: '50px', borderRadius: '16px',
            backgroundColor: '#FFFFFF', color: '#FF5E62', 
            border: 'none', fontSize: '20px', cursor: 'pointer',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
          }}
        >
          ❮
        </button>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 20px',
          borderRadius: '20px',
          backdropFilter: 'blur(8px)',
          border: '3px solid white',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          fontSize: '1.3rem',
          fontWeight: '700',
          color: '#333'
        }}>
          ✍️ Taller de trazos: <span style={{ color: '#FF5E62' }}>{textoActual}</span>
        </div>

        <div style={{ width: '50px' }} />
      </div>

      {/* CONTENEDOR CENTRAL DEL LIENZO */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '20px',
        borderRadius: '30px',
        backdropFilter: 'blur(12px)',
        border: '4px solid white',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        maxWidth: '95%',
        width: '500px'
      }}>
        {/* Lienzo HTML5 para dibujo preciso */}
        <canvas
          ref={canvasRef}
          width={500}
          height={300}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          style={{
            width: '100%',
            height: 'auto',
            backgroundColor: '#FFFFFF',
            borderRadius: '20px',
            border: '3px dashed #cbd5e1',
            cursor: 'crosshair',
            touchAction: 'none'
          }}
        />

        {/* BOTONERA DE ACCIÓN DEL LIENZO */}
        <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center' }}>
          <button
            onClick={inicializarCanvas}
            style={{
              backgroundColor: '#FF6B6B', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: '14px', fontWeight: '700',
              cursor: 'pointer', boxShadow: '0 4px 0 #C0392B, 0 6px 10px rgba(0,0,0,0.15)'
            }}
          >
            🧹 Borrar
          </button>

          {/* Selector de Colores */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', background: '#f1f5f9', padding: '5px 10px', borderRadius: '14px' }}>
            {colores.map(c => (
              <div
                key={c}
                onClick={() => setColorTrazo(c)}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  backgroundColor: c, cursor: 'pointer',
                  border: colorTrazo === c ? '3px solid #333' : '2px solid white',
                  transform: colorTrazo === c ? 'scale(1.15)' : 'scale(1)'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SELECTOR DE PALABRAS Y CREACIÓN PERSONALIZADA */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '12px 20px',
        borderRadius: '25px',
        backdropFilter: 'blur(10px)',
        border: '3px solid white',
        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        maxWidth: '550px',
        alignItems: 'center',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {palabrasPreset.map(p => (
            <button
              key={p}
              className="btn-opcion"
              onClick={() => { setTextoActual(p); setModoPersonalizado(false); }}
              style={{ backgroundColor: textoActual === p ? '#FFD166' : 'white' }}
            >
              {p}
            </button>
          ))}
          <button
            className="btn-opcion"
            onClick={() => setModoPersonalizado(!modoPersonalizado)}
            style={{ backgroundColor: '#4facfe', color: 'white' }}
          >
            ✏️ Otra palabra
          </button>
        </div>

        {modoPersonalizado && (
          <form onSubmit={guardarPersonalizada} style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="Escribe palabra..."
              value={inputPersonalizado}
              onChange={(e) => setInputPersonalizado(e.target.value)}
              maxLength={8}
              style={{
                padding: '8px 14px', borderRadius: '12px', border: '2px solid #cbd5e1',
                fontFamily: 'Fredoka', fontSize: '1rem', outline: 'none', width: '180px'
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#43e97b', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer'
              }}
            >
              Usar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
