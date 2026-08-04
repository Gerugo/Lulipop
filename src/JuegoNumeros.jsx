import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoNumeros({ perfil, onVolver }) {
  const [numeros, setNumeros] = useState([])
  const [siguiente, setSiguiente] = useState(1)
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    const numerosIniciales = [1, 2, 3, 4, 5].sort(() => Math.random() - 0.5)
    setNumeros(numerosIniciales)
  }, [])

  const tocarNumero = (num) => {
    if (num === siguiente) {
      if (num === 5) {
        setVictoria(true)
        guardarProgreso()
      } else {
        setSiguiente(siguiente + 1)
      }
    } else {
      const btn = document.getElementById(`btn-${num}`)
      btn.classList.add('error-shake')
      setTimeout(() => btn.classList.remove('error-shake'), 400)
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
          actividad_id: 'numeros_1_5',
          completado: true,
          estrellas: 3
        }
      ])
    if (error) console.error("Error guardando progreso:", error)
    setGuardando(false)
  }

  // Paleta de colores vibrantes estilo Keiki para cada número
  const colores = {
    1: { top: '#FF5E7E', bottom: '#D9385E', highlight: '#FF99AE' },
    2: { top: '#33CCFF', bottom: '#0099CC', highlight: '#80E5FF' },
    3: { top: '#FFD700', bottom: '#CCAC00', highlight: '#FFE566' },
    4: { top: '#9966FF', bottom: '#6633CC', highlight: '#C299FF' },
    5: { top: '#00CC66', bottom: '#00994C', highlight: '#66FFB2' },
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      /* Fondo animado y juguetón */
      background: 'radial-gradient(circle at 50% 50%, #4A00E0 0%, #8E2DE2 100%)',
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: '"Fredoka", "Nunito", sans-serif',
      position: 'absolute',
      top: 0, left: 0, zIndex: 10,
      overflow: 'hidden'
    }}>
      
      {/* Importamos fuente infantil y creamos animaciones 3D */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        
        .burbuja-3d {
          width: 120px;
          height: 120px;
          border-radius: 35px; /* Forma de Squircle (Keiki style) */
          font-size: 4rem;
          font-weight: 700;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.1s cubic-bezier(0.4, 0, 0.2, 1);
          -webkit-tap-highlight-color: transparent;
        }

        .burbuja-3d:active {
          transform: translateY(12px) scale(0.95) !important;
        }

        @keyframes popOut {
          0% { transform: scale(1); }
          50% { transform: scale(1.3) rotate(10deg); }
          100% { transform: scale(0); opacity: 0; }
        }

        @keyframes floatIdle {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }

        .error-shake {
          animation: wobble 0.4s ease-in-out;
        }

        @keyframes wobble {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-15px) rotate(-5deg); }
          75% { transform: translateX(15px) rotate(5deg); }
        }

        @keyframes rayoEstelar {
          0% { transform: scale(0.8) rotate(0deg); opacity: 0.8; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(0.8) rotate(360deg); opacity: 0.8; }
        }
      `}</style>

      {/* Botón de volver moderno */}
      <button 
        onClick={onVolver}
        style={{ 
          position: 'absolute', top: '30px', left: '30px', 
          width: '60px', height: '60px', borderRadius: '20px',
          backgroundColor: '#FFFFFF', color: '#8E2DE2', 
          border: 'none', fontSize: '24px', cursor: 'pointer',
          boxShadow: '0 8px 0 #E0E0E0, 0 15px 20px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'transform 0.1s', zIndex: 20
        }}
        onMouseDown={e => e.currentTarget.style.transform = 'translateY(8px)'}
        onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        ❮
      </button>

      {!victoria ? (
        <>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '20px 40px',
            borderRadius: '40px',
            backdropFilter: 'blur(10px)',
            marginBottom: '60px',
            border: '3px solid rgba(255, 255, 255, 0.4)'
          }}>
            <h2 style={{ 
              color: 'white', fontSize: '3rem', margin: 0,
              textShadow: '0px 4px 10px rgba(0,0,0,0.3)'
            }}>
              Busca el <span style={{ 
                color: '#FFD700', 
                fontSize: '4.5rem', 
                textShadow: '0 5px 0 #CCAC00',
                display: 'inline-block',
                animation: 'floatIdle 2s infinite'
              }}>{siguiente}</span>
            </h2>
          </div>

          <div style={{ 
            display: 'flex', gap: '30px', flexWrap: 'wrap', 
            justifyContent: 'center', maxWidth: '800px' 
          }}>
            {numeros.map((num, index) => {
              const color = colores[num]
              return (
                <div 
                  key={num} 
                  id={`btn-${num}`}
                  className="burbuja-3d"
                  onClick={() => tocarNumero(num)}
                  style={{ 
                    backgroundColor: color.top,
                    // Este boxShadow es la magia del "Claymorphism" que usa Keiki
                    boxShadow: `
                      inset 0px 8px 0px ${color.highlight}, 
                      inset 0px -8px 0px rgba(0,0,0,0.15), 
                      0px 12px 0px ${color.bottom}, 
                      0px 20px 20px rgba(0,0,0,0.3)
                    `,
                    textShadow: '0px 4px 0px rgba(0,0,0,0.2)',
                    animation: num < siguiente 
                      ? 'popOut 0.4s forwards' 
                      : `floatIdle ${2.5 + (index % 2)}s ease-in-out infinite`,
                    pointerEvents: num < siguiente ? 'none' : 'auto'
                  }}
                >
                  {num}
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', zIndex: 10 }}>
          <div style={{ fontSize: '120px', animation: 'rayoEstelar 4s linear infinite', textShadow: '0 0 50px #FFD700' }}>
            🌟
          </div>
          <h1 style={{ 
            color: 'white', fontSize: '5rem', margin: '20px 0',
            textShadow: '0 8px 0 #8E2DE2, 0 15px 30px rgba(0,0,0,0.4)',
            fontFamily: '"Fredoka", sans-serif'
          }}>
            ¡Mágico!
          </h1>
          <button 
            onClick={onVolver}
            style={{ 
              marginTop: '20px', padding: '20px 50px', fontSize: '2rem', 
              backgroundColor: '#00CC66', color: 'white', border: 'none', 
              borderRadius: '40px', cursor: 'pointer', fontFamily: '"Fredoka", sans-serif',
              boxShadow: 'inset 0px 6px 0px #66FFB2, inset 0px -6px 0px rgba(0,0,0,0.1), 0px 10px 0px #00994C, 0px 20px 25px rgba(0,0,0,0.3)',
              transition: 'transform 0.1s'
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'translateY(10px)'}
            onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {guardando ? 'Guardando...' : '¡Genial! 🚀'}
          </button>
        </div>
      )}
    </div>
  )
}