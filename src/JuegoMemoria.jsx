import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoMemoria({ perfil, onVolver }) {
  const emojisOriginales = ['🐶', '🐱', '🐰', '🦊', '🐼', '🦁', '🐵', '🐸']
  const [cartas, setCartas] = useState([])
  const [seleccionadas, setSeleccionadas] = useState([])
  const [acertadas, setAcertadas] = useState([])
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    iniciarJuego()
  }, [])

  const iniciarJuego = () => {
    // Seleccionamos 4 emojis para un tablero manejable de 8 cartas
    const seleccion = [...emojisOriginales].sort(() => Math.random() - 0.5).slice(0, 4)
    const duplicadas = [...seleccion, ...seleccion]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji }))
    
    setCartas(duplicadas)
    setSeleccionadas([])
    setAcertadas([])
    setVictoria(false)
  }

  const manejarClickCarta = (index) => {
    if (seleccionadas.length === 2 || acertadas.includes(index) || seleccionadas.includes(index)) return

    const nuevasSeleccionadas = [...seleccionadas, index]
    setSeleccionadas(nuevasSeleccionadas)

    if (nuevasSeleccionadas.length === 2) {
      const [primero, segundo] = nuevasSeleccionadas
      if (cartas[primero].emoji === cartas[segundo].emoji) {
        const nuevasAcertadas = [...acertadas, primero, segundo]
        setAcertadas(nuevasAcertadas)
        setSeleccionadas([])

        if (nuevasAcertadas.length === cartas.length) {
          setVictoria(true)
          guardarProgreso()
        }
      } else {
        setTimeout(() => {
          setSeleccionadas([])
        }, 800)
      }
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
          actividad_id: 'juego_memoria',
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
      background: 'radial-gradient(circle at 50% 50%, #fbc2eb 0%, #a6c1ee 100%)',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute',
      top: 0, left: 0, zIndex: 10,
      overflow: 'hidden',
      userSelect: 'none',
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');

        .carta-memoria {
          width: 90px;
          height: 110px;
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 3rem;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .carta-memoria:active {
          transform: scale(0.95);
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
          width: '50px', height: '50px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#764ba2', 
          border: 'none', fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 20
        }}
      >
        ❮
      </button>

      {!victoria ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            padding: '10px 25px',
            borderRadius: '25px',
            backdropFilter: 'blur(10px)',
            marginBottom: '30px',
            border: '3px solid white',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)'
          }}>
            <h2 style={{ color: '#333', fontSize: '1.6rem', margin: 0 }}>
              🧠 ¡Encuentra las parejas de animalitos!
            </h2>
          </div>

          {/* Tablero de cartas (4x2) */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '15px', 
            justifyContent: 'center',
            marginBottom: '25px'
          }}>
            {cartas.map((carta, index) => {
              const estaVolteada = seleccionadas.includes(index) || acertadas.includes(index)

              return (
                <div 
                  key={carta.id}
                  className="carta-memoria"
                  onClick={() => manejarClickCarta(index)}
                  style={{
                    backgroundColor: estaVolteada ? '#FFFFFF' : '#FF758C',
                    boxShadow: estaVolteada 
                      ? 'inset 0px 4px 0px rgba(255,255,255,0.8), 0px 8px 0px #CCCCCC, 0px 12px 15px rgba(0,0,0,0.15)' 
                      : 'inset 0px 5px 0px #FF96A7, 0px 8px 0px #C73E5B, 0px 12px 15px rgba(0,0,0,0.2)',
                    border: '4px solid white',
                    transform: estaVolteada ? 'rotateY(0deg)' : 'rotateY(0deg)'
                  }}
                >
                  {estaVolteada ? carta.emoji : '❓'}
                </div>
              )
            })}
          </div>

          <button 
            onClick={iniciarJuego}
            style={{
              backgroundColor: '#6a11cb',
              color: 'white',
              border: 'none',
              padding: '12px 25px',
              borderRadius: '18px',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 6px 0 #4e0d96, 0 10px 15px rgba(0,0,0,0.15)',
              fontFamily: '"Fredoka", sans-serif'
            }}
          >
            Reiniciar Tablero 🔄
          </button>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
          <div style={{ fontSize: '100px', animation: 'latidoEstelar 1.5s infinite' }}>
            🧠✨🏆
          </div>
          <h1 style={{ color: 'white', fontSize: '3.5rem', margin: 0, textShadow: '0 5px 0 #4e0d96' }}>
            ¡Memoria de Elefante!
          </h1>
          <p style={{ color: 'white', fontSize: '1.5rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            ¡Has encontrado todas las parejas con éxito!
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
