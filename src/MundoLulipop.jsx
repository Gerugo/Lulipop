import React, { useState, useEffect } from 'react'
import JuegoNumeros from './JuegoNumeros'
import JuegoPuzzles from './JuegoPuzzles'
import JuegoArte from './JuegoArte'
import JuegoLetras from './JuegoLetras'
import JuegoTrazo from './JuegoTrazo'
import AlbumPegatinas from './AlbumPegatinas'
import JuegoMemoria from './JuegoMemoria'
import fondoImg from './fondo-lulipop.png'

export default function MundoLulipop({ perfil, onVolver }) {
  const [juegoActivo, setJuegoActivo] = useState(null)
  const [pegatinasColocadas, setPegatinasColocadas] = useState([])
  const [modoPegatina, setModoPegatina] = useState(null) 

  const baseUrl = import.meta.env.BASE_URL

  useEffect(() => {
    const guardadas = JSON.parse(localStorage.getItem(`colocadas_${perfil.id}`) || '[]')
    setPegatinasColocadas(guardadas)
  }, [perfil.id])

  const manejarClickFondo = (e) => {
    if (!modoPegatina) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const nuevaPegatina = { id: Date.now(), emoji: modoPegatina, x, y }
    const actualizadas = [...pegatinasColocadas, nuevaPegatina]
    setPegatinasColocadas(actualizadas)
    localStorage.setItem(`colocadas_${perfil.id}`, JSON.stringify(actualizadas))
    setModoPegatina(null)
  }

  const eliminarPegatina = (e, id) => {
    e.stopPropagation()
    const actualizadas = pegatinasColocadas.filter(p => p.id !== id)
    setPegatinasColocadas(actualizadas)
    localStorage.setItem(`colocadas_${perfil.id}`, JSON.stringify(actualizadas))
  }

  if (juegoActivo === 'numeros') return <JuegoNumeros perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  if (juegoActivo === 'puzzles') return <JuegoPuzzles perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  if (juegoActivo === 'arte') return <JuegoArte perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  if (juegoActivo === 'letras') return <JuegoLetras perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  if (juegoActivo === 'trazo') return <JuegoTrazo perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  if (juegoActivo === 'album') return <AlbumPegatinas perfil={perfil} onVolver={() => setJuegoActivo(null)} onSeleccionarParaPegar={(emoji) => { setModoPegatina(emoji); setJuegoActivo(null); }} />
  if (juegoActivo === 'memoria') return <JuegoMemoria perfil={perfil} onVolver={() => setJuegoActivo(null)} />

  return (
    <div 
      onClick={manejarClickFondo}
      style={{ 
        minHeight: '100vh', 
        width: '100vw',
        backgroundImage: `url(${fondoImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: '"Fredoka", sans-serif',
        position: 'absolute',
        top: 0, left: 0, zIndex: 10,
        boxSizing: 'border-box',
        padding: '25px',
        overflow: 'hidden',
        cursor: modoPegatina ? 'crosshair' : 'default'
      }}
    >
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        
        /* Animaciones Premium */
        @keyframes entrarRebotandoArriba {
          0% { transform: translateY(-50px); opacity: 0; }
          60% { transform: translateY(10px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes entrarRebotandoAbajo {
          0% { transform: translateY(80px); opacity: 0; }
          70% { transform: translateY(-10px); opacity: 1; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes flotarMascota {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-20px) rotate(3deg); }
        }

        @keyframes floatAvatar {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }

        .animar-cabecera {
          animation: entrarRebotandoArriba 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .animar-dock {
          animation: entrarRebotandoAbajo 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Botones 3D tipo Arcilla */
        .menu-btn-3d {
          width: 70px;
          height: 70px;
          border-radius: 22px;
          font-size: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-btn-3d:active {
          transform: translateY(6px) scale(0.92);
        }
      `}</style>

      {modoPegatina && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%_at_50%_0', transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255, 209, 102, 0.95)', color: '#333', padding: '12px 30px', borderRadius: '30px',
          fontWeight: '700', fontSize: '1.2rem', zIndex: 100, 
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '4px solid white',
          backdropFilter: 'blur(10px)', textAlign: 'center'
        }}>
          ✨ ¡Toca cualquier parte para pegar tu pegatina {modoPegatina}! ✨
        </div>
      )}

      {/* Pegatinas colocadas en pantalla */}
      {pegatinasColocadas.map((p) => (
        <div
          key={p.id}
          onClick={(e) => eliminarPegatina(e, p.id)}
          title="Toca para quitar"
          style={{
            position: 'absolute', left: \`\${p.x - 25}px\`, top: \`\${p.y - 25}px\`,
            fontSize: '50px', cursor: 'pointer', filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.3))',
            zIndex: 15, transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {p.emoji}
        </div>
      ))}

      <div className="animar-cabecera" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          
          {/* Botón Volver Glassmorphism */}
          <button 
            onClick={onVolver}
            style={{ 
              width: '55px', height: '55px', borderRadius: '20px',
              backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#FF5E62', 
              border: '3px solid white', fontSize: '24px', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)'
            }}
          >
            ❮
          </button>

          {/* Botón Álbum Independiente */}
          <button 
            onClick={() => setJuegoActivo('album')}
            style={{ 
              height: '55px', padding: '0 25px', borderRadius: '20px',
              background: 'linear-gradient(135deg, #a6c1ee 0%, #8ca9eb 100%)', color: 'white', 
              border: '3px solid white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(92, 124, 250, 0.3)',
              display: 'flex', alignItems: 'center', gap: '10px',
              fontFamily: '"Fredoka", sans-serif'
            }}
          >
            📖 Álbum
          </button>
        </div>

        {/* Tarjeta Perfil Niño */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '8px 25px', borderRadius: '25px',
          backdropFilter: 'blur(12px)', border: '4px solid white',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '15px'
        }}>
          <span style={{ fontSize: '32px', animation: 'floatAvatar 3s ease-in-out infinite' }}>{perfil.avatar}</span>
          <span style={{ color: '#2D3748', fontSize: '1.5rem', fontWeight: '700' }}>¡Hola, {perfil.nombre}!</span>
        </div>
      </div>

      {/* ESPACIO CENTRAL CON LA MASCOTA FLOTANDO */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10 }}>
        <img 
          src={`${baseUrl}assets/mascota.png`} 
          alt="Lulipop Mascota"
          style={{ 
            width: '260px', 
            height: 'auto',
            animation: 'flotarMascota 5s ease-in-out infinite',
            filter: 'drop-shadow(0 25px 35px rgba(0,0,0,0.3))'
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'block';
          }}
        />
        {/* Salvavidas por si falla la imagen */}
        <span style={{ 
          display: 'none', fontSize: '180px', 
          animation: 'flotarMascota 5s ease-in-out infinite',
          filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))'
        }}>
          🍭
        </span>
      </div>

      {/* BARRA INFERIOR (DOCK) EXCLUSIVA DE MINIJUEGOS */}
      <div className="animar-dock" style={{
        backgroundColor: 'rgba(255, 255, 255, 0.65)',
        padding: '15px 25px',
        borderRadius: '40px',
        backdropFilter: 'blur(15px)',
        border: '5px solid rgba(255,255,255,0.9)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 10px 20px rgba(255,255,255,0.5)',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        marginBottom: '15px',
        flexWrap: 'wrap'
      }}>
        
        {/* Memoria */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('memoria')}
          style={{ backgroundColor: '#FF758C', boxShadow: 'inset 0px 4px 0px #FF96A7, 0px 6px 0px #C73E5B, 0px 10px 15px rgba(0,0,0,0.2)' }}
          title="Memoria"
        >
          🧠
        </div>

        {/* Trazo de Letras */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('trazo')}
          style={{ backgroundColor: '#66a6ff', boxShadow: 'inset 0px 4px 0px #b3d7ff, 0px 6px 0px #005580, 0px 10px 15px rgba(0,0,0,0.2)' }}
          title="Trazo"
        >
          ✍️
        </div>

        {/* Letras / Vocales */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('letras')}
          style={{ backgroundColor: '#4facfe', boxShadow: 'inset 0px 4px 0px #9ee5ff, 0px 6px 0px #0083B0, 0px 10px 15px rgba(0,0,0,0.2)' }}
          title="Letras"
        >
          🔤
        </div>

        {/* Arte */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('arte')}
          style={{ backgroundColor: '#FF6B6B', boxShadow: 'inset 0px 4px 0px #FF9999, 0px 6px 0px #C0392B, 0px 10px 15px rgba(0,0,0,0.2)' }}
          title="Arte"
        >
          🎨
        </div>
        
        {/* Puzzles */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('puzzles')}
          style={{ backgroundColor: '#FF9966', boxShadow: 'inset 0px 4px 0px #FFC299, 0px 6px 0px #D9534F, 0px 10px 15px rgba(0,0,0,0.2)' }}
          title="Puzzles"
        >
          🧩
        </div>
        
        {/* Números */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('numeros')}
          style={{ backgroundColor: '#FFD166', boxShadow: 'inset 0px 4px 0px #FFE599, 0px 6px 0px #CCAC00, 0px 10px 15px rgba(0,0,0,0.2)' }}
          title="Números"
        >
          🔢
        </div>

      </div>

    </div>
  )
}
