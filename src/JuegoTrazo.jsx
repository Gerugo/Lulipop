import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoTrazo({ perfil, onVolver }) {
  const [completado, setCompletado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [progresoTrazo, setProgresoTrazo] = useState(0) // Simula el % de trazado

  // Efecto para simular el trazado progresivo al mantener pulsado o mover el dedo
  const manejarInteraccion = () => {
    if (progresoTrazo < 100) {
      setProgresoTrazo(prev => Math.min(prev + 5, 100))
    } else if (!completado) {
      setCompletado(true)
      guardarProgreso()
    }
  }

  const guardarProgreso = async () => {
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_trazo', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  return (
    <div 
      onMouseMove={manejarInteraccion}
      onTouchMove={manejarInteraccion}
      style={{ 
        minHeight: '100vh', width: '100vw',
        background: 'radial-gradient(circle at 50% 30%, #2B1B8A 0%, #0B0428 80%, #050114 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
        overflow: 'hidden', userSelect: 'none', touchAction: 'none'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap');
        
        @keyframes orbitar {
          0% { transform: rotate(0deg) translateX(40px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(40px) rotate(-360deg); }
        }
        @keyframes parpadeoEstrella {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 10px white; }
        }
        @keyframes flotarLento {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        
        .letra-textura {
          font-size: 280px;
          font-weight: 700;
          line-height: 1;
          /* Aquí está la magia: Rellenar la letra con un patrón/gradiente */
          background: repeating-linear-gradient(
            45deg,
            #FF3366, #FF3366 20px,
            #FFD166 20px, #FFD166 40px,
            #06D6A0 40px, #06D6A0 60px,
            #118AB2 60px, #118AB2 80px
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 25px rgba(17, 138, 178, 0.6));
          position: relative;
          z-index: 2;
        }

        .guia-trazo {
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          font-size: 280px;
          font-weight: 700;
          color: transparent;
          -webkit-text-stroke: 4px rgba(255, 255, 255, 0.3);
          border-style: dashed;
          z-index: 3;
          pointer-events: none;
        }
      `}</style>

      {}
      {/* Estrellas de fondo generadas dinámicamente con corrección de comillas */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
          width: `${Math.random() * 6 + 2}px`, height: `${Math.random() * 6 + 2}px`,
          backgroundColor: 'white', borderRadius: '50%',
          animation: `parpadeoEstrella ${Math.random() * 3 + 1}s infinite`
        }} />
      ))}

      {/* Planeta decorativo izquierdo */}
      <div style={{
        position: 'absolute', top: '15%', left: '10%',
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #FF3366, #900C3F)',
        boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.5), 0 0 30px rgba(255, 51, 102, 0.4)',
        animation: 'flotarLento 6s infinite ease-in-out'
      }}>
        <div style={{ position: 'absolute', top: '20%', left: '20%', width: '15px', height: '15px', backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: '50%' }} />
      </div>

      {/* Planeta decorativo derecho */}
      <div style={{
        position: 'absolute', bottom: '20%', right: '10%',
        width: '120px', height: '120px', borderRadius: '50%',
        background: 'radial-gradient(circle at 30% 30%, #FFD166, #FF9900)',
        boxShadow: 'inset -15px -15px 25px rgba(0,0,0,0.5), 0 0 40px rgba(255, 209, 102, 0.3)',
        animation: 'flotarLento 8s infinite ease-in-out reverse'
      }}>
        {/* Anillo del planeta */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '180px', height: '40px',
          border: '8px solid rgba(255, 255, 255, 0.6)', borderRadius: '50%',
          transform: 'translate(-50%, -50%) rotate(-20deg)',
          boxShadow: '0 0 15px rgba(255,255,255,0.5)'
        }} />
      </div>

      {/* Botón de volver tipo "glassmorphism" */}
      <button 
        onClick={onVolver}
        style={{ 
          position: 'absolute', top: '30px', left: '30px', width: '55px', height: '55px', borderRadius: '20px',
          backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', 
          fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20,
          backdropFilter: 'blur(10px)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
        }}
      >
        ❮
      </button>

      {}
      {/* Área central de trazado */}
      {!completado ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '10px 40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)', marginBottom: '40px'
          }}>
            <h2 style={{ color: 'white', fontSize: '2rem', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              ¡Traza la letra! ✨
            </h2>
          </div>

          {/* Contenedor de la letra con textura */}
          <div style={{ position: 'relative', cursor: 'crosshair', padding: '20px' }}>
            {/* Letra base colorida */}
            <div className="letra-textura" style={{ opacity: progresoTrazo === 0 ? 0.3 : (progresoTrazo / 100) }}>a</div>
            
            {/* Guía punteada blanca por encima */}
            <div className="guia-trazo">a</div>

            {/* Puntero/Mano animada indicando que dibuje */}
            {progresoTrazo === 0 && (
              <div style={{ 
                position: 'absolute', bottom: '20%', right: '10%', fontSize: '50px',
                animation: 'orbitar 3s infinite linear', filter: 'drop-shadow(0 0 10px white)', zIndex: 10
              }}>
                👆
              </div>
            )}
          </div>
          
          {/* Barra de progreso de trazado */}
          <div style={{ width: '250px', height: '12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', marginTop: '30px', overflow: 'hidden' }}>
            <div style={{ width: `${progresoTrazo}%`, height: '100%', backgroundColor: '#06D6A0', boxShadow: '0 0 10px #06D6A0', transition: 'width 0.1s linear' }} />
          </div>
          
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '15px', fontWeight: '600' }}>
            Desliza el dedo sobre la letra
          </p>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 20 }}>
          <div style={{ fontSize: '120px', filter: 'drop-shadow(0 0 30px #FFD166)', animation: 'flotarLento 2s infinite ease-in-out' }}>🏆</div>
          <h1 style={{ color: 'white', fontSize: '4rem', margin: '10px 0', textShadow: '0 0 20px rgba(255, 255, 255, 0.5)' }}>
            ¡Perfecto!
          </h1>
          <button 
            onClick={onVolver}
            style={{ 
              marginTop: '30px', padding: '20px 50px', fontSize: '1.8rem', 
              background: 'linear-gradient(135deg, #06D6A0, #118AB2)', color: 'white', border: 'none', 
              borderRadius: '40px', cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(6, 214, 160, 0.4), inset 0 4px 0 rgba(255,255,255,0.3)',
              fontFamily: '"Fredoka", sans-serif', fontWeight: '700'
            }}
          >
            {guardando ? 'Guardando...' : '¡Genial! 🚀'}
          </button>
        </div>
      )}
    </div>
  )
}
