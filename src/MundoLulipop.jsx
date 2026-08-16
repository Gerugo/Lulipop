import { useState, lazy, Suspense } from 'react'
import fondoImg from './fondo-lulipop.png'

// Carga diferida (Code Splitting) para reducir el bundle inicial en >70%
const JuegoNumeros = lazy(() => import('./JuegoNumeros'))
const JuegoPuzzles = lazy(() => import('./JuegoPuzzles'))
const JuegoArte = lazy(() => import('./JuegoArte'))
const JuegoLetras = lazy(() => import('./JuegoLetras'))
const JuegoTrazo = lazy(() => import('./JuegoTrazo'))
const AlbumPegatinas = lazy(() => import('./AlbumPegatinas'))
const JuegoMemoria = lazy(() => import('./JuegoMemoria'))
const JuegoSombras = lazy(() => import('./JuegoSombras'))
const JuegoBurbujas = lazy(() => import('./JuegoBurbujas'))
const JuegoIntruso = lazy(() => import('./JuegoIntruso'))
const JuegoCocina = lazy(() => import('./JuegoCocina'))
const JuegoConstructor3D = lazy(() => import('./JuegoConstructor3D'))
const JuegoRunner = lazy(() => import('./JuegoRunner'))

function CargandoJuego() {
  return (
    <div style={{
      minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 100
    }}>
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '20px 35px',
        borderRadius: '30px', border: '5px solid white', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', animation: 'flotarCarga 2s ease-in-out infinite' }}>🍭</div>
        <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#334155', marginTop: '8px' }}>
          ¡Cargando aventura...!
        </div>
      </div>
      <style>{`
        @keyframes flotarCarga { 0%, 100% { transform: translateY(0) rotate(-5deg); } 50% { transform: translateY(-12px) rotate(5deg); } }
      `}</style>
    </div>
  )
}

export default function MundoLulipop({ perfil, onVolver }) {
  const [juegoActivo, setJuegoActivo] = useState(null)
  const [pegatinasColocadas, setPegatinasColocadas] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`colocadas_${perfil?.id}`) || '[]')
    } catch {
      return []
    }
  })
  const [modoPegatina, setModoPegatina] = useState(null) 

  const baseUrl = import.meta.env.BASE_URL
  const getAssetUrl = (filename) => `${baseUrl}assets/${filename}`

  const manejarClickFondo = (e) => {
    if (!modoPegatina) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const nuevaPegatina = { id: Date.now(), emoji: modoPegatina, x, y }
    const actualizadas = [...pegatinasColocadas, nuevaPegatina]
    setPegatinasColocadas(actualizadas)
    if (perfil?.id) {
      try {
        localStorage.setItem(`colocadas_${perfil.id}`, JSON.stringify(actualizadas))
      } catch { /* continuar */ }
    }
    setModoPegatina(null)
  }

  const eliminarPegatina = (e, id) => {
    e.stopPropagation()
    const actualizadas = pegatinasColocadas.filter(p => p.id !== id)
    setPegatinasColocadas(actualizadas)
    if (perfil?.id) {
      try {
        localStorage.setItem(`colocadas_${perfil.id}`, JSON.stringify(actualizadas))
      } catch { /* continuar */ }
    }
  }

  if (juegoActivo) {
    return (
      <Suspense fallback={<CargandoJuego />}>
        {juegoActivo === 'numeros' && <JuegoNumeros perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'puzzles' && <JuegoPuzzles perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'arte' && <JuegoArte perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'letras' && <JuegoLetras perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'trazo' && <JuegoTrazo perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'album' && (
          <AlbumPegatinas
            perfil={perfil}
            onVolver={() => setJuegoActivo(null)}
            onSeleccionarParaPegar={(emoji) => { setModoPegatina(emoji); setJuegoActivo(null); }}
          />
        )}
        {juegoActivo === 'memoria' && <JuegoMemoria perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'sombras' && <JuegoSombras perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'burbujas' && <JuegoBurbujas perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'intruso' && <JuegoIntruso perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'cocina' && <JuegoCocina perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'constructor3d' && <JuegoConstructor3D perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
        {juegoActivo === 'runner' && <JuegoRunner perfil={perfil} onVolver={() => setJuegoActivo(null)} />}
      </Suspense>
    )
  }

  return (
    <div 
      onClick={manejarClickFondo}
      className="mundo-lulipop-raiz"
      style={{ 
        minHeight: '100dvh', width: '100vw',
        backgroundImage: `url(${fondoImg})`,
        backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
        boxSizing: 'border-box', padding: '16px', overflow: 'hidden', cursor: modoPegatina ? 'crosshair' : 'default'
      }}
    >
      <style>{`
        @keyframes entrarRebotandoArriba { 0% { transform: translateY(-40px); opacity: 0; } 60% { transform: translateY(8px); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes entrarRebotandoAbajo { 0% { transform: translateY(60px); opacity: 0; } 70% { transform: translateY(-8px); opacity: 1; } 100% { transform: translateY(0); opacity: 1; } }
        @keyframes flotarMascota { 0%, 100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(2deg); } }
        
        .animar-cabecera { animation: entrarRebotandoArriba 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
        .animar-dock { animation: entrarRebotandoAbajo 0.9s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }

        .menu-btn-3d {
          width: clamp(54px, 7.5vw, 85px); 
          height: clamp(54px, 7.5vw, 85px); 
          border-radius: 20px; 
          display: flex; 
          align-items: center; 
          justify-content: center;
          cursor: pointer; 
          user-select: none; 
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1); 
          overflow: hidden; 
          padding: 5px; 
          box-sizing: border-box;
          flex-shrink: 0;
        }
        .menu-btn-3d img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.15)); }
        .menu-btn-3d:active { transform: translateY(4px) scale(0.92); }

        .mascota-flotante {
          width: auto;
          height: clamp(90px, 26vh, 220px);
          max-width: 260px;
          object-fit: contain;
          animation: flotarMascota 4.5s ease-in-out infinite;
          filter: drop-shadow(0 15px 25px rgba(0,0,0,0.25));
        }

        .animar-dock {
          background-color: rgba(255, 255, 255, 0.72);
          padding: 10px 18px;
          border-radius: 32px;
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 4px solid rgba(255,255,255,0.95);
          box-shadow: 0 15px 35px rgba(0,0,0,0.18), inset 0 6px 12px rgba(255,255,255,0.5);
          display: flex;
          gap: 10px;
          align-items: center;
          justify-content: flex-start;
          z-index: 20;
          margin-bottom: 6px;
          max-width: 96vw;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .animar-dock::-webkit-scrollbar {
          display: none;
        }

        @media (min-width: 900px) {
          .animar-dock {
            justify-content: center;
            flex-wrap: wrap;
            padding: 12px 24px;
            gap: 12px;
          }
          .mascota-flotante {
            height: clamp(140px, 32vh, 260px);
          }
        }

        @media (max-height: 550px) {
          .mundo-lulipop-raiz {
            padding: 8px 14px !important;
          }
          .btn-nav-mundo {
            width: 44px !important;
            height: 44px !important;
            font-size: 18px !important;
            border-radius: 14px !important;
          }
          .btn-album-mundo {
            height: 44px !important;
            padding: 0 16px !important;
            font-size: 0.95rem !important;
            border-radius: 14px !important;
          }
          .badge-saludo-mundo {
            padding: 4px 16px !important;
            border-radius: 18px !important;
          }
          .badge-saludo-mundo span {
            font-size: 1.15rem !important;
          }
          .animar-dock {
            padding: 8px 12px !important;
            margin-bottom: 2px !important;
            gap: 8px !important;
          }
          .menu-btn-3d {
            width: 52px !important;
            height: 52px !important;
            border-radius: 15px !important;
          }
        }
      `}</style>

      {modoPegatina && (
        <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(255, 209, 102, 0.95)', color: '#333', padding: '10px 24px', borderRadius: '30px', fontWeight: '700', fontSize: '1.1rem', zIndex: 100, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', border: '3px solid white', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
          ✨ ¡Toca cualquier parte para pegar tu pegatina {modoPegatina}! ✨
        </div>
      )}

      {pegatinasColocadas.map((p) => (
        <div key={p.id} onClick={(e) => eliminarPegatina(e, p.id)} title="Toca para quitar" style={{ position: 'absolute', left: `${p.x - 25}px`, top: `${p.y - 25}px`, fontSize: '42px', cursor: 'pointer', filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.3))', zIndex: 15, transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.2)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
          {p.emoji}
        </div>
      ))}

      <div className="animar-cabecera" style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', zIndex: 20 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button onClick={onVolver} className="btn-nav-mundo" style={{ width: '50px', height: '50px', borderRadius: '18px', backgroundColor: 'rgba(255, 255, 255, 0.9)', color: '#FF5E62', border: '3px solid white', fontSize: '22px', cursor: 'pointer', boxShadow: '0 6px 16px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>❮</button>
          <button onClick={() => setJuegoActivo('album')} className="btn-album-mundo" style={{ height: '50px', padding: '0 20px', borderRadius: '18px', background: 'linear-gradient(135deg, #a6c1ee 0%, #8ca9eb 100%)', color: 'white', border: '3px solid white', fontSize: '1.05rem', fontWeight: '700', cursor: 'pointer', boxShadow: '0 6px 16px rgba(92, 124, 250, 0.3)', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: '"Fredoka", sans-serif' }}>📖 Álbum</button>
        </div>
        <div className="badge-saludo-mundo" style={{ backgroundColor: 'rgba(255, 255, 255, 0.88)', padding: '6px 20px', borderRadius: '22px', backdropFilter: 'blur(12px)', border: '3px solid white', boxShadow: '0 8px 20px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '26px' }}>{perfil?.avatar || '🧒'}</span>
          <span style={{ color: '#2D3748', fontSize: '1.25rem', fontWeight: '700' }}>¡Hola, {perfil?.nombre || 'Explorador'}!</span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 10, minHeight: 0 }}>
        <img 
          src={getAssetUrl('mascota.png')}
          alt="Lulipop Mascota"
          className="mascota-flotante"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }}
        />
        <span style={{ display: 'none', fontSize: '120px', animation: 'flotarMascota 4.5s ease-in-out infinite', filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.25))' }}>🍭</span>
      </div>

      <div className="animar-dock">
        
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('memoria')} style={{ backgroundColor: '#FF758C', boxShadow: 'inset 0px 4px 0px #FF96A7, 0px 5px 0px #C73E5B' }}>
          <img src={getAssetUrl('icono-memoria.png')} alt="Memoria" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🧠</span>
        </div>

        <div className="menu-btn-3d" onClick={() => setJuegoActivo('trazo')} style={{ backgroundColor: '#66a6ff', boxShadow: 'inset 0px 4px 0px #b3d7ff, 0px 5px 0px #005580' }}>
          <img src={getAssetUrl('icono-trazo.png')} alt="Trazo" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>✍️</span>
        </div>

        <div className="menu-btn-3d" onClick={() => setJuegoActivo('letras')} style={{ backgroundColor: '#4facfe', boxShadow: 'inset 0px 4px 0px #9ee5ff, 0px 5px 0px #0083B0' }}>
          <img src={getAssetUrl('icono-letras.png')} alt="Letras" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🔤</span>
        </div>

        <div className="menu-btn-3d" onClick={() => setJuegoActivo('arte')} style={{ backgroundColor: '#FF6B6B', boxShadow: 'inset 0px 4px 0px #FF9999, 0px 5px 0px #C0392B' }}>
          <img src={getAssetUrl('icono-arte.png')} alt="Arte" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🎨</span>
        </div>
        
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('puzzles')} style={{ backgroundColor: '#FF9966', boxShadow: 'inset 0px 4px 0px #FFC299, 0px 5px 0px #D9534F' }}>
          <img src={getAssetUrl('icono-puzzles.png')} alt="Puzzles" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🧩</span>
        </div>
        
        <div className="menu-btn-3d" onClick={() => setJuegoActivo('numeros')} style={{ backgroundColor: '#FFD166', boxShadow: 'inset 0px 4px 0px #FFE599, 0px 5px 0px #CCAC00' }}>
          <img src={getAssetUrl('icono-numeros.png')} alt="Números" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🔢</span>
        </div>

        <div className="menu-btn-3d" onClick={() => setJuegoActivo('sombras')} style={{ backgroundColor: '#a18cd1', boxShadow: 'inset 0px 4px 0px #bcaae3, 0px 5px 0px #7052a6' }}>
          <img src={getAssetUrl('icono-sombras.png')} alt="Sombras" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🌒</span>
        </div>

        <div className="menu-btn-3d" onClick={() => setJuegoActivo('burbujas')} style={{ backgroundColor: '#00d2d3', boxShadow: 'inset 0px 4px 0px #48dbfb, 0px 5px 0px #01a3a4' }}>
          <img src={getAssetUrl('icono-burbujas.png')} alt="Burbujas" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🎈</span>
        </div>

        <div className="menu-btn-3d" onClick={() => setJuegoActivo('intruso')} style={{ backgroundColor: '#1dd1a1', boxShadow: 'inset 0px 4px 0px #55efc4, 0px 5px 0px #10ac84' }}>
          <img src={getAssetUrl('icono-intruso.png')} alt="El Intruso" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🔎</span>
        </div>

        <div className="menu-btn-3d" onClick={() => setJuegoActivo('cocina')} style={{ backgroundColor: '#FF9966', boxShadow: 'inset 0px 4px 0px #FFC299, 0px 5px 0px #D9534F' }}>
          <img src={getAssetUrl('icono-cocina.png')} alt="Cocina" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>👨‍🍳</span>
        </div>

        <div className="menu-btn-3d" onClick={() => setJuegoActivo('constructor3d')} style={{ backgroundColor: '#a18cd1', boxShadow: 'inset 0px 4px 0px #d4c4f0, 0px 5px 0px #7052a6' }}>
          <img src={getAssetUrl('icono-constructor3d.png')} alt="Constructor 3D" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🧱</span>
        </div>

        <div className="menu-btn-3d" onClick={() => setJuegoActivo('runner')} style={{ backgroundColor: '#F472B6', boxShadow: 'inset 0px 4px 0px #F9A8D4, 0px 5px 0px #DB2777' }}>
          <img src={getAssetUrl('icono-runner.png')} alt="Runner" onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'block'; }} />
          <span style={{ display: 'none', fontSize: '32px' }}>🏃</span>
        </div>

      </div>

    </div>
  )
}
