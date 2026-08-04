import React, { useState } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoNumeros({ perfil, onVolver }) {
  const [nivel, setNivel] = useState(1)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Retos de conteo con elementos visuales modernos
  const retos = [
    { id: 1, cantidad: 3, emoji: '🍎', opciones: [2, 3, 5], correcto: 3, titulo: '¿Cuántas manzanas hay?' },
    { id: 2, cantidad: 4, emoji: '⭐️', opciones: [4, 6, 2], correcto: 4, titulo: '¿Cuántas estrellas brillan?' },
    { id: 3, cantidad: 5, emoji: '🎈', opciones: [3, 5, 7], correcto: 5, titulo: '¿Cuántos globos vuelan?' }
  ]

  const retoActual = retos[nivel - 1]

  const verificarRespuesta = (opcion) => {
    setSeleccionado(opcion)
    if (opcion === retoActual.correcto) {
      setMensaje('¡Impresionante! 🎉')
      setTimeout(() => {
        setSeleccionado(null)
        setMensaje('')
        if (nivel < retos.length) {
          setNivel(prev => prev + 1)
        } else {
          setVictoria(true)
          guardarProgreso()
        }
      }, 1000)
    } else {
      setMensaje('¡Inténtalo otra vez! 💪')
      setTimeout(() => {
        setSeleccionado(null)
        setMensaje('')
      }, 1000)
    }
  }

  const guardarProgreso = async () => {
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_numeros', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', width: '100vw',
      background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', padding: '20px', boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        @keyframes flotarElemento {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(3deg); }
        }
        @keyframes latido {
          0% { transform: scale(1); }
          50% { transform: scale(1.08); }
          100% { transform: scale(1); }
        }
        .btn-opcion {
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
        .btn-opcion:active {
          transform: translateY(6px) scale(0.95);
        }
      `}</style>

      {/* Botón de volver */}
      <button 
        onClick={onVolver}
        style={{ 
          position: 'absolute', top: '25px', left: '25px', width: '50px', height: '50px', borderRadius: '16px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', fontSize: '20px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}
      >
        ❮
      </button>

      {!victoria ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px' }}>
          
          {/* Tarjeta de Pregunta */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            padding: '15px 30px',
            borderRadius: '28px',
            backdropFilter: 'blur(10px)',
            marginBottom: '25px',
            border: '4px solid white',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#333', fontSize: '1.5rem', margin: 0 }}>{retoActual.titulo}</h2>
          </div>

          {/* Lienzo de objetos flotantes modernos */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            width: '100%',
            maxWidth: '380px',
            height: '200px',
            borderRadius: '35px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '20px',
            padding: '20px',
            boxSizing: 'border-box',
            boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.05), 0 15px 35px rgba(0,0,0,0.15)',
            border: '5px solid white',
            marginBottom: '30px'
          }}>
            {Array.from({ length: retoActual.cantidad }).map((_, i) => (
              <span key={i} style={{ 
                fontSize: '55px', 
                animation: `flotarElemento ${2 + (i % 2)}s ease-in-out infinite`,
                filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.15))'
              }}>
                {retoActual.emoji}
              </span>
            ))}
          </div>

          {/* Mensaje de feedback */}
          {mensaje && (
            <div style={{ 
              marginBottom: '20px', backgroundColor: '#FFFFFF', padding: '10px 25px', borderRadius: '20px',
              fontWeight: '700', fontSize: '1.2rem', color: mensaje.includes('Impresionante') ? '#2E7D32' : '#C62828',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)', animation: 'latido 0.3s infinite alternate'
            }}>
              {mensaje}
            </div>
          )}

          {/* Opciones de respuesta 3D */}
          <div style={{ display: 'flex', gap: '20px' }}>
            {retoActual.opciones.map((opcion) => (
              <button 
                key={opcion}
                className="btn-opcion"
                onClick={() => verificarRespuesta(opcion)}
                style={{
                  backgroundColor: seleccionado === opcion ? (opcion === retoActual.correcto ? '#4CAF50' : '#F4433E') : '#FFFFFF',
                  color: seleccionado === opcion ? '#FFFFFF' : '#333'
                }}
              >
                {opcion}
              </button>
            ))}
          </div>

          <p style={{ color: 'white', marginTop: '30px', fontSize: '1.1rem', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            Reto {nivel} de {retos.length} 🌟
          </p>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
          <div style={{ fontSize: '90px', animation: 'latido 1.2s infinite' }}>🏆✨</div>
          <h1 style={{ color: 'white', fontSize: '3rem', margin: 0, textShadow: '0 5px 0 #D9534F' }}>
            ¡Genial Conteo!
          </h1>
          <p style={{ color: 'white', fontSize: '1.4rem', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
            ¡Has contado todos los elementos a la perfección!
          </p>
          <button 
            onClick={onVolver}
            style={{ 
              marginTop: '20px', padding: '18px 45px', fontSize: '1.5rem', 
              backgroundColor: '#4CAF50', color: 'white', border: 'none', 
              borderRadius: '35px', cursor: 'pointer',
              boxShadow: 'inset 0px 5px 0px #81C784, 0px 8px 0px #2E7D32, 0px 15px 20px rgba(0,0,0,0.2)',
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
