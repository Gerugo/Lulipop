import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoLetras({ perfil, onVolver }) {
  const preguntasOriginales = [
    { id: 1, letra: 'A', palabra: 'Manzana', emoji: '🍎', color: '#FF5E62', sombra: '#D9385E' },
    { id: 2, letra: 'E', palabra: 'Elefante', emoji: '🐘', color: '#33CCFF', sombra: '#0099CC' },
    { id: 3, letra: 'I', palabra: 'Isla', emoji: '🏝️', color: '#FFD166', sombra: '#CCAC00' },
    { id: 4, letra: 'O', palabra: 'Oso', emoji: '🐻', color: '#FF9966', sombra: '#D9534F' },
    { id: 5, letra: 'U', palabra: 'Uvas', emoji: '🍇', color: '#9b5de5', sombra: '#723dbe' }
  ]

  const [indiceActual, setIndiceActual] = useState(0)
  const [opciones, setOpciones] = useState(() => generarOpciones(0))
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  function generarOpciones(idxActual) {
    const correcta = preguntasOriginales[idxActual]
    // Cogemos otras 2 aleatorias que no sean la correcta
    const otras = preguntasOriginales.filter(p => p.id !== correcta.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2)
    
    return [correcta, ...otras].sort(() => Math.random() - 0.5)
  }

  const manejarSeleccion = (opcion) => {
    const actual = preguntasOriginales[indiceActual]

    if (opcion.id === actual.id) {
      // Correcto
      if (indiceActual + 1 < preguntasOriginales.length) {
        const siguiente = indiceActual + 1
        setIndiceActual(siguiente)
        setOpciones(generarOpciones(siguiente))
      } else {
        setVictoria(true)
        guardarProgreso()
      }
    } else {
      // Error: efecto shake
      const el = document.getElementById(`opcion-${opcion.id}`)
      if (el) {
        el.classList.add('error-shake')
        setTimeout(() => el.classList.remove('error-shake'), 400)
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
          actividad_id: 'letras_vocabulario',
          completado: true,
          estrellas: 3
        }
      ])
    if (error) console.error("Error guardando progreso:", error)
    setGuardando(false)
  }

  const preguntaActual = preguntasOriginales[indiceActual]

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      background: 'radial-gradient(circle at 50% 50%, #4facfe 0%, #00f2fe 100%)',
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

        .tarjeta-letra {
          width: 140px;
          height: 140px;
          border-radius: 35px;
          background: white;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tarjeta-letra:active {
          transform: translateY(8px) scale(0.95);
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
          backgroundColor: '#FFFFFF', color: '#0083B0', 
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
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            padding: '12px 30px',
            borderRadius: '25px',
            backdropFilter: 'blur(10px)',
            marginBottom: '25px',
            border: '3px solid rgba(255, 255, 255, 0.5)',
            textAlign: 'center',
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ color: 'white', fontSize: '1.8rem', margin: 0, textShadow: '0px 2px 5px rgba(0,0,0,0.2)' }}>
              ¿Cuál es la letra de <span style={{ fontSize: '2.2rem' }}>{preguntaActual.emoji}</span>?
            </h2>
          </div>

          {/* Tarjeta central con la palabra y emoji */}
          <div style={{
            backgroundColor: 'white',
            width: '180px',
            height: '180px',
            borderRadius: '45px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 15px 35px rgba(0,0,0,0.2)',
            border: '5px solid white',
            marginBottom: '35px'
          }}>
            <span style={{ fontSize: '75px', lineHeight: 1 }}>{preguntaActual.emoji}</span>
            <span style={{ fontSize: '1.3rem', fontWeight: '700', color: '#444', marginTop: '8px' }}>{preguntaActual.palabra}</span>
          </div>

          {/* Opciones de respuesta */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {opciones.map((opcion) => (
              <div 
                key={opcion.id}
                id={`opcion-${opcion.id}`}
                className="tarjeta-letra"
                onClick={() => manejarSeleccion(opcion)}
                style={{
                  backgroundColor: opcion.color,
                  boxShadow: `inset 0px 5px 0px rgba(255,255,255,0.6), 0px 8px 0px ${opcion.sombra}, 0px 12px 15px rgba(0,0,0,0.2)`,
                  border: '4px solid white'
                }}
              >
                <span style={{ fontSize: '4rem', color: 'white', fontWeight: '700', textShadow: '0 3px 5px rgba(0,0,0,0.2)' }}>
                  {opcion.letra}
                </span>
              </div>
            ))}
          </div>

          {/* Indicador de progreso */}
          <p style={{ color: 'white', marginTop: '30px', fontSize: '1.1rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Pregunta {indiceActual + 1} de {preguntasOriginales.length} 🌟
          </p>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
          <div style={{ fontSize: '100px', animation: 'latidoEstelar 1.5s infinite' }}>
            🏆🔤✨
          </div>
          <h1 style={{ color: 'white', fontSize: '3.5rem', margin: 0, textShadow: '0 5px 0 #005580' }}>
            ¡Fantástico!
          </h1>
          <p style={{ color: 'white', fontSize: '1.5rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            ¡Has completado el juego de letras con éxito!
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
