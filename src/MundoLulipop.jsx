import React, { useState } from 'react'
import JuegoNumeros from './JuegoNumeros'
import JuegoPuzzles from './JuegoPuzzles'
import JuegoArte from './JuegoArte'
import JuegoLetras from './JuegoLetras'
import JuegoTrazo from './JuegoTrazo'
import AlbumPegatinas from './AlbumPegatinas'
import fondoImg from './fondo-lulipop.png'

export default function MundoLulipop({ perfil, onVolver }) {
  const [juegoActivo, setJuegoActivo] = useState(null)

  if (juegoActivo === 'numeros') {
    return <JuegoNumeros perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  }
  if (juegoActivo === 'puzzles') {
    return <JuegoPuzzles perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  }
  if (juegoActivo === 'arte') {
    return <JuegoArte perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  }
  if (juegoActivo === 'letras') {
    return <JuegoLetras perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  }
  if (juegoActivo === 'trazo') {
    return <JuegoTrazo perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  }
  if (juegoActivo === 'album') {
    return <AlbumPegatinas perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  }

  return (
    <div style={{ 
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
      overflow: 'hidden'
    }}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&display=swap');
        
        .menu-btn-3d {
          width: 80px;
          height: 80px;
          border-radius: 26px;
          font-size: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          user-select: none;
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .menu-btn-3d:active {
          transform: translateY(8px) scale(0.95);
        }

        @keyframes floatAvatar {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      {/* CABECERA: Botón volver + Tarjeta de bienvenida del niño */}
      <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
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

      {/* BARRA INFERIOR (DOCK) CON LOS JUEGOS Y EL ÁLBUM */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        padding: '15px 25px',
        borderRadius: '35px',
        backdropFilter: 'blur(10px)',
        border: '4px solid white',
        boxShadow: '0 15px 30px rgba(0,0,0,0.2)',
        display: 'flex',
        gap: '14px',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 20,
        marginBottom: '10px',
        flexWrap: 'wrap'
      }}>
        
        {/* Álbum de Pegatinas */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('album')}
          style={{ 
            backgroundColor: '#a6c1ee', 
            boxShadow: 'inset 0px 5px 0px #d4e3ff, 0px 8px 0px #5c7cfa, 0px 12px 15px rgba(0,0,0,0.2)' 
          }}
          title="Álbum de Pegatinas"
        >
          📖
        </div>

        {/* Trazo de Letras */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('trazo')}
          style={{ 
            backgroundColor: '#66a6ff', 
            boxShadow: 'inset 0px 5px 0px #b3d7ff, 0px 8px 0px #005580, 0px 12px 15px rgba(0,0,0,0.2)' 
          }}
          title="Trazo de Letras"
        >
          ✍️
        </div>

        {/* Letras / Vocales */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('letras')}
          style={{ 
            backgroundColor: '#4facfe', 
            boxShadow: 'inset 0px 5px 0px #9ee5ff, 0px 8px 0px #0083B0, 0px 12px 15px rgba(0,0,0,0.2)' 
          }}
        >
          🔤
        </div>

        {/* Arte */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('arte')}
          style={{ 
            backgroundColor: '#FF6B6B', 
            boxShadow: 'inset 0px 5px 0px #FF9999, 0px 8px 0px #C0392B, 0px 12px 15px rgba(0,0,0,0.2)'
          }}
        >
          🎨
        </div>
        
        {/* Puzzles */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('puzzles')}
          style={{ 
            position: 'relative',
            backgroundColor: '#FF9966', 
            boxShadow: 'inset 0px 5px 0px #FFC299, 0px 8px 0px #D9534F, 0px 12px 15px rgba(0,0,0,0.2)' 
          }}
        >
          🧩
        </div>
        
        {/* Números */}
        <div 
          className="menu-btn-3d" 
          onClick={() => setJuegoActivo('numeros')}
          style={{ 
            backgroundColor: '#FFD166', 
            boxShadow: 'inset 0px 5px 0px #FFE599, 0px 8px 0px #CCAC00, 0px 12px 15px rgba(0,0,0,0.2)' 
          }}
        >
          🔢
        </div>

      </div>

    </div>
  )
}
