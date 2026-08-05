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
  const colores = [
    { id: '#FF5E62', shadow: '#C0392B' },
    { id: '#4facfe', shadow: '#005580' },
    { id: '#43e97b', shadow: '#27ae60' },
    { id: '#FFD166', shadow: '#CCAC00' },
    { id: '#ff758c', shadow: '#C73E5B' }
  ]

  useEffect(() => {
    inicializarCanvas()
  }, [textoActual])

  const inicializarCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Guía visual de fondo suave y elegante
    ctx.font = 'bold 110px Fredoka, sans-serif'
    ctx.fillStyle = '#E2E8F0'
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
    ctx.lineWidth = 32
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
        
        .btn-clay {
          background: white;
          border: none;
          padding: 10px 20px;
          border-radius: 18px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          font-family: 'Fredoka', sans-serif;
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.1);
        }
        .btn-clay:active {
          transform: translateY(4px);
          box-shadow: 0 2px 0 #E0E0E0, 0 5px 8px rgba(0,0,0,0.1);
        }

        @keyframes floatAvatar {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* CABECERA FLOTANTE CON GLASSMORPHISM */}
      <div style={{ display: 'flex', width: '100%', maxWidth: '600px', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button 
          onClick={onVolver}
          style={{
            width: '50px', height: '50px', borderRadius: '18px',
            backgroundColor: '#FFFFFF', color: '#FF5E62', 
            border: 'none', fontSize: '22px', cursor: 'pointer',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700'
          }}
        >
          ❮
        </button>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          padding: '10px 25px',
          borderRadius: '25px',
          backdropFilter: 'blur(10px)',
          border: '3px solid white',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          fontSize: '1.3rem',
          fontWeight: '700',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>✍️ Trazando:</span>
          <span style={{ color: '#FF5E62', fontSize: '1.5rem', background: '#FFF0F1', padding: '2px 14px', borderRadius: '14px', border: '2px solid #FFD1D3' }}>
            {textoActual}
          </span>
        </div>

        <div style={{ width: '50px' }} />
      </div>

      {/* CONTENEDOR CENTRAL DEL LIENZO ESTILO CLAYMORPHISM */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '24px',
        borderRadius: '35px',
        backdropFilter: 'blur(14px)',
        border: '4px solid white',
        boxShadow: '0 20px 45px rgba(0,0,0,0.2)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '18px',
        width: '100%',
        maxWidth: '480px',
        zIndex: 20
      }}>
        {/* Lienzo con bordes redondeados y sombra interior */}
        <canvas
          ref={canvasRef}
          width={440}
          height={260}
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
            borderRadius: '24px',
            border: '4px solid #F1F5F9',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.06)',
            cursor: 'crosshair',
            touchAction: 'none'
          }}
        />

        {/* CONTROLES DEL LIENZO (BORRAR Y COLORES 3D) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <button
            onClick={inicializarCanvas}
            style={{
              backgroundColor: '#FF6B6B', color: 'white', border: 'none',
              padding: '10px 22px', borderRadius: '16px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'Fredoka', fontSize: '1rem',
              boxShadow: '0 6px 0 #C0392B, 0 8px 12px rgba(0,0,0,0.15)',
              transition: 'transform 0.1s'
            }}
          >
            🧹 Limpiar
          </button>

          {/* Selector de Colores 3D */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(241, 245, 249, 0.8)', padding: '8px 12px', borderRadius: '20px', border: '2px solid white' }}>
            {colores.map(c => (
              <div
                key={c.id}
                onClick={() => setColorTrazo(c.id)}
                style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  backgroundColor: c.id, cursor: 'pointer',
                  border: colorTrazo === c.id ? '3px solid white' : '2px solid rgba(255,255,255,0.6)',
                  boxShadow: colorTrazo === c.id ? `0 0 10px ${c.id}` : `0 4px 0 ${c.shadow}`,
                  transform: colorTrazo === c.id ? 'scale(1.2) translateY(-2px)' : 'scale(1)',
                  transition: 'all 0.15s ease'
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* SELECTOR INFERIOR DE PALABRAS Y CREACIÓN PERSONALIZADA */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.85)',
        padding: '16px 22px',
        borderRadius: '30px',
        backdropFilter: 'blur(12px)',
        border: '4px solid white',
        boxShadow: '0 15px 30px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '550px',
        alignItems: 'center',
        zIndex: 20,
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {palabrasPreset.map(p => (
            <button
              key={p}
              className="btn-clay"
              onClick={() => { setTextoActual(p); setModoPersonalizado(false); }}
              style={{ 
                backgroundColor: textoActual === p ? '#FFD166' : 'white',
                color: textoActual === p ? '#7A5C00' : '#333',
                boxShadow: textoActual === p ? '0 6px 0 #CCAC00, 0 8px 12px rgba(0,0,0,0.15)' : '0 6px 0 #E0E0E0, 0 8px 12px rgba(0,0,0,0.1)'
              }}
            >
              {p}
            </button>
          ))}
          <button
            className="btn-clay"
            onClick={() => setModoPersonalizado(!modoPersonalizado)}
            style={{ backgroundColor: '#4facfe', color: 'white', boxShadow: '0 6px 0 #005580, 0 8px 12px rgba(0,0,0,0.15)' }}
          >
            ✏️ Otra palabra
          </button>
        </div>

        {modoPersonalizado && (
          <form onSubmit={guardarPersonalizada} style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'center', animation: 'floatAvatar 0.3s ease-in-out' }}>
            <input
              type="text"
              placeholder="Escribe la palabra..."
              value={inputPersonalizado}
              onChange={(e) => setInputPersonalizado(e.target.value)}
              maxLength={8}
              style={{
                padding: '10px 16px', borderRadius: '16px', border: '3px solid #E2E8F0',
                fontFamily: 'Fredoka', fontSize: '1.1rem', outline: 'none', width: '200px',
                backgroundColor: 'white', color: '#333', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
              }}
            />
            <button
              type="submit"
              className="btn-clay"
              style={{ backgroundColor: '#43e97b', color: 'white', boxShadow: '0 6px 0 #27ae60, 0 8px 12px rgba(0,0,0,0.15)' }}
            >
              ¡Aceptar!
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
