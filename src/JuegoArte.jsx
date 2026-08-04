import React, { useState, useRef, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoArte({ perfil, onVolver }) {
  const canvasRef = useRef(null)
  const [colorActual, setColorActual] = useState('#FF5E62')
  const [herramienta, setHerramienta] = useState('pincel') // 'pincel', 'sello', 'borrador'
  const [selloActual, setSelloActual] = useState('⭐')
  const [dibujando, setDibujando] = useState(false)
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const colores = ['#FF5E62', '#FF9966', '#FFD166', '#06D6A0', '#118AB2', '#9b5de5', '#ff007f']
  const sellos = ['⭐', '❤️', '🐱', '🦄', '🚗', '🌲']

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    // Fondo blanco inicial para el lienzo
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const iniciarTrazo = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top

    const ctx = canvas.getContext('2d')

    if (herramienta === 'sello') {
      ctx.font = '45px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(selloActual, x, y)
    } else {
      setDibujando(true)
      ctx.beginPath()
      ctx.moveTo(x, y)
    }
  }

  const trazar = (e) => {
    if (!dibujando || herramienta === 'sello') return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top

    const ctx = canvas.getContext('2d')
    ctx.lineWidth = herramienta === 'borrador' ? 35 : 16
    ctx.lineCap = 'round'
    ctx.strokeStyle = herramienta === 'borrador' ? '#FFFFFF' : colorActual

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const terminarTrazo = () => {
    setDibujando(false)
  }

  const guardarObra = async () => {
    setGuardando(true)
    const { error } = await supabase
      .from('progreso_actividades')
      .insert([
        {
          perfil_id: perfil.id,
          padre_id: perfil.padre_id,
          actividad_id: 'arte_creativo',
          completado: true,
          estrellas: 3
        }
      ])
    if (error) console.error("Error guardando progreso:", error)
    setGuardando(false)
    setVictoria(true)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      background: 'radial-gradient(circle at 50% 50%, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute',
      top: 0, left: 0, zIndex: 10,
      overflow: 'hidden',
      userSelect: 'none',
      padding: '15px',
      boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        
        .btn-toolbar {
          width: 55px;
          height: 55px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          background: white;
          box-shadow: 0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.1);
          transition: transform 0.1s;
        }
        .btn-toolbar:active {
          transform: translateY(6px);
        }
        @keyframes latidoEstelar {
          0% { transform: scale(0.9); }
          50% { transform: scale(1.1); }
          100% { transform: scale(0.9); }
        }
      `}</style>

      {/* Botón de volver */}
      <button 
        onClick={onVolver}
        style={{ 
          position: 'absolute', top: '20px', left: '20px', 
          width: '50px', height: '50px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#FF6A88', 
          border: 'none', fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20
        }}
      >
        ❮
      </button>

      {!victoria ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '700px' }}>
          
          <h2 style={{ color: 'white', fontSize: '1.8rem', margin: '0 0 15px 0', textShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
            🎨 Taller de Arte Mágico
          </h2>

          {/* Lienzo */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '30px',
            padding: '10px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
            border: '4px solid white',
            marginBottom: '15px'
          }}>
            <canvas 
              ref={canvasRef}
              width={620}
              height={340}
              onMouseDown={iniciarTrazo}
              onMouseMove={trazar}
              onMouseUp={terminarTrazo}
              onTouchStart={iniciarTrazo}
              onTouchMove={trazar}
              onTouchEnd={terminarTrazo}
              style={{
                borderRadius: '20px',
                cursor: herramienta === 'sello' ? 'copy' : 'crosshair',
                display: 'block',
                touchAction: 'none',
                backgroundColor: '#FFF'
              }}
            />
          </div>

          {/* Barra de herramientas / Colores */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            padding: '12px 20px',
            borderRadius: '25px',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            gap: '15px',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: '3px solid white',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            
            {/* Selector de colores */}
            {herramienta !== 'sello' && colores.map((c) => (
              <div 
                key={c}
                onClick={() => { setColorActual(c); setHerramienta('pincel'); }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: c,
                  cursor: 'pointer',
                  border: colorActual === c && herramienta === 'pincel' ? '4px solid white' : '2px solid rgba(0,0,0,0.1)',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                  transform: colorActual === c && herramienta === 'pincel' ? 'scale(1.15)' : 'scale(1)',
                  transition: 'transform 0.1s'
                }}
              />
            ))}

            {/* Selector de sellos si está activo */}
            {herramienta === 'sello' && sellos.map((s) => (
              <div 
                key={s}
                onClick={() => setSelloActual(s)}
                style={{
                  fontSize: '28px',
                  padding: '4px 10px',
                  backgroundColor: selloActual === s ? '#FFE599' : 'white',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: selloActual === s ? '2px solid #FF9966' : '2px solid transparent'
                }}
              >
                {s}
              </div>
            ))}

            <div style={{ width: '2px', height: '35px', backgroundColor: '#ddd' }} />

            {/* Botón Herramienta Sellos */}
            <div 
              className="btn-toolbar" 
              onClick={() => setHerramienta(herramienta === 'sello' ? 'pincel' : 'sello')}
              style={{ backgroundColor: herramienta === 'sello' ? '#FFE599' : 'white' }}
              title="Sellos Mágicos"
            >
              ⭐
            </div>

            {/* Botón Borrador */}
            <div 
              className="btn-toolbar" 
              onClick={() => setHerramienta('borrador')}
              style={{ backgroundColor: herramienta === 'borrador' ? '#FF9999' : 'white' }}
              title="Borrador"
            >
              🧹
            </div>

            {/* Botón Terminar / Guardar */}
            <button 
              onClick={guardarObra}
              style={{
                backgroundColor: '#00CC66',
                color: 'white',
                border: 'none',
                padding: '0 20px',
                height: '55px',
                borderRadius: '18px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 6px 0 #00994C, 0 10px 15px rgba(0,0,0,0.15)',
                fontFamily: '"Fredoka", sans-serif'
              }}
            >
              {guardando ? 'Guardando...' : '¡Listo! ✨'}
            </button>

          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
          <div style={{ fontSize: '100px', animation: 'latidoEstelar 1.5s infinite' }}>
            🎨✨🏆
          </div>
          <h1 style={{ color: 'white', fontSize: '3.5rem', margin: 0, textShadow: '0 5px 0 #C0392B' }}>
            ¡Obra Maestra!
          </h1>
          <p style={{ color: 'white', fontSize: '1.5rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            ¡Has creado una obra de arte fantástica!
          </p>
          <button 
            onClick={onVolver}
            style={{ 
              marginTop: '20px',
              padding: '18px 45px', fontSize: '1.6rem', 
              backgroundColor: '#00CC66', color: 'white', border: 'none', 
              borderRadius: '35px', cursor: 'pointer',
              boxShadow: 'inset 0px 5px 0px #66FFB2, 0px 8px 0px #00994C, 0px 15px 20px rgba(0,0,0,0.2)',
              fontFamily: '"Fredoka", sans-serif'
            }}
          >
            ¡Genial! 🚀
          </button>
        </div>
      )}
    </div>
  )
}
