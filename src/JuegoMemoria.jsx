import React, { useState, useEffect } from 'react'
import fondoImg from './fondo-lulipop.png'

export default function JuegoMemoria({ perfil, onVolver }) {
  // Magia de Vite para GitHub Pages: Asegura que la ruta base sea correcta en producción
  const baseUrl = import.meta.env.BASE_URL

  // Construimos las rutas usando el baseUrl
  const IMAGENES_CARTAS = [
    `${baseUrl}assets/dino.png`,
    `${baseUrl}assets/estrella.png`,
    `${baseUrl}assets/gato.png`,
    `${baseUrl}assets/globo.png`,
    `${baseUrl}assets/manzana.png`,
    `${baseUrl}assets/pez.png`
  ]

  const [baraja, setBaraja] = useState([])
  const [cartasVolteadas, setCartasVolteadas] = useState([])
  const [parejasEncontradas, setParejasEncontradas] = useState([])
  const [bloqueado, setBloqueado] = useState(false)
  
  const [puntos, setPuntos] = useState(0)
  const [nivelSuperado, setNivelSuperado] = useState(false)
  const [cartasError, setCartasError] = useState([]) 

  useEffect(() => {
    iniciarJuego()
  }, [])

  const iniciarJuego = () => {
    const mazo = [...IMAGENES_CARTAS, ...IMAGENES_CARTAS]
    
    // Barajamos (Algoritmo Fisher-Yates)
    for (let i = mazo.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[mazo[i], mazo[j]] = [mazo[j], mazo[i]]
    }
    
    const barajaLista = mazo.map((img, index) => ({
      id: index,
      img: img
    }))

    setBaraja(barajaLista)
    setCartasVolteadas([])
    setParejasEncontradas([])
    setCartasError([])
    setPuntos(0)
    setNivelSuperado(false)
    setBloqueado(false)
  }

  const updateScore = (nuevosPuntos) => {
    setPuntos(prev => Math.max(0, prev + nuevosPuntos))
    
    const scoreEl = document.getElementById('marcador-puntos-parejas')
    if (scoreEl) {
      if (nuevosPuntos < 0) {
        scoreEl.style.color = '#FF4B4B'
        scoreEl.style.textShadow = '0 4px 0 #C0392B'
        scoreEl.style.transform = 'scale(0.8)'
      } else if (nuevosPuntos > 0) {
        scoreEl.style.color = '#43e97b'
        scoreEl.style.textShadow = '0 4px 0 #27ae60'
        scoreEl.style.transform = 'scale(1.3)'
      }
      setTimeout(() => {
        if (scoreEl) {
          scoreEl.style.color = '#FFD166'
          scoreEl.style.textShadow = '0 4px 0 #CCAC00'
          scoreEl.style.transform = 'scale(1)'
        }
      }, 300)
    }
  }

  const voltearCarta = (index) => {
    if (bloqueado || cartasVolteadas.includes(index) || parejasEncontradas.includes(baraja[index].img)) {
      return
    }

    const nuevasVolteadas = [...cartasVolteadas, index]
    setCartasVolteadas(nuevasVolteadas)

    if (nuevasVolteadas.length === 2) {
      setBloqueado(true)
      const carta1 = baraja[nuevasVolteadas[0]]
      const carta2 = baraja[nuevasVolteadas[1]]

      if (carta1.img === carta2.img) {
        setTimeout(() => {
          setParejasEncontradas(prev => {
            const nuevasParejas = [...prev, carta1.img]
            if (nuevasParejas.length === IMAGENES_CARTAS.length) {
              setTimeout(() => {
                setNivelSuperado(true)
                updateScore(50)
              }, 500)
            }
            return nuevasParejas
          })
          setCartasVolteadas([])
          setBloqueado(false)
          updateScore(15)
        }, 600)
      } else {
        updateScore(-2) 
        setCartasError([...nuevasVolteadas]) 
        
        setTimeout(() => {
          setCartasVolteadas([])
          setCartasError([])
          setBloqueado(false)
        }, 1000) 
      }
    }
  }

  return (
    <div style={{
      minHeight: '100vh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;900&display=swap');
        
        /* 🚀 MOTOR 3D PARA LAS CARTAS */
        .carta-contenedor {
          perspective: 1000px;
          cursor: pointer;
        }
        .carta-inner {
          position: relative;
          width: 100%; height: 100%;
          transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }
        .carta-volteada .carta-inner {
          transform: rotateY(180deg);
        }
        
        /* Caras de la carta */
        .carta-cara {
          position: absolute;
          width: 100%; height: 100%;
          backface-visibility: hidden; /* 🔥 ESTO ARREGLA LA PIRULETA INVERTIDA 🔥 */
          border-radius: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.15);
          display: flex; justify-content: center; align-items: center;
          border: 4px solid white;
        }
        
        /* Parte Trasera (Piruleta) */
        .carta-frente {
          background: linear-gradient(135deg, #B5C6FF 0%, #FFB5E8 100%); 
        }
        
        /* Parte Delantera (La imagen oculta) */
        .carta-dorso {
          background-color: white;
          transform: rotateY(180deg);
        }

        /* Animaciones */
        .anim-victoria { animation: victoria 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes victoria { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        
        .anim-estrella { animation: rotaEstrella 3s linear infinite; }
        @keyframes rotaEstrella { 100% { transform: rotate(360deg); } }

        .carta-acierto { animation: aciertoPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; box-shadow: 0 0 20px 5px rgba(255, 209, 102, 0.8); border-color: #FFD166; }
        @keyframes aciertoPop { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }

        .carta-error { animation: temblor 0.4s ease-in-out; }
        @keyframes temblor {
          0%, 100% { transform: rotateY(180deg) translateX(0); }
          25% { transform: rotateY(180deg) translateX(-8px) rotate(-3deg); }
          75% { transform: rotateY(180deg) translateX(8px) rotate(3deg); }
        }
      `}</style>

      {/* PANTALLA DE VICTORIA */}
      {nivelSuperado && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(10px)',
          zIndex: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="anim-victoria" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="anim-estrella" style={{ fontSize: '100px', filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.2))' }}>🌟</div>
            <h1 style={{
              color: '#FFD166', fontSize: '4.5rem', margin: '10px 0',
              textShadow: '0 6px 0 #CCAC00, 0 10px 20px rgba(0,0,0,0.2)',
              textTransform: 'uppercase', letterSpacing: '2px'
            }}>¡Súper!</h1>
            <p style={{ color: '#4facfe', fontSize: '1.8rem', fontWeight: '900', margin: 0, backgroundColor: 'white', padding: '10px 30px', borderRadius: '30px', boxShadow: '0 5px 0 #cbd5e1' }}>
              +50 puntos
            </p>
            <button onClick={iniciarJuego} style={{
              marginTop: '30px', backgroundColor: '#43e97b', color: 'white', border: 'none',
              padding: '15px 40px', borderRadius: '30px', fontSize: '1.5rem', fontWeight: '900',
              cursor: 'pointer', boxShadow: '0 8px 0 #27ae60'
            }}>Jugar de nuevo</button>
          </div>
        </div>
      )}

      {/* BOTONES SUPERIORES */}
      <div style={{ 
        position: 'absolute', top: '25px', left: '20px', right: '20px', 
        display: 'flex', justifyContent: 'space-between', zIndex: 50 
      }}>
        <button onClick={onVolver} style={{
          width: '55px', height: '55px', borderRadius: '18px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none', 
          fontSize: '24px', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>❮</button>

        <button onClick={iniciarJuego} style={{
          height: '55px', padding: '0 20px', borderRadius: '18px',
          backgroundColor: '#FFFFFF', color: '#333', border: 'none', 
          fontSize: '22px', fontWeight: '900', cursor: 'pointer',
          boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center'
        }}>🧹</button>
      </div>

      {/* MARCADOR DE PUNTOS */}
      <div style={{
        position: 'absolute', top: '25px', left: '50%', transform: 'translateX(-50%)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)', padding: '12px 30px',
        borderRadius: '30px', border: '4px solid white',
        boxShadow: '0 12px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center',
        gap: '12px', zIndex: 20, fontSize: '32px', fontWeight: '900'
      }}>
        ⭐ <span id="marcador-puntos-parejas" style={{ color: '#FFD166', transition: 'all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)', textShadow: '0 4px 0 #CCAC00', minWidth: '80px', textAlign: 'center', display: 'inline-block' }}>{puntos}</span>
      </div>

      {/* TABLERO DE JUEGO */}
      <div style={{
        marginTop: '130px',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        backdropFilter: 'blur(20px)',
        padding: '25px',
        borderRadius: '40px',
        border: '6px solid rgba(255,255,255,0.8)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        
        <h2 style={{ 
          color: '#334155', fontSize: '1.8rem', margin: '0 0 20px 0',
          backgroundColor: 'white', padding: '10px 30px', borderRadius: '25px',
          boxShadow: '0 5px 0 #e2e8f0'
        }}>¡Encuentra las parejas!</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '15px',
          width: '95vw',
          maxWidth: '500px'
        }}>
          {baraja.map((carta, index) => {
            const estaVolteada = cartasVolteadas.includes(index)
            const estaEmparejada = parejasEncontradas.includes(carta.img)
            const tieneError = cartasError.includes(index)
            
            let clasesExtra = ''
            if (estaVolteada || estaEmparejada) clasesExtra += ' carta-volteada'
            
            let claseDorso = 'carta-cara carta-dorso'
            if (estaEmparejada) claseDorso += ' carta-acierto'
            if (tieneError) claseDorso += ' carta-error'

            return (
              <div 
                key={index} 
                className={`carta-contenedor ${clasesExtra}`}
                style={{ aspectRatio: '1/1' }} 
                onClick={() => voltearCarta(index)}
              >
                <div className="carta-inner">
                  {/* FRENTE: La piruleta */}
                  <div className="carta-cara carta-frente">
                    <span style={{ fontSize: '35px' }}>🍭</span>
                  </div>
                  
                  {/* DORSO: La imagen cargada correctamente en GitHub Pages */}
                  <div className={claseDorso}>
                    <img 
                      src={carta.img} 
                      alt="Carta" 
                      style={{ width: '65%', height: '65%', objectFit: 'contain' }}
                      draggable="false"
                      onError={(e) => {
                         // Fallback visual en caso de que alguna imagen tarde en cargar
                         e.target.style.display = 'none';
                         e.target.parentElement.innerHTML += '<span style="font-size:40px">❓</span>';
                      }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
