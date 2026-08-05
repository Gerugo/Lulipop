import React, { useState, useRef } from 'react'
import { supabase } from './supabaseClient'

export default function JuegoTrazo({ perfil, onVolver }) {
  const [palabra, setPalabra] = useState('hola') // Palabra por defecto
  const [progresoTrazo, setProgresoTrazo] = useState(0) // % completado
  const [completado, setCompletado] = useState(false)
  const [guardando, setGuardando] = useState(false)
  
  // Estados para el modo personalizado
  const [modoEdicion, setModoEdicion] = useState(false)
  const [inputPalabra, setInputPalabra] = useState('')
  const [isDragging, setIsDragging] = useState(false)

  const contenedorRef = useRef(null)

  // 1. MECÁNICA ANTI-TRAMPAS: Solo avanza si arrastras SOBRE la palabra de izquierda a derecha
  const manejarPuntero = (e) => {
    if (!isDragging || completado) return

    const rect = contenedorRef.current.getBoundingClientRect()
    // Calcular posición X del dedo relativa a la palabra
    const xRelativo = e.clientX - rect.left
    const porcentaje = (xRelativo / rect.width) * 100

    // Solo avanza si va hacia adelante (y limitamos a 100%)
    setProgresoTrazo(prev => {
      const nuevoProgreso = Math.max(prev, Math.min(porcentaje, 100))
      
      // Si llega al final (95% para tener margen de error en pantallas táctiles)
      if (nuevoProgreso >= 95 && !completado) {
        setCompletado(true)
        guardarProgreso()
        return 100
      }
      return nuevoProgreso
    })
  }

  const guardarProgreso = async () => {
    setGuardando(true)
    await supabase.from('progreso_actividades').insert([
      { perfil_id: perfil.id, padre_id: perfil.padre_id, actividad_id: 'juego_trazo', completado: true, estrellas: 3 }
    ])
    setGuardando(false)
  }

  const iniciarNuevaPalabra = (e) => {
    e.preventDefault()
    if (inputPalabra.trim() === '') return
    setPalabra(inputPalabra.trim().toLowerCase())
    setProgresoTrazo(0)
    setCompletado(false)
    setModoEdicion(false)
    setInputPalabra('')
  }

  // Cálculo dinámico del tamaño de fuente para que palabras largas quepan en pantalla
  const calcularTamañoFuente = () => {
    const longitud = palabra.length
    if (longitud <= 3) return '200px'
    if (longitud <= 5) return '150px'
    if (longitud <= 8) return '100px'
    return '70px'
  }

  return (
    <div 
      style={{ 
        minHeight: '100vh', width: '100vw',
        background: 'radial-gradient(circle at 50% 30%, #2B1B8A 0%, #0B0428 80%, #050114 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
        overflow: 'hidden', userSelect: 'none'
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap');
        
        @keyframes parpadeoEstrella {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 10px white; }
        }
        @keyframes flotarLento {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(2deg); }
        }
        
        .texto-magico-base {
          font-weight: 700;
          line-height: 1;
          letter-spacing: 5px;
        }

        .texto-fondo {
          color: transparent;
          -webkit-text-stroke: 4px rgba(255, 255, 255, 0.2);
          border-style: dashed;
        }

        .texto-relleno {
          background: repeating-linear-gradient(
            45deg,
            #FF3366, #FF3366 20px,
            #FFD166 20px, #FFD166 40px,
            #06D6A0 40px, #06D6A0 60px,
            #118AB2 60px, #118AB2 80px
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.4));
        }
      `}</style>

      {/* Estrellas de fondo a prueba de errores de compilación usando sumas de texto */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute', 
          top: ((i * 17) % 100) + '%', 
          left: ((i * 23) % 100) + '%',
          width: ((i % 5) + 3) + 'px', 
          height: ((i % 5) + 3) + 'px',
          backgroundColor: 'white', borderRadius: '50%',
          animation: 'parpadeoEstrella ' + ((i % 3) + 2) + 's infinite'
        }} />
      ))}

      <div style={{ position: 'absolute', top: '15%', left: '10%', width: '80px', height: '80px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #FF3366, #900C3F)', boxShadow: 'inset -10px -10px 20px rgba(0,0,0,0.5)', animation: 'flotarLento 6s infinite ease-in-out' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #FFD166, #FF9900)', boxShadow: 'inset -15px -15px 25px rgba(0,0,0,0.5)', animation: 'flotarLento 8s infinite ease-in-out reverse' }} />

      <button onClick={onVolver} style={{ position: 'absolute', top: '30px', left: '30px', width: '55px', height: '55px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, backdropFilter: 'blur(10px)' }}>❮</button>
      
      {}
      {!modoEdicion && (
        <button onClick={() => setModoEdicion(true)} style={{ position: 'absolute', top: '30px', right: '30px', padding: '12px 25px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.15)', color: 'white', border: '2px solid rgba(255,255,255,0.3)', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', zIndex: 30, backdropFilter: 'blur(10px)', display: 'flex', gap: '10px' }}>
          ✏️ Escribir Palabra
        </button>
      )}

      {modoEdicion ? (
        <form onSubmit={iniciarNuevaPalabra} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '40px', borderRadius: '30px', backdropFilter: 'blur(15px)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 20 }}>
          <h2 style={{ color: 'white', marginTop: 0, fontSize: '2rem' }}>¿Qué trazamos hoy?</h2>
          <input 
            type="text" 
            value={inputPalabra} 
            onChange={(e) => setInputPalabra(e.target.value)} 
            placeholder="Ej: mama, papa, sol" 
            maxLength={10}
            autoFocus
            style={{ padding: '15px 25px', fontSize: '1.5rem', borderRadius: '20px', border: 'none', textAlign: 'center', marginBottom: '20px', width: '100%', maxWidth: '300px', fontFamily: '"Fredoka", sans-serif' }}
          />
          <div style={{ display: 'flex', gap: '15px' }}>
            <button type="button" onClick={() => setModoEdicion(false)} style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '20px', border: 'none', backgroundColor: '#e2e8f0', color: '#4a5568', cursor: 'pointer', fontWeight: '700' }}>Cancelar</button>
            <button type="submit" style={{ padding: '15px 30px', fontSize: '1.2rem', borderRadius: '20px', border: 'none', background: 'linear-gradient(135deg, #06D6A0, #118AB2)', color: 'white', cursor: 'pointer', fontWeight: '700', boxShadow: '0 5px 15px rgba(6, 214, 160, 0.4)' }}>¡Trazar! ✨</button>
          </div>
        </form>
      ) : !completado ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: '10px 40px', borderRadius: '30px', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', marginBottom: '40px' }}>
            <h2 style={{ color: 'white', fontSize: '2rem', margin: 0, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>¡Sigue el camino! 🚀</h2>
          </div>

          {/* CONTENEDOR INTERACTIVO: El secreto de la detección */}
          <div 
            ref={contenedorRef}
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={() => setIsDragging(false)}
            onPointerLeave={() => setIsDragging(false)}
            onPointerMove={manejarPuntero}
            style={{ 
              position: 'relative', 
              display: 'inline-block',
              cursor: 'crosshair',
              touchAction: 'none', // Evita que la pantalla haga scroll al deslizar el dedo
              padding: '20px' // Margen de seguridad para el dedo
            }}
          >
            {/* Capa 1: Palabra gris punteada (Base) */}
            <div className="texto-magico-base texto-fondo" style={{ fontSize: calcularTamañoFuente() }}>
              {palabra}
            </div>
            
            {/* Capa 2: Palabra coloreada (Se revela según el progreso) - A prueba de errores */}
            <div style={{ 
              position: 'absolute', top: '20px', left: '20px', height: '100%',
              width: progresoTrazo + '%', 
              overflow: 'hidden', 
              whiteSpace: 'nowrap',
              pointerEvents: 'none' // Para que no interfiera con el arrastre
            }}>
              <div className="texto-magico-base texto-relleno" style={{ fontSize: calcularTamañoFuente() }}>
                {palabra}
              </div>
            </div>

            {/* Guía visual (Dedo indicador) */}
            {progresoTrazo === 0 && (
              <div style={{ position: 'absolute', bottom: '10%', left: '0', fontSize: '50px', animation: 'flotarLento 2s infinite ease-in-out', pointerEvents: 'none', zIndex: 10 }}>👆</div>
            )}
          </div>
          
          <div style={{ width: '300px', height: '12px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', marginTop: '30px', overflow: 'hidden' }}>
            <div style={{ width: progresoTrazo + '%', height: '100%', backgroundColor: '#06D6A0', boxShadow: '0 0 10px #06D6A0', transition: 'width 0.1s' }} />
          </div>
          
          <p style={{ color: 'rgba(255,255,255,0.6)', marginTop: '15px', fontWeight: '600' }}>Arrastra el dedo de izquierda a derecha</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', zIndex: 20 }}>
          <div style={{ fontSize: calcularTamañoFuente() }} className="texto-magico-base texto-relleno">
            {palabra}
          </div>
          <h1 style={{ color: 'white', fontSize: '3rem', margin: '20px 0', textShadow: '0 0 20px rgba(255, 255, 255, 0.5)', animation: 'flotarLento 2s infinite ease-in-out' }}>¡Maravilloso!</h1>
          <button onClick={() => { setCompletado(false); setProgresoTrazo(0); }} style={{ marginTop: '20px', padding: '20px 50px', fontSize: '1.8rem', background: 'linear-gradient(135deg, #06D6A0, #118AB2)', color: 'white', border: 'none', borderRadius: '40px', cursor: 'pointer', fontWeight: '700', boxShadow: '0 10px 25px rgba(6, 214, 160, 0.4)' }}>
            {guardando ? 'Guardando...' : 'Otra vez 🔄'}
          </button>
        </div>
      )}
    </div>
  )
}
