import React, { useState, useRef, useEffect } from 'react'
import { supabase } from './supabaseClient'
import NivelSelector from './NivelSelector'
import useMejoresNiveles from './useMejoresNiveles'

// Dibuja una plantilla guía (contorno) según el nivel elegido. Nivel 1 es un
// lienzo totalmente libre; los niveles 2 y 3 dan al niño formas para colorear,
// cada vez con una escena más completa.
function dibujarEstrella(ctx, cx, cy, radio) {
  ctx.beginPath()
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? radio : radio * 0.45
    const angulo = (Math.PI / 5) * i - Math.PI / 2
    const x = cx + r * Math.cos(angulo)
    const y = cy + r * Math.sin(angulo)
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.stroke()
}

function dibujarSol(ctx, cx, cy, radio) {
  ctx.beginPath()
  ctx.arc(cx, cy, radio, 0, Math.PI * 2)
  ctx.stroke()
  for (let i = 0; i < 8; i++) {
    const angulo = (Math.PI / 4) * i
    const x1 = cx + Math.cos(angulo) * (radio + 10)
    const y1 = cy + Math.sin(angulo) * (radio + 10)
    const x2 = cx + Math.cos(angulo) * (radio + 35)
    const y2 = cy + Math.sin(angulo) * (radio + 35)
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }
}

function dibujarCasa(ctx, x, y, ancho, alto) {
  ctx.beginPath()
  ctx.rect(x, y, ancho, alto)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x - 15, y)
  ctx.lineTo(x + ancho / 2, y - ancho * 0.5)
  ctx.lineTo(x + ancho + 15, y)
  ctx.stroke()
  ctx.beginPath()
  ctx.rect(x + ancho * 0.38, y + alto * 0.4, ancho * 0.24, alto * 0.6)
  ctx.stroke()
}

function dibujarArbol(ctx, cx, base, altoTronco, radioCopa) {
  ctx.beginPath()
  ctx.rect(cx - 10, base - altoTronco, 20, altoTronco)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(cx, base - altoTronco - radioCopa * 0.6, radioCopa, 0, Math.PI * 2)
  ctx.stroke()
}

function dibujarNube(ctx, cx, cy, escala) {
  ctx.beginPath()
  ctx.arc(cx - 25 * escala, cy, 20 * escala, 0, Math.PI * 2)
  ctx.arc(cx, cy - 12 * escala, 26 * escala, 0, Math.PI * 2)
  ctx.arc(cx + 28 * escala, cy, 20 * escala, 0, Math.PI * 2)
  ctx.stroke()
}

const NIVELES = [
  { id: 'facil', nombre: 'Fácil', descripcion: 'Lienzo libre', emoji: '🖌️', color: '#43e97b', sombra: '#27ae60', plantilla: 'libre' },
  { id: 'medio', nombre: 'Medio', descripcion: 'Colorea la estrella', emoji: '🌟', color: '#4facfe', sombra: '#005580', plantilla: 'estrella' },
  { id: 'dificil', nombre: 'Difícil', descripcion: 'Colorea el paisaje', emoji: '🏡', color: '#FF9966', sombra: '#D9534F', plantilla: 'escena' },
]

export default function JuegoArte({ perfil, onVolver }) {
  const canvasRef = useRef(null)
  const [nivelId, setNivelId] = useState(null)
  const [colorActual, setColorActual] = useState('#FF5E62')
  const [herramienta, setHerramienta] = useState('pincel')
  const [selloActual, setSelloActual] = useState('⭐')
  const [dibujando, setDibujando] = useState(false)
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const { mejores, guardarMejorNivel } = useMejoresNiveles('arte', perfil?.id)
  const nivel = NIVELES.find((n) => n.id === nivelId)

  const colores = ['#FF5E62', '#FF9966', '#FFD166', '#06D6A0', '#118AB2', '#9b5de5', '#ff007f']
  const sellos = ['⭐', '❤️', '🐱', '🦄', '🚗', '🌲']

  const empezarNivel = (id) => {
    setNivelId(id)
    setVictoria(false)
    setHerramienta('pincel')
  }

  useEffect(() => {
    if (nivel) inicializarLienzo()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nivelId])

  const inicializarLienzo = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#CBD5E1'
    ctx.lineWidth = 5
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'

    if (nivel.plantilla === 'estrella') {
      dibujarEstrella(ctx, canvas.width / 2, canvas.height / 2, 130)
    } else if (nivel.plantilla === 'escena') {
      dibujarSol(ctx, 100, 80, 40)
      dibujarNube(ctx, 480, 70, 1.1)
      dibujarCasa(ctx, 230, 260, 140, 90)
      dibujarArbol(ctx, 500, 340, 60, 45)
      dibujarArbol(ctx, 90, 340, 45, 32)
    }
  }

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
    guardarMejorNivel(nivelId, 3)
    setVictoria(true)
  }

  if (!nivel) {
    return (
      <NivelSelector
        onVolver={onVolver}
        emojiJuego="🎨"
        titulo="Taller de Arte Mágico"
        subtitulo="Elige tu reto"
        niveles={NIVELES}
        mejores={mejores}
        onSeleccionar={empezarNivel}
      />
    )
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
          
          <h2 style={{ color: 'white', fontSize: '1.6rem', margin: '0 0 15px 0', textShadow: '0 2px 5px rgba(0,0,0,0.2)' }}>
            {nivel.emoji} {nivel.descripcion}
          </h2>

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

            <div 
              className="btn-toolbar" 
              onClick={() => setHerramienta(herramienta === 'sello' ? 'pincel' : 'sello')}
              style={{ backgroundColor: herramienta === 'sello' ? '#FFE599' : 'white' }}
              title="Sellos Mágicos"
            >
              ⭐
            </div>

            <div 
              className="btn-toolbar" 
              onClick={() => setHerramienta('borrador')}
              style={{ backgroundColor: herramienta === 'borrador' ? '#FF9999' : 'white' }}
              title="Borrador"
            >
              🧹
            </div>

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
            ¡Nivel {nivel.nombre} completado!
          </p>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => setNivelId(null)}
              style={{ 
                padding: '16px 35px', fontSize: '1.4rem', 
                backgroundColor: '#FFD166', color: '#7A5C00', border: 'none', 
                borderRadius: '35px', cursor: 'pointer',
                boxShadow: '0 8px 0 #CCAC00',
                fontFamily: '"Fredoka", sans-serif'
              }}
            >
              🔁 Otro nivel
            </button>
            <button 
              onClick={onVolver}
              style={{ 
                padding: '16px 35px', fontSize: '1.4rem', 
                backgroundColor: '#00CC66', color: 'white', border: 'none', 
                borderRadius: '35px', cursor: 'pointer',
                boxShadow: 'inset 0px 5px 0px #66FFB2, 0px 8px 0px #00994C, 0px 15px 20px rgba(0,0,0,0.2)',
                fontFamily: '"Fredoka", sans-serif'
              }}
            >
              ¡Genial! 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
