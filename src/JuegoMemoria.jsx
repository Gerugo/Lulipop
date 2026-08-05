import React, { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

export default function JuegoMemoria({ perfil, onVolver }) {
  const [cartas, setCartas] = useState([])
  const [volteadas, setVolteadas] = useState([]) // Índices de las cartas actualmente giradas
  const [emparejadas, setEmparejadas] = useState([]) // IDs de las cartas ya resueltas
  const [bloqueado, setBloqueado] = useState(false) // Evita que se toquen más cartas durante la animación
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [movimientos, setMovimientos] = useState(0)

  // Usamos import.meta.env.BASE_URL para que las imágenes carguen bien en GitHub Pages
  const baseUrl = import.meta.env.BASE_URL
  
  const itemsDisponibles = [
    { id: 'manzana', src: `${baseUrl}assets/manzana.png`, fallback: '🍎' },
    { id: 'estrella', src: `${baseUrl}assets/estrella.png`, fallback: '⭐️' },
    { id: 'globo', src: `${baseUrl}assets/globo.png`, fallback: '🎈' },
    { id: 'pez', src: `${baseUrl}assets/pez.png`, fallback: '🐟' },
    { id: 'gato', src: `${baseUrl}assets/gato.png`, fallback: '🐱' },
    { id: 'platano', src: `${baseUrl}assets/platano.png`, fallback: '🍌' },
    { id: 'dino', src: `${baseUrl}assets/dino.png`, fallback: '🦖' },
    { id: 'mascota', src: `${baseUrl}assets/mascota.png`, fallback: '🍭' }
  ]

  useEffect(() => {
    iniciarJuego()
  }, [])

  const iniciarJuego = () => {
    // Seleccionamos 6 parejas al azar (12 cartas en total) para un tablero de 3x4
    const seleccionados = itemsDisponibles.sort(() => Math.random() - 0.5).slice(0, 6)
    
    // Duplicamos para hacer las parejas y barajamos
    const barajadas = [...seleccionados, ...seleccionados]
      .sort(() => Math.random() - 0.5)
      .map((item, index) => ({ ...item, uuid: index })) // Añadimos un ID único a cada carta
      
    setCartas(barajadas)
    setVolteadas([])
    setEmparejadas([])
    setVictoria(false)
    setMovimientos(0)
  }

  const manejarClickCarta = (index) => {
    // Si el tablero está bloqueado, o la carta ya está volteada o emparejada, ignoramos el clic
    if (bloqueado || volteadas.includes(index) || emparejadas.includes(cartas[index].id)) return

    const nuevasVolteadas = [...volteadas, index]
    setVolteadas(nuevasVolteadas)

    if (nuevasVolteadas.length === 2) {
      setBloqueado(true)
      setMovimientos(prev => prev + 1)
      const carta1 = cartas[nuevasVolteadas[0]]
      const carta2 = cartas[nuevasVolteadas[1]]

      if (carta1.id === carta2.id) {
        // ¡Pareja encontrada!
        setTimeout(() => {
          setEmparejadas(prev => {
            const nuevasEmparejadas = [...prev, carta1.id]
            // Comprobar victoria
            if (nuevasEmparejadas.length === cartas.length / 2) {
              setTimeout(() => {
                setVictoria(true)
                guardarProgreso()
              }, 600) // Pequeña pausa dramática antes de la victoria
            }
            return nuevasEmparejadas
          })
          setVolteadas([])
          setBloqueado(false)
        }, 800) // Tiempo que se muestran antes de fijarse
      } else {
        // Fallo: volver a girarlas
        setTimeout(() => {
          setVolteadas([])
          setBloqueado(false)
        }, 1200) // Tiempo que se muestran antes de ocultarse
      }
    }
  }

  const guardarProgreso = async () => {
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_memoria', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  return (
    <div style={{ 
      minHeight: '100vh', width: '100vw',
      backgroundImage: `url(${fondoImg})`, backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', padding: '25px', boxSizing: 'border-box'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        
        @keyframes brilloVictoria {
          0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5)); }
          50% { transform: scale(1.1); filter: drop-shadow(0 0 30px rgba(255, 215, 0, 0.9)); }
          100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5)); }
        }

        /* --- Magia 3D para las Cartas --- */
        .escena-carta {
          perspective: 1000px;
          width: 75px;
          height: 75px;
          cursor: pointer;
        }

        @media (min-width: 400px) {
          .escena-carta { width: 85px; height: 85px; }
        }

        .carta-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.5s cubic-bezier(0.4, 0.2, 0.2, 1);
          transform-style: preserve-3d;
        }

        /* Cuando está volteada o emparejada, rotamos el contenedor interno 180 grados */
        .carta-girada .carta-inner {
          transform: rotateY(180deg);
        }

        /* Caras de la carta (Oculta y Descubierta) */
        .cara-oculta, .cara-descubierta {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden; /* Oculta la parte trasera cuando gira */
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 15px rgba(0,0,0,0.15);
        }

        /* La parte de atrás de la carta (la que vemos al principio) */
        .cara-oculta {
          background: linear-gradient(135deg, #a6c1ee 0%, #fbc2eb 100%);
          border: 3px solid white;
          transform: rotateY(0deg); /* Posición inicial */
        }
        
        /* El diseño de Lulipop en la parte de atrás */
        .cara-oculta::after {
          content: '🍭';
          font-size: 35px;
          opacity: 0.8;
        }

        /* La parte de adelante de la carta (con la imagen) */
        .cara-descubierta {
          background: white;
          border: 4px solid #FFD166;
          transform: rotateY(180deg); /* Empieza de espaldas */
        }

        .imagen-carta {
          width: 70%;
          height: 70%;
          object-fit: contain;
          filter: drop-shadow(0 5px 8px rgba(0,0,0,0.15));
        }

        /* Efecto cuando la carta ya está emparejada (se apaga un poco) */
        .carta-emparejada .carta-inner {
          transform: rotateY(180deg) scale(0.95);
          opacity: 0.8;
          transition: transform 0.3s, opacity 0.5s;
        }
      `}</style>

      {}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
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
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '8px 20px', borderRadius: '20px',
          backdropFilter: 'blur(10px)', border: '2px solid white', fontWeight: '700', color: '#555',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}>
          Movimientos: {movimientos}
        </div>
      </div>

      {}
      {!victoria ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '500px', zIndex: 20 }}>
          
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)', padding: '15px 30px', borderRadius: '28px',
            backdropFilter: 'blur(12px)', marginBottom: '25px', border: '4px solid white',
            boxShadow: '0 15px 35px rgba(0,0,0,0.15)', textAlign: 'center'
          }}>
            <h2 style={{ color: '#2D3748', fontSize: '1.5rem', margin: 0 }}>¡Encuentra las parejas!</h2>
          </div>

          {/* Tablero Glassmorphism */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.4)', padding: '25px', borderRadius: '35px',
            backdropFilter: 'blur(12px)', border: '5px solid rgba(255,255,255,0.7)',
            boxShadow: 'inset 0 10px 20px rgba(255,255,255,0.5), 0 20px 40px rgba(0,0,0,0.15)',
            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px',
            justifyItems: 'center'
          }}>
            {cartas.map((carta, index) => {
              const estaVolteada = volteadas.includes(index)
              const estaEmparejada = emparejadas.includes(carta.id)
              
              return (
                <div 
                  key={carta.uuid} 
                  className={`escena-carta ${estaVolteada || estaEmparejada ? 'carta-girada' : ''} ${estaEmparejada ? 'carta-emparejada' : ''}`}
                  onClick={() => manejarClickCarta(index)}
                >
                  <div className="carta-inner">
                    <div className="cara-oculta"></div>
                    <div className="cara-descubierta">
                      <img 
                        src={carta.src} 
                        alt={carta.id} 
                        className="imagen-carta"
                        // Salvavidas por si falla la imagen
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextSibling.style.display = 'block';
                        }}
                      />
                      <span style={{ display: 'none', fontSize: '40px' }}>{carta.fallback}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px', zIndex: 20 }}>
          <div style={{ fontSize: '110px', animation: 'brilloVictoria 2s infinite ease-in-out' }}>🏆✨</div>
          <h1 style={{ color: 'white', fontSize: '3.5rem', margin: '10px 0 0 0', textShadow: '0 5px 15px rgba(0,0,0,0.3)' }}>
            ¡Memoria de Elefante! 🐘
          </h1>
          <p style={{ color: 'white', fontSize: '1.4rem', margin: 0, textShadow: '0 2px 6px rgba(0,0,0,0.3)', backgroundColor: 'rgba(0,0,0,0.2)', padding: '10px 20px', borderRadius: '20px' }}>
            Completado en <b>{movimientos}</b> movimientos.
          </p>
          <button 
            onClick={onVolver}
            style={{ 
              marginTop: '25px', padding: '18px 45px', fontSize: '1.5rem', 
              background: 'linear-gradient(135deg, #48BB78, #38A169)', color: 'white', border: 'none', 
              borderRadius: '35px', cursor: 'pointer',
              boxShadow: '0 15px 25px rgba(72, 187, 120, 0.4), inset 0 5px 0 rgba(255,255,255,0.3)',
              fontFamily: '"Fredoka", sans-serif', fontWeight: '700'
            }}
          >
            {guardando ? 'Guardando...' : '¡Increíble! 🚀'}
          </button>
        </div>
      )}

      <div style={{ height: '20px' }} />
    </div>
  )
}
