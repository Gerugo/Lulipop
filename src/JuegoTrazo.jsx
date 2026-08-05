import React, { useState, useRef, useEffect } from 'react'
import fondoImg from './fondo-lulipop.png'

export default function JuegoTrazo({ perfil, onVolver }) {
  const [textoActual, setTextoActual] = useState('A')
  const [colorTrazo, setColorTrazo] = useState('#FF5E62')
  const [mostrarMenu, setMostrarMenu] = useState(false)
  const [inputPersonalizado, setInputPersonalizado] = useState('')
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [dimensiones, setDimensiones] = useState({ w: window.innerWidth, h: window.innerHeight })

  const palabrasPreset = ['A', 'B', 'C', 'MAMA', 'PAPA', 'SOL', 'LULU', '123']
  const colores = [
    { id: '#FF5E62', shadow: '#C0392B' }, // Rojo/Rosa
    { id: '#4facfe', shadow: '#005580' }, // Azul
    { id: '#43e97b', shadow: '#27ae60' }, // Verde
    { id: '#FFD166', shadow: '#CCAC00' }, // Amarillo
    { id: '#a18cd1', shadow: '#6b4c9a' }  // Morado
  ]

  // Ajustar el canvas al tamaño real de la pantalla
  useEffect(() => {
    const handleResize = () => {
      setDimensiones({ w: window.innerWidth, h: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Redibujar la palabra gigante cada vez que cambia el texto o el tamaño de pantalla
  useEffect(() => {
    inicializarCanvas()
  }, [textoActual, dimensiones])

  const inicializarCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Calcular un tamaño de letra gigante pero que quepa en pantalla
    const fontSize = Math.min(canvas.width / (textoActual.length * 0.7), canvas.height * 0.5, 300)
    
    ctx.font = "900 " + fontSize + "px 'Fredoka', sans-serif"
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Dibujar la "Pista" (Letra gigante translúcida con borde punteado)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.fillText(textoActual, centerX, centerY)

    ctx.lineWidth = 6
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.setLineDash([15, 20]) // Borde punteado
    ctx.strokeText(textoActual, centerX, centerY)
    ctx.setLineDash([]) // Resetear para el pincel del usuario
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
    
    // Configurar el Pincel Mágico
    ctx.strokeStyle = colorTrazo
    ctx.lineWidth = 45 // Pincel bien gordo y suave
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowBlur = 15 // Efecto de brillo (Glow)
    ctx.shadowColor = colorTrazo
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getCoordinates(e, canvas)
    
    ctx.lineTo(x, y)
    ctx.stroke()

    // EFECTO DE DIVERSIÓN: Soltar chispitas blancas aleatorias al dibujar
    if (Math.random() > 0.6) {
      ctx.save()
      ctx.beginPath()
      const offsetX = x + (Math.random() - 0.5) * 80
      const offsetY = y + (Math.random() - 0.5) * 80
      ctx.arc(offsetX, offsetY, Math.random() * 6 + 2, 0, Math.PI * 2)
      ctx.fillStyle = '#FFFFFF'
      ctx.shadowBlur = 10
      ctx.shadowColor = '#FFFFFF'
      ctx.fill()
      ctx.restore()
      
      // Restaurar el pincel principal para que no se corte la línea
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const stopDrawing = () => {
    setIsDrawing(false)
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
      minHeight: '100vh',
      width: '100vw',
      backgroundImage: "url(" + fondoImg + ")",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute',
      top: 0, left: 0, zIndex: 10,
      overflow: 'hidden' // Evita scroll
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;900&display=swap');
        
        .anim-pop {
          animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      {/* LIENZO A PANTALLA COMPLETA (Fondo Transparente) */}
      <canvas
        ref={canvasRef}
        width={dimensiones.w}
        height={dimensiones.h}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          touchAction: 'none',
          zIndex: 1 // Por encima del fondo, por debajo de los botones
        }}
      />

      {/* UI SUPERIOR FLOTANTE */}
      <div style={{ 
        position: 'absolute', top: '25px', left: '25px', right: '25px', 
        display: 'flex', justifyContent: 'space-between', zIndex: 10, pointerEvents: 'none' 
      }}>
        <button onClick={onVolver} style={{
          width: '60px', height: '60px', borderRadius: '20px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
          fontSize: '26px', cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 8px 0 #E0E0E0, 0 15px 20px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          ❮
        </button>

        <button onClick={inicializarCanvas} style={{
          height: '60px', padding: '0 25px', borderRadius: '20px',
          backgroundColor: '#FFFFFF', color: '#333', border: 'none', 
          fontSize: '20px', fontWeight: '900', cursor: 'pointer', pointerEvents: 'auto',
          boxShadow: '0 8px 0 #E0E0E0, 0 15px 20px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          🧹 <span style={{ color: '#FF6B6B' }}>Borrar</span>
        </button>
      </div>

      {/* DOCK INFERIOR (Colores y Menú Mágico) */}
      <div style={{
        position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '15px 25px',
        borderRadius: '40px', backdropFilter: 'blur(15px)', border: '4px solid white',
        boxShadow: '0 20px 40px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', 
        gap: '20px', zIndex: 10, animation: 'float 4s ease-in-out infinite'
      }}>
        
        {/* Selector de Colores */}
        <div style={{ display: 'flex', gap: '12px' }}>
          {colores.map(c => (
            <div key={c.id} onClick={() => setColorTrazo(c.id)} style={{
              width: '45px', height: '45px', borderRadius: '50%', backgroundColor: c.id, 
              cursor: 'pointer', border: colorTrazo === c.id ? '5px solid white' : '3px solid rgba(255,255,255,0.8)',
              boxShadow: colorTrazo === c.id ? "0 0 20px " + c.id : "0 6px 0 " + c.shadow,
              transform: colorTrazo === c.id ? 'translateY(-5px) scale(1.1)' : 'scale(1)',
              transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }} />
          ))}
        </div>

        <div style={{ width: '2px', height: '40px', backgroundColor: '#E2E8F0', borderRadius: '2px' }} />

        {/* Botón Abrir Menú Palabras */}
        <button onClick={() => setMostrarMenu(true)} style={{
          backgroundColor: '#FFD166', color: '#7A5C00', border: 'none',
          padding: '12px 20px', borderRadius: '25px', fontSize: '24px',
          fontWeight: '900', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
          boxShadow: '0 6px 0 #CCAC00, 0 10px 15px rgba(0,0,0,0.15)'
        }}>
          ✨ A-B-C
        </button>
      </div>

      {/* MENÚ MODAL DE PALABRAS (Pantalla Completa Cristalina) */}
      {mostrarMenu && (
        <div className="anim-pop" style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(20px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          zIndex: 100
        }}>
          <div style={{
            backgroundColor: '#FFFFFF', padding: '40px', borderRadius: '40px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)', border: '6px solid #F8FAFC',
            width: '90%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '30px',
            position: 'relative'
          }}>
            <button onClick={() => setMostrarMenu(false)} style={{
              position: 'absolute', top: '-20px', right: '-20px', width: '50px', height: '50px',
              borderRadius: '50%', backgroundColor: '#FF6B6B', color: 'white', border: 'none',
              fontSize: '24px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 6px 0 #C0392B'
            }}>X</button>
            
            <h2 style={{ textAlign: 'center', color: '#333', fontSize: '2rem', margin: 0 }}>¿Qué vamos a dibujar?</h2>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
              {palabrasPreset.map(p => (
                <button key={p} onClick={() => { setTextoActual(p); setMostrarMenu(false); }} style={{ 
                  backgroundColor: '#F1F5F9', border: 'none', padding: '15px 25px', borderRadius: '20px',
                  fontSize: '1.5rem', fontWeight: '900', color: '#475569', cursor: 'pointer',
                  boxShadow: '0 6px 0 #CBD5E1', transition: 'transform 0.1s'
                }}>
                  {p}
                </button>
              ))}
            </div>

            <div style={{ height: '4px', backgroundColor: '#F1F5F9', borderRadius: '2px', width: '100%' }} />

            <form onSubmit={guardarPersonalizada} style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <input type="text" placeholder="Tu palabra..." value={inputPersonalizado} onChange={(e) => setInputPersonalizado(e.target.value)} maxLength={7} style={{
                padding: '15px 25px', borderRadius: '20px', border: '4px solid #E2E8F0',
                fontFamily: 'Fredoka', fontSize: '1.5rem', outline: 'none', width: '250px',
                textAlign: 'center', color: '#333', textTransform: 'uppercase'
              }} />
              <button type="submit" style={{
                backgroundColor: '#43e97b', color: 'white', border: 'none', padding: '0 30px',
                borderRadius: '20px', fontSize: '1.2rem', fontWeight: '900', cursor: 'pointer',
                boxShadow: '0 6px 0 #27ae60'
              }}>¡Vale!</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
