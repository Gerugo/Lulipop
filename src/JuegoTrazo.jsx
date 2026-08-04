import React, { useState, useRef, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoTrazo({ perfil, onVolver }) {
  const canvasRef = useRef(null)
  const [indiceLetra, setIndiceLetra] = useState(0)
  const [dibujando, setDibujando] = useState(false)
  const [trazosHechos, setTrazosHechos] = useState(0)
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const letrasTrazo = [
    { letra: 'A', palabra: 'Avión', emoji: '✈️', color: '#FF5E62' },
    { letra: 'E', emoji: '🐘', palabra: 'Elefante', color: '#33CCFF' },
    { letra: 'I', emoji: 'Iglú', palabra: 'Iglú', color: '#FFD166' },
    { letra: 'O', emoji: 'Oso', palabra: 'Oso', color: '#FF9966' },
    { letra: 'U', emoji: 'Uvas', palabra: 'Uvas', color: '#9b5de5' }
  ]

  const letraActual = letrasTrazo[indiceLetra]

  useEffect(() => {
    prepararLienzo()
  }, [indiceLetra])

  const prepararLienzo = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Dibujar la letra guía en gris claro punteado / translúcido
    ctx.font = 'bold 220px "Fredoka", sans-serif'
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(letraActual.letra, canvas.width / 2, canvas.height / 2)
  }

  const iniciarTrazo = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top

    setDibujando(true)
    const ctx = canvas.getContext('2d')
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineWidth = 28
    ctx.lineCap = 'round'
    ctx.strokeStyle = letraActual.color
  }

  const trazar = (e) => {
    if (!dibujando) return
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX || e.touches[0].clientX) - rect.left
    const y = (e.clientY || e.touches[0].clientY) - rect.top

    const ctx = canvas.getContext('2d')
    ctx.lineTo(x, y)
    ctx.stroke()
    
    setTrazosHechos(prev => prev + 1)
  }

  const terminarTrazo = () => {
    setDibujando(false)
  }

  const siguienteLetra = () => {
    if (indiceLetra + 1 < letrasTrazo.length) {
      setIndiceLetra(prev => prev + 1)
      setTrazosHechos(0)
    } else {
      setVictoria(true)
      guardarProgreso()
    }
  }

  const guardarProgreso = async () => {
    setGuardando(true)
    const { error } = await supabase
      .from('progreso_actividades')
      .insert([
        {
          perfil_id: perfil.id,
          padre_id: perfil.padre_id,
          actividad_id: 'trazo_letras',
          completado: true,
          estrellas: 3
        }
      ])
    if (error) console.error("Error guardando progreso:", error)
    setGuardando(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      background: 'radial-gradient(circle at 50% 50%, #89f7fe 0%, #66a6ff 100%)',
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
        @keyframes floatGuia {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
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
          backgroundColor: '#FFFFFF', color: '#0066CC', 
          border: 'none', fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20
        }}
      >
        ❮
      </button>

      {!victoria ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
          
          {/* Cabecera instructiva con personaje guía */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            padding: '10px 25px',
            borderRadius: '25px',
            backdropFilter: 'blur(8px)',
            marginBottom: '20px',
            border: '3px solid white',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <span style={{ fontSize: '35px', animation: 'floatGuia 2s ease-in-out infinite' }}>🐥</span>
            <span style={{ color: '#333', fontSize: '1.4rem', fontWeight: '700' }}>
              ¡Sigue la letra <span style={{ color: letraActual.color }}>{letraActual.letra}</span> ({letraActual.palabra} {letraActual.emoji}) con el dedo!
            </span>
          </div>

          {/* Lienzo de trazo */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '35px',
            padding: '15px',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
            border: '5px solid white',
            marginBottom: '20px',
            position: 'relative'
          }}>
            <canvas 
              ref={canvasRef}
              width={320}
              height={320}
              onMouseDown={iniciarTrazo}
              onMouseMove={trazar}
              onMouseUp={terminarTrazo}
              onTouchStart={iniciarTrazo}
              onTouchMove={trazar}
              onTouchEnd={terminarTrazo}
              style={{
                borderRadius: '25px',
                cursor: 'crosshair',
                display: 'block',
                touchAction: 'none',
                backgroundColor: '#FAFAFA'
              }}
            />
          </div>

          {/* Botón para pasar a la siguiente letra o limpiar */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={prepararLienzo}
              style={{
                backgroundColor: '#FF9966',
                color: 'white',
                border: 'none',
                padding: '14px 25px',
                borderRadius: '20px',
                fontSize: '1.1rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 6px 0 #D9534F, 0 10px 15px rgba(0,0,0,0.15)',
                fontFamily: '"Fredoka", sans-serif'
              }}
            >
              Borrar 🧹
            </button>

            <button 
              onClick={siguienteLetra}
              style={{
                backgroundColor: '#00CC66',
                color: 'white',
                border: 'none',
                padding: '14px 35px',
                borderRadius: '20px',
                fontSize: '1.2rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 6px 0 #00994C, 0 10px 15px rgba(0,0,0,0.15)',
                fontFamily: '"Fredoka", sans-serif'
              }}
            >
              ¡Siguiente! 🚀
            </button>
          </div>

          <p style={{ color: 'white', marginTop: '20px', fontSize: '1.1vmax', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Letra {indiceLetra + 1} de {letrasTrazo.length} 🌟
          </p>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
          <div style={{ fontSize: '100px', animation: 'latidoEstelar 1.5s infinite' }}>
            ✍️✨🏆
          </div>
          <h1 style={{ color: 'white', fontSize: '3.5rem', margin: 0, textShadow: '0 5px 0 #005580' }}>
            ¡Excelente Trazador!
          </h1>
          <p style={{ color: 'white', fontSize: '1.5rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            ¡Has completado el trazo de todas las letras magistralmente!
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
            {guardando ? 'Guardando...' : '¡Genial! 🚀'}
          </button>
        </div>
      )}
    </div>
  )
}
