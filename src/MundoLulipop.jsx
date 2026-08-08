import React, { useState, useEffect } from 'react'
import JuegoNumeros from './JuegoNumeros'
import JuegoPuzzles from './JuegoPuzzles'
import JuegoArte from './JuegoArte'
import JuegoLetras from './JuegoLetras'
import JuegoTrazo from './JuegoTrazo'
import AlbumPegatinas from './AlbumPegatinas'
import JuegoMemoria from './JuegoMemoria'
import JuegoSombras from './JuegoSombras'
import JuegoBurbujas from './JuegoBurbujas'
import JuegoIntruso from './JuegoIntruso'
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
  if (juegoActivo === 'sombras') return <JuegoSombras perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  if (juegoActivo === 'burbujas') return <JuegoBurbujas perfil={perfil} onVolver={() => setJuegoActivo(null)} />
  if (juegoActivo === 'intruso') return <JuegoIntruso perfil={perfil} onVolver={() => setJuegoActivo(null)} />

  return (
    <div 
      onClick={manejarClickFondo}
      style={{ 
        minHeight: '100dvh', width: '100vw',
        backgroundImage: `url(${fondoImg})`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
        boxSizing: 'border-box', padding: '25px', overflow: 'hidden', cursor: modoPegatina ? 'crosshair' : 'default'
      }}
    >
      <style>{`
        @keyframes entrarRebotandoArriba { 0% { transform: translateY(-50px); opacity: 0; } 60% { transform: translateY(10px); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes entrarRebotandoAbajo { 0% { transform: translateY(80px); opacity: 0; } 70% { transform: translateY(-10px); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes flotarMascota { 0%, 100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-20px) rotate(3deg); } }
        
        .animar-cabecera { animation: entrarRebotandoArriba 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animar-dock { animation: entrarRebotandoAbajo 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        .menu-btn-3d {
          width: 75px; height: 75px; border-radius: 22px; display: flex; align-items: center; justify-content: center;
          cursor: pointer; user-select: none; transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; padding: 6px; box-sizing: border-box;
        }
        .menu-btn-3d img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)); }
        
        @media (min-width: 768px) {
          .menu-btn-3d { width: 95px; height: 95px; border-radius: 30px; }
          .mascota-flotante { width: 320px !important; }
        }
        .menu-btn-3d:active { transform: translateY(6px) scale(0.92); }
      `}</style>

      {/* CABECERA Y PEGATINAS (Mantenido igual) */}
      <div className="animar-cabecera" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <button onClick={onVolver} style={{ width: '55px', height: '55px', borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#FF5E62', border: '3px solid white', fontSize: '24px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>❮</button>
        <button onClick={() => setJuegoActivo('album')} style={{ height: '55px', padding: '0 25px', borderRadius: '20px', background: 'linear-gradient(135deg, #a6c1ee 0%, #8ca9eb 100%)', color: 'white', border: '3px solid white', fontSize: '1.1rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 20px rgba(92, 124, 250, 0.3)', display: 'flex', alignItems: 'center', gap: '10px' }}>📖 Álbum</button>
      </div>

      <div className="animar-dock" style={{ backgroundColor: 'rgba(255, 255, 255, 0.65)', padding: '15px 25px', borderRadius: '40px', backdropFilter: 'blur(15px)', border: '5px solid rgba(255,255,255,0.9)', boxShadow: '0 20px 40px rgba(0,0,0,0.2), inset 0 10px 20px rgba(255,255,255,0.5)', display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center', zIndex: 20, marginBottom: '15px', flexWrap: 'wrap' }}>
        
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('memoria')} style={{ backgroundColor: '#FF758C', boxShadow: 'inset 0px 4px 0px #FF96A7, 0px 6px 0px #C73E5B' }}><img src={`${baseUrl}assets/icono-memoria.png`} alt="Memoria" /></div>
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('trazo')} style={{ backgroundColor: '#66a6ff', boxShadow: 'inset 0px 4px 0px #b3d7ff, 0px 6px 0px #005580' }}><img src={`${baseUrl}assets/icono-trazo.png`} alt="Trazo" /></div>
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('letras')} style={{ backgroundColor: '#4facfe', boxShadow: 'inset 0px 4px 0px #9ee5ff, 0px 6px 0px #0083B0' }}><img src={`${baseUrl}assets/icono-letras.png`} alt="Letras" /></div>
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('arte')} style={{ backgroundColor: '#FF6B6B', boxShadow: 'inset 0px 4px 0px #FF9999, 0px 6px 0px #C0392B' }}><img src={`${baseUrl}assets/icono-arte.png`} alt="Arte" /></div>
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('puzzles')} style={{ backgroundColor: '#FF9966', boxShadow: 'inset 0px 4px 0px #FFC299, 0px 6px 0px #D9534F' }}><img src={`${baseUrl}assets/icono-puzzles.png`} alt="Puzzles" /></div>
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('numeros')} style={{ backgroundColor: '#FFD166', boxShadow: 'inset 0px 4px 0px #FFE599, 0px 6px 0px #CCAC00' }}><img src={`${baseUrl}assets/icono-numeros.png`} alt="Números" /></div>
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('sombras')} style={{ backgroundColor: '#a18cd1', boxShadow: 'inset 0px 4px 0px #bcaae3, 0px 6px 0px #7052a6' }}><img src={`${baseUrl}assets/icono-sombras.png`} alt="Sombras" /></div>
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('burbujas')} style={{ backgroundColor: '#00d2d3', boxShadow: 'inset 0px 4px 0px #48dbfb, 0px 6px 0px #01a3a4' }}><img src={`${baseUrl}assets/icono-burbujas.png`} alt="Burbujas" /></div>
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('intruso')} style={{ backgroundColor: '#1dd1a1', boxShadow: 'inset 0px 4px 0px #55efc4, 0px 6px 0px #10ac84' }}><img src={`${baseUrl}assets/icono-intruso.png`} alt="El Intruso" /></div>
      </div>
    </div>
  )
}
