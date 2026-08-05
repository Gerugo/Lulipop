import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

export default function JuegoNumeros({ perfil, onVolver }) {
  const [ronda, setRonda] = useState(1)
  const [retoActual, setRetoActual] = useState(null)
  const [seleccionado, setSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState('')
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)

  // Aquí configuramos tus nuevos gráficos 3D premium
  // Usamos import.meta.env.BASE_URL para que GitHub Pages encuentre la ruta exacta
  const baseUrl = import.meta.env.BASE_URL
  const itemsDisponibles = [
    { id: 'manzana', src: `${baseUrl}assets/manzana.png`, fallback: '🍎' },
    { id: 'estrella', src: `${baseUrl}assets/estrella.png`, fallback: '⭐️' },
    { id: 'globo', src: `${baseUrl}assets/globo.png`, fallback: '🎈' },
    { id: 'pez', src: `${baseUrl}assets/pez.png`, fallback: '🐟' },
    { id: 'gato', src: `${baseUrl}assets/gato.png`, fallback: '🐱' },
    { id: 'platano', src: `${baseUrl}assets/platano.png`, fallback: '🍌' },
    { id: 'dino', src: `${baseUrl}assets/dino.png`, fallback: '🦖' }
  ]

  const totalRondasMaximas = 5

  useEffect(() => {
    generarNuevoReto()
  }, [])

  const generarNuevoReto = () => {
    const cantidad = Math.floor(Math.random() * 5) + 1 // Entre 1 y 5
    const itemAleatorio = itemsDisponibles[Math.floor(Math.random() * itemsDisponibles.length)]
    
    // Generar opciones únicas (sin números repetidos)
    const opcionesSet = new Set([cantidad])
    while (opcionesSet.size < 3) {
      const aleatorio = Math.floor(Math.random() * 5) + 1
      opcionesSet.add(aleatorio)
    }
    const opciones = Array.from(opcionesSet).sort(() => Math.random() - 0.5)

    setRetoActual({
      cantidad,
      item: itemAleatorio,
      opciones,
      correcto: cantidad,
      titulo: '¡Cuenta cuántos hay!'
    })
  }

  const verificarRespuesta = (opcion) => {
    if (seleccionado !== null || victoria) return // Evitar doble clic
    setSeleccionado(opcion)

    if (opcion === retoActual.correcto) {
      setMensaje('¡Increíble! 🎉')
      setTimeout(() => {
        setSeleccionado(null)
        setMensaje('')
        
        setRonda(prevRonda => {
          const siguienteRonda = prevRonda + 1
          if (siguienteRonda <= totalRondasMaximas) {
            generarNuevoReto()
            return siguienteRonda
          } else {
            setVictoria(true)
            guardarProgreso()
            return prevRonda
          }
        })
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
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_numeros', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  if (!retoActual) return null

  return (
    <div style={{ 
      minHeight: '100vh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', padding: '25px', boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        @keyframes flotarElemento {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(4deg); }
        }
        @keyframes brillo {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        .btn-opcion-pro {
          background: linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%);
          border: 4px solid #FFFFFF;
          width: 95px; height: 95px;
          border-radius: 30px;
          font-size: 2.5rem;
          font-weight: 700;
          color: #2D3748;
          cursor: pointer;
          box-shadow: 0 12px 30px rgba(0,0,0,0.15), inset 0 4px 0 rgba(255,255,255,0.9);
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-opcion-pro:active {
          transform: translateY(6px) scale(0.95);
        }
        .grafico-juego {
          width: 65px;
          height: 65px;
          object-fit: contain;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.2));
          animation: flotarElemento 3s ease-in-out infinite;
        }
      `}</style>

      {/* Botón de volver */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-start', zIndex: 20 }}>
        <button 
          onClick={onVolver}
          style={{ 
            width: '50px', height: '50px', borderRadius: '16px',
            backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', fontSize: '20px', cursor: 'pointer',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ❮
        </button>
      </div>

      {!victoria ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px', zIndex: 20 }}>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            padding: '16px 30px',
            borderRadius: '28px',
            backdropFilter: 'blur(12px)',
            marginBottom: '20px',
            border: '4px solid white',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#2D3748', fontSize: '1.5rem', margin: 0 }}>{retoActual.titulo}</h2>
          </div>

          {/* Lienzo central con tus imágenes 3D */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            width: '100%',
            maxWidth: '380px',
            height: '210px',
            borderRadius: '35px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '15px',
            padding: '20px',
            boxSizing: 'border-box',
            backdropFilter: 'blur(10px)',
            boxShadow: 'inset 0 8px 20px rgba(0,0,0,0.05), 0 15px 35px rgba(0,0,0,0.15)',
            border: '5px solid white',
            marginBottom: '25px'
          }}>
            {Array.from({ length: retoActual.cantidad }).map((_, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img 
                  src={retoActual.item.src} 
                  alt={retoActual.item.id}
                  className="grafico-juego"
                  style={{ animationDelay: `${i * 0.2}s` }}
                  // Salvavidas: si la imagen falla, muestra el emoji
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextSibling.style.display = 'block';
                  }}
                />
                <span 
                  style={{ 
                    display: 'none', 
                    fontSize: '55px', 
                    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))',
                    animation: `flotarElemento 3s ease-in-out infinite`,
                    animationDelay: `${i * 0.2}s`
                  }}
                >
                  {retoActual.item.fallback}
                </span>
              </div>
            ))}
          </div>

          {mensaje && (
            <div style={{ 
              marginBottom: '15px', backgroundColor: '#FFFFFF', padding: '10px 25px', borderRadius: '20px',
              fontWeight: '700', fontSize: '1.2rem', color: mensaje.includes('Increíble') ? '#2E7D32' : '#C62828',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)', animation: 'brillo 0.3s infinite alternate'
            }}>
              {mensaje}
            </div>
          )}

          <div style={{ display: 'flex', gap: '20px' }}>
            {retoActual.opciones.map((opcion) => (
              <button 
                key={opcion}
                className="btn-opcion-pro"
                onClick={() => verificarRespuesta(opcion)}
                style={{
                  background: seleccionado === opcion 
                    ? (opcion === retoActual.correcto ? 'linear-gradient(135deg, #48BB78, #38A169)' : 'linear-gradient(135deg, #F56565, #E53E3E)')
                    : 'linear-gradient(135deg, #FFFFFF, #EDF2F7)',
                  color: seleccionado === opcion ? '#FFFFFF' : '#2D3748'
                }}
              >
                {opcion}
              </button>
            ))}
          </div>

          <p style={{ color: 'white', marginTop: '25px', fontSize: '1.1rem', fontWeight: '700', textShadow: '0 2px 6px rgba(0,0,0,0.4)' }}>
            Ronda {ronda} de {totalRondasMaximas} 🌟
          </p>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px', zIndex: 20 }}>
          <div style={{ fontSize: '90px', animation: 'brillo 1.2s infinite' }}>🏆✨</div>
          <h1 style={{ color: 'white', fontSize: '3rem', margin: 0, textShadow: '0 5px 10px rgba(0,0,0,0.3)' }}>
            ¡Excelente Conteo!
          </h1>
          <p style={{ color: 'white', fontSize: '1.4rem', margin: 0, textShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
            ¡Has completado todas las rondas con maestría!
          </p>
          <button 
            onClick={onVolver}
            style={{ 
              marginTop: '20px', padding: '18px 45px', fontSize: '1.5rem', 
              backgroundColor: '#48BB78', color: 'white', border: 'none', 
              borderRadius: '35px', cursor: 'pointer',
              boxShadow: 'inset 0px 5px 0px #68D391, 0px 8px 20px rgba(0,0,0,0.3)',
              fontFamily: '"Fredoka", sans-serif'
            }}
          >
            {guardando ? 'Guardando...' : '¡Continuar! 🚀'}
          </button>
        </div>
      )}
      <div style={{ height: '20px' }} />
    </div>
  )
}
