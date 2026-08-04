import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoLetras({ perfil, onVolver }) {
  const [nivel, setNivel] = useState(0)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const palabras = [
    { letra: 'A', palabra: 'Avión', emoji: '✈️', opciones: ['A', 'E', 'O'], color: '#FF5E62' },
    { letra: 'E', palabra: 'Elefante', emoji: '🐘', opciones: ['I', 'E', 'U'], color: '#33CCFF' },
    { letra: 'I', palabra: 'Iglú', emoji: '❄️', opciones: ['A', 'I', 'O'], color: '#FFD166' },
    { letra: 'O', palabra: 'Oso', emoji: '🐻', opciones: ['O', 'E', 'A'], color: '#FF9966' },
    { letra: 'U', palabra: 'Uvas', emoji: '🍇', opciones: ['U', 'I', 'E'], color: '#9b5de5' }
  ]

  const actual = palabras[nivel]

  const verificar = (letraElegida) => {
    setSeleccionado(letraElegida)
    if (letraElegida === actual.letra) {
      setMensaje('¡Correcto! 🌟')
      setTimeout(() => {
        setSeleccionado(null)
        setMensaje('')
        if (nivel + 1 < palabras.length) {
          setNivel(prev => prev + 1)
        } else {
          setVictoria(true)
          guardarProgreso()
        }
      }, 1000)
    } else {
      setMensaje('¡Casi, prueba otra! 💪')
      setTimeout(() => {
        setSeleccionado(null)
        setMensaje('')
      }, 1000)
    }
  }

  const guardarProgreso = async () => {
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'letras_vocabulario', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', width: '100vw',
      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', padding: '20px', boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        @keyframes reboteSuave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes latido {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .btn-letra {
          background: #FFFFFF;
          border: none;
          width: 90px; height: 90px;
          border-radius: 28px;
          font-size: 2.2rem;
          font-weight: 700;
          color: #333;
          cursor: pointer;
          box-shadow: inset 0px 4px 0px rgba(255,255,255,0.9), 0px 10px 25px rgba(0,0,0,0.15);
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-letra:active {
          transform: translateY(6px) scale(0.95);
        }
      `}</style>

      {/* Botón de volver */}
      <button 
        onClick={onVolver}
        style={{ 
          position: 'absolute', top: '25px', left: '25px', width: '50px', height: '50px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#0083B0', border: 'none', fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}
      >
        ❮
      </button>

      {!victoria ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
          
          {/* Tarjeta de Pregunta con Emoji flotante */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            padding: '25px 35px',
            borderRadius: '35px',
            backdropFilter: 'blur(10px)',
            marginBottom: '25px',
            border: '4px solid white',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '75px', animation: 'reboteSuave 2s ease-in-out infinite', filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.15))' }}>
              {actual.emoji}
            </span>
            <h2 style={{ color: '#333', fontSize: '1.6rem', margin: 0 }}>
              ¿Con qué letra empieza <span style={{ color: actual.color }}>{actual.palabra}</span>?
            </h2>
          </div>

          {/* Mensaje de feedback */}
          {mensaje && (
            <div style={{ 
              marginBottom: '20px', backgroundColor: '#FFFFFF', padding: '10px 25px', borderRadius: '20px',
              fontWeight: '700', fontSize: '1.2rem', color: mensaje.includes('Correcto') ? '#2E7D32' : '#C62828',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)', animation: 'latido 0.3s infinite alternate'
            }}>
              {mensaje}
            </div>
          )}

          {/* Opciones de letras 3D */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {actual.opciones.map((letra) => (
              <button 
                key={letra}
                className="btn-letra"
                onClick={() => verificar(letra)}
                style={{
                  backgroundColor: seleccionado === letra ? (letra === actual.letra ? '#4CAF50' : '#F4433E') : '#FFFFFF',
                  color: seleccionado === letra ? '#FFFFFF' : '#333'
                }}
              >
                {letra}
              </button>
            ))}
          </div>

          <p style={{ color: 'white', marginTop: '30px', fontSize: '1.1rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Letra {nivel + 1} de {palabras.length} 🌟
          </p>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
          <div style={{ fontSize: '90px', animation: 'latido 1.2s infinite' }}>🏆✨</div>
          <h1 style={{ color: 'white', fontSize: '3rem', margin: 0, textShadow: '0 5px 0 #0083B0' }}>
            ¡Fantástico!
          </h1>
          <p style={{ color: 'white', fontSize: '1.4rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            ¡Has completado el juego de letras con éxito!
          </p>
          <button 
            onClick={onVolver}
            style={{ 
              marginTop: '20px', padding: '18px 45px', fontSize: '1.5rem', 
              backgroundColor: '#00CC66', color: 'white', border: 'none', 
              borderRadius: '35px', cursor: 'pointer',
              boxShadow: 'inset 0px 5px 0px #66FFB2, 0px 8px 0px #00994C, 0px 15px 20px rgba(0,0,0,0.2)',
              fontFamily: '"Fredoka", sans-serif'
            }}
          >
            {guardando ? 'Guardando...' : '¡Continuar! 🚀'}
          </button>
        </div>
      )}
    </div>
  )
}
