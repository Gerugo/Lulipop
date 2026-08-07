import React, { useState, useEffect, useRef } from 'react'
import { supabase } from './supabaseClient'
import fondoImg from './fondo-lulipop.png'

export default function JuegoBurbujas({ perfil, onVolver }) {
  const [burbujas, setBurbujas] = useState([])
  const [puntuacion, setPuntuacion] = useState(0)
  const [victoria, setVictoria] = useState(false)
  const [guardando, setGuardando] = useState(false)
  
  const meta = 15 // Burbujas que hay que explotar para ganar
  const requestRef = useRef()
  const generadorRef = useRef()

  const animales = ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐯', '🦁', '🐸', '🦄', '🐙', '🐢']

  useEffect(() => {
    if (victoria) return

    // Generador de burbujas (crea una nueva cada 800ms)
    generadorRef.current = setInterval(() => {
      crearBurbuja()
    }, 800)

    // Limpieza de burbujas que ya han salido de la pantalla (para no consumir memoria)
    const limpiarFueraDePantalla = () => {
      setBurbujas(prev => prev.filter(b => !b.explotada && b.y > -20))
      requestRef.current = requestAnimationFrame(limpiarFueraDePantalla)
    }
    requestRef.current = requestAnimationFrame(limpiarFueraDePantalla)

    return () => {
      clearInterval(generadorRef.current)
      cancelAnimationFrame(requestRef.current)
    }
  }, [victoria])

  const crearBurbuja = () => {
    const id = Date.now() + Math.random()
    const size = Math.floor(Math.random() * 40) + 80 // Tamaño entre 80px y 120px
    const left = Math.floor(Math.random() * 70) + 10 // Posición X entre 10% y 80%
    const duracion = Math.floor(Math.random() * 3) + 4 // Duración de subida entre 4s y 7s
    const animal = animales[Math.floor(Math.random() * animales.length)]

    setBurbujas(prev => [...prev, { id, size, left, duracion, animal, explotada: false, y: 110 }])
  }

  const explotarBurbuja = (e, id) => {
    e.preventDefault() // Evita comportamientos raros en táctil
    
    setBurbujas(prev => prev.map(b => b.id === id ? { ...b, explotada: true } : b))
    
    setPuntuacion(prev => {
      const nueva = prev + 1
      if (nueva >= meta) {
        setTimeout(() => {
          setVictoria(true)
          guardarProgreso()
        }, 500)
      }
      return nueva
    })
  }

  const guardarProgreso = async () => {
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_burbujas', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  // Calculamos el porcentaje de la barra de progreso
  const porcentajeProgreso = Math.min((puntuacion / meta) * 100, 100)

  return (
    <div style={{ 
      minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', touchAction: 'none' // Clave para juegos táctiles rápidos
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');
        
        /* Animación de la burbuja subiendo y balanceándose */
        @keyframes flotarArriba {
          0% { transform: translateY(110dvh) translateX(0) scale(1); opacity: 0; }
          10% { opacity: 1; }
          50% { transform: translateY(40dvh) translateX(25px) scale(1.05); }
          100% { transform: translateY(-20dvh) translateX(-25px) scale(1); opacity: 1; }
        }

        /* Animación espectacular al explotar */
        @keyframes estallarPop {
          0% { transform: scale(1); opacity: 1; filter: brightness(1); }
          40% { transform: scale(1.4); opacity: 0.8; filter: brightness(1.5); }
          100% { transform: scale(2.5); opacity: 0; filter: brightness(2); display: none; }
        }

        /* Estilo hiperrealista de pompa de jabón */
        .burbuja-jabon {
          position: absolute;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.1) 60%, rgba(255, 255, 255, 0.3) 100%);
          border: 2px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 15px 25px rgba(0,0,0,0.1), inset 0 0 20px rgba(255,255,255,0.8), inset 10px 0 20px rgba(255,192,203,0.3), inset -10px 0 20px rgba(173,216,230,0.3);
          backdrop-filter: blur(3px);
          -webkit-tap-highlight-color: transparent;
        }

        /* El brillito blanco curvo de la burbuja */
        .burbuja-jabon::after {
          content: '';
          position: absolute;
          top: 15%;
          left: 15%;
          width: 30%;
          height: 30%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%);
          transform: rotate(-45deg);
        }

        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
      `}</style>

      {/* HEADER: Botón Volver y Barra de Progreso Dinámica */}
      <div style={{ position: 'absolute', top: '25px', left: '20px', right: '20px', display: 'flex', alignItems: 'center', gap: '15px', zIndex: 50 }}>
        <button 
          onClick={onVolver}
          style={{ 
            width: '55px', height: '55px', borderRadius: '18px', flexShrink: 0,
            backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
            fontSize: '24px', cursor: 'pointer',
            boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          ❮
        </button>

        {!victoria && (
          <div style={{ 
            flex: 1, height: '35px', backgroundColor: 'rgba(255,255,255,0.5)', 
            borderRadius: '20px', border: '4px solid white', overflow: 'hidden',
            boxShadow: 'inset 0 4px 6px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            {/* Relleno de la barra que crece */}
            <div style={{
              width: `${porcentajeProgreso}%`, height: '100%',
              background: 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)',
              transition: 'width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
              borderRadius: '15px'
            }} />
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#1E293B', fontWeight: '900', fontSize: '1.2rem', fontFamily: '"Fredoka", sans-serif',
              textShadow: '0 2px 2px rgba(255,255,255,0.8)'
            }}>
              {puntuacion} / {meta}
            </div>
          </div>
        )}
      </div>

      {/* ZONA DE JUEGO: Renderizado de las burbujas */}
      {!victoria && burbujas.map(burbuja => (
        <div 
          key={burbuja.id}
          className="burbuja-jabon"
          // Usamos onPointerDown en lugar de onClick para que la respuesta sea INSTANTÁNEA al tocar en móviles
          onPointerDown={(e) => !burbuja.explotada && explotarBurbuja(e, burbuja.id)}
          style={{
            left: `${burbuja.left}%`,
            width: `${burbuja.size}px`,
            height: `${burbuja.size}px`,
            // Si explota, cambiamos la animación al efecto POP. Si no, sigue flotando.
            animation: burbuja.explotada 
              ? `estallarPop 0.3s forwards` 
              : `flotarArriba ${burbuja.duracion}s linear forwards`,
            // Congelamos la posición de la burbuja en el sitio exacto donde la tocaron para que la explosión ocurra ahí
            animationPlayState: burbuja.explotada ? 'running' : 'running'
          }}
        >
          {/* El animalito de dentro */}
          <span style={{ 
            fontSize: `${burbuja.size * 0.45}px`, 
            filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.2))',
            pointerEvents: 'none' // Para que el clic vaya siempre a la burbuja
          }}>
            {burbuja.animal}
          </span>
        </div>
      ))}

      {/* PANTALLA DE VICTORIA */}
      {victoria && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(15px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px', boxSizing: 'border-box', overflowY: 'auto'
        }}>
          <div className="anim-victoria" style={{ 
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px', width: '100%', maxWidth: '400px'
          }}>
            <div style={{ fontSize: 'clamp(70px, 20vw, 120px)', lineHeight: '1', filter: 'drop-shadow(0 15px 20px rgba(0,0,0,0.3))' }}>
              🫧
            </div>
            
            <h1 style={{ color: '#4facfe', fontSize: 'clamp(3rem, 12vw, 4.5rem)', margin: '0', lineHeight: '1.1', textShadow: '0 8px 0 #0083B0, 0 15px 25px rgba(0,0,0,0.2)', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '900' }}>
              ¡Rápido!
            </h1>
            
            <p style={{ color: '#FF5E62', fontSize: 'clamp(1.2rem, 5vw, 1.8rem)', fontWeight: '900', margin: '0', backgroundColor: 'white', padding: '15px 25px', borderRadius: '35px', border: '4px solid #FFE4E6', boxShadow: '0 8px 0 #fda4af', width: '100%', boxSizing: 'border-box' }}>
              ¡Salvaste a todos! 🐾
            </p>
            
            <button 
              onClick={onVolver}
              style={{ 
                marginTop: '10px', padding: '15px 40px', fontSize: 'clamp(1.3rem, 5vw, 1.8rem)', fontWeight: '900',
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white', 
                border: '4px solid white', borderRadius: '40px', cursor: 'pointer',
                boxShadow: '0 10px 0 #0083B0, 0 20px 30px rgba(0,0,0,0.25)',
                fontFamily: '"Fredoka", sans-serif', transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'translateY(10px)'}
              onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {guardando ? 'Guardando... ⏳' : '¡Continuar! 🚀'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
