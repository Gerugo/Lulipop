import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoPuzzles({ perfil, onVolver }) {
  const formasOriginales = [
    { id: 1, nombre: 'Estrella', emoji: '⭐', color: '#FFD700', sombra: '#CCAC00' },
    { id: 2, nombre: 'Corazón', emoji: '❤️', color: '#FF5E7E', sombra: '#D9385E' },
    { id: 3, nombre: 'Coche', emoji: '🚗', color: '#33CCFF', sombra: '#0099CC' },
    { id: 4, nombre: 'Árbol', emoji: '🌲', color: '#00CC66', sombra: '#00994C' }
  ]

  const [seleccionado, setSeleccionado] = useState(null)
  const [completados, setCompletados] = useState([])
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const [siluetas] = useState(() => [...formasOriginales].sort(() => Math.random() - 0.5))

  const manejarClickForma = (forma) => {
    if (completados.includes(forma.id)) return
    setSeleccionado(forma)
  }

  const manejarClickSilueta = (silueta) => {
    if (!seleccionado || completados.includes(silueta.id)) return

    if (seleccionado.id === silueta.id) {
      const nuevosCompletados = [...completados, silueta.id]
      setCompletados(nuevosCompletados)
      setSeleccionado(null)

      if (nuevosCompletados.length === formasOriginales.length) {
        setVictoria(true)
        guardarProgreso()
      }
    } else {
      const el = document.getElementById(`silueta-${silueta.id}`)
      el.classList.add('error-shake')
      setTimeout(() => el.classList.remove('error-shake'), 400)
      setSeleccionado(null)
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
          actividad_id: 'puzzles_formas',
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
      background: 'radial-gradient(circle at 50% 50%, #FF9966 0%, #FF5E62 100%)',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '"Fredoka", "Nunito", sans-serif',
      position: 'absolute',
      top: 0, left: 0, zIndex: 10,
      overflow: 'hidden',
      userSelect: 'none',
      padding: '20px'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');

        .pieza-3d {
          width: 100px;
          height: 100px;
          border-radius: 25px;
          font-size: 3.2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pieza-3d:active {
          transform: translateY(8px) scale(0.95);
        }

        .silueta-box {
          width: 100px;
          height: 100px;
          border-radius: 25px;
          background: rgba(0, 0, 0, 0.15);
          border: 4px dashed rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3.2rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .error-shake {
          animation: wobble 0.4s ease-in-out;
        }

        @keyframes wobble {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
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
          position: 'absolute', top: '25px', left: '25px', 
          width: '55px', height: '55px', borderRadius: '18px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', 
          border: 'none', fontSize: '22px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20
        }}
      >
        ❮
      </button>

      {!victoria ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '600px' }}>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.25)',
            padding: '12px 30px',
            borderRadius: '25px',
            backdropFilter: 'blur(10px)',
            marginBottom: '30px',
            border: '3px solid rgba(255, 255, 255, 0.4)',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: 'white', fontSize: '1.8rem', margin: 0, textShadow: '0px 2px 5px rgba(0,0,0,0.2)' }}>
              1️⃣ Toca una figura y 2️⃣ Colócala en su silueta
            </h2>
          </div>

          {/* Fichas superiores */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {formasOriginales.map((forma) => {
              const estaUsada = completados.includes(forma.id)
              const estaSeleccionadoEste = seleccionado?.id === forma.id

              if (estaUsada) return <div key={forma.id} style={{ width: '100px', height: '100px', opacity: 0.15 }} />

              return (
                <div 
                  key={forma.id}
                  className="pieza-3d"
                  onClick={() => manejarClickForma(forma)}
                  style={{
                    backgroundColor: forma.color,
                    boxShadow: `inset 0px 5px 0px rgba(255,255,255,0.6), 0px 8px 0px ${forma.sombra}, 0px 12px 15px rgba(0,0,0,0.2)`,
                    border: estaSeleccionadoEste ? '4px solid #FFF' : '4px solid transparent',
                    transform: estaSeleccionadoEste ? 'scale(1.1) translateY(-5px)' : 'scale(1)'
                  }}
                >
                  {forma.emoji}
                </div>
              )
            })}
          </div>

          {/* Siluetas inferiores reales (con filtro oscuro) */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {siluetas.map((silueta) => {
              const estaCompletado = completados.includes(silueta.id)

              return (
                <div 
                  key={silueta.id}
                  id={`silueta-${silueta.id}`}
                  className="silueta-box"
                  onClick={() => manejarClickSilueta(silueta)}
                  style={{
                    backgroundColor: estaCompletado ? silueta.color : 'rgba(0, 0, 0, 0.2)',
                    borderColor: estaCompletado ? '#FFF' : 'rgba(255, 255, 255, 0.6)',
                    boxShadow: estaCompletado ? `0px 6px 0px ${silueta.sombra}` : 'none',
                    filter: !estaCompletado ? 'brightness(0) opacity(0.4)' : 'none'
                  }}
                >
                  {silueta.emoji}
                </div>
              )
            })}
          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
          <div style={{ fontSize: '100px', animation: 'latidoEstelar 1.5s infinite' }}>
            🏆✨
          </div>
          <h1 style={{ color: 'white', fontSize: '3.5rem', margin: 0, textShadow: '0 5px 0 #CC3333' }}>
            ¡Excelente!
          </h1>
          <p style={{ color: 'white', fontSize: '1.5rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            ¡Has completado el puzzle correctamente!
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