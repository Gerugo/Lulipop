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
  const [modoPegatina, setModoPegatina] = useState(null) // Emoji seleccionado para colocar

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
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-btn-3d:active {
          transform: translateY(6px) scale(0.95);
        }

        @keyframes floatAvatar {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* Aviso si está en modo colocar pegatina */}
      {modoPegatina && (
        <div style={{
          position: 'fixed', top: '20px', left: '50%_at_50%_0', transform: 'translateX(-50%)',
          backgroundColor: '#FFD166', color: '#333', padding: '10px 25px', borderRadius: '20px',
          fontWeight: '700', fontSize: '1.1rem', zIndex: 100, boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
          border: '3px solid white'
        }}>
          ✨ ¡Toca cualquier parte del mundo para colocar tu pegatina {modoPegatina}! ✨
        </div>
      )}

      {/* Pegatinas colocadas en pantalla */}
      {pegatinasColocadas.map((p) => (
        <div
          key={p.id}
          onClick={(e) => eliminarPegatina(e, p.id)}
          title="Toca para quitar"
          style={{
            position: 'absolute',
            left: `${p.x - 25}px`,
            top: `${p.y - 25}px`,
            fontSize: '50px',
            cursor: 'pointer',
            filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.3))',
            zIndex: 15,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {p.emoji}
        </div>
      ))}

      {/* CABECERA: Botón volver + Álbum de Pegatinas independiente + Tarjeta de perfil */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={onVolver}
            style={{ 
              width: '50px', height: '50px', borderRadius: '16px',
              backgroundColor: '#FFFFFF', color: '#FF5E62', 
              border: 'none', fontSize: '20px', cursor: 'pointer',
              boxShadow: '0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ❮
          </button>

          {/* Botón Álbum Independiente */}
          <button 
            onClick={() => setJuegoActivo('album')}
            style={{ 
              height: '50px', padding: '0 20px', borderRadius: '16px',
              backgroundColor: '#a6c1ee', color: 'white', 
              border: 'none', fontSize: '1rem', fontWeight: '700', cursor: 'pointer',
              boxShadow: '0 6px 0 #5c7cfa, 0 10px 15px rgba(0,0,0,0.15)',
              display: 'flex', alignItems: 'center', gap: '8px',
              fontFamily: '"Fredoka", sans-serif'
            }}
          >
            📖 Álbum
          </button>
        </div>

        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          padding: '8px 25px',
          borderRadius: '25px',
          backdropFilter: 'blur(8px)',
          border: '3px solid white',
          boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '30px', animation: 'floatAvatar 2s ease-in-out infinite' }}>{perfil.avatar}</span>
          <span style={{ color: '#333', fontSize: '1.4rem', fontWeight: '700' }}>¡Hola, {perfil.nombre}!</span>
        </div>
      </div>

      {/* ESPACIO CENTRAL LIBRE */}
      <div style={{ flex: 1 }} />

      {/* BARRA INFERIOR (DOCK) EXCLUSIVA DE MINIJUEGOS */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        padding: '12px 20px',
        borderRadius: '35px',
        backdropFilter: 'blur(10px)',
        border: '4px solid white',
        boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        
        {/* Memoria */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('memoria')}
          style={{ backgroundColor: '#FF758C', boxShadow: 'inset 0px 4px 0px #FF96A7, 0px 6px 0px #C73E5B, 0px 10px 12px rgba(0,0,0,0.15)' }}
          title="Memoria"
        >
          🧠
        </div>

        {/* Trazo de Letras */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('trazo')}
          style={{ backgroundColor: '#66a6ff', boxShadow: 'inset 0px 4px 0px #b3d7ff, 0px 6px 0px #005580, 0px 10px 12px rgba(0,0,0,0.15)' }}
          title="Trazo"
        >
          ✍️
        </div>

        {/* Letras / Vocales */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('letras')}
          style={{ backgroundColor: '#4facfe', boxShadow: 'inset 0px 4px 0px #9ee5ff, 0px 6px 0px #0083B0, 0px 10px 12px rgba(0,0,0,0.15)' }}
          title="Letras"
        >
          🔤
        </div>

        {/* Arte */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('arte')}
          style={{ backgroundColor: '#FF6B6B', boxShadow: 'inset 0px 4px 0px #FF9999, 0px 6px 0px #C0392B, 0px 10px 12px rgba(0,0,0,0.15)' }}
          title="Arte"
        >
          🎨
        </div>
        
        {/* Puzzles */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('puzzles')}
          style={{ backgroundColor: '#FF9966', boxShadow: 'inset 0px 4px 0px #FFC299, 0px 6px 0px #D9534F, 0px 10px 12px rgba(0,0,0,0.15)' }}
          title="Puzzles"
        >
          🧩
        </div>
        
        {/* Números */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('numeros')}
          style={{ backgroundColor: '#FFD166', boxShadow: 'inset 0px 4px 0px #FFE599, 0px 6px 0px #CCAC00, 0px 10px 12px rgba(0,0,0,0.15)' }}
          title="Números"
        >
          🔢
        </div>

      </div>

    </div>
  )
}
