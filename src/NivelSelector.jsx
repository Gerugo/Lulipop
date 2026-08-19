import fondoImg from './fondo-lulipop.png'

// Pantalla común de "elige tu nivel / cancionero" que usan los juegos de Lulipop.
// 100% responsiva para pantallas móviles horizontales y verticales, con soporte de scroll táctil fluido.
export default function NivelSelector({ onVolver, emojiJuego, titulo, subtitulo, niveles, mejores = {}, onSeleccionar }) {
  const tieneMuchosNiveles = niveles && niveles.length > 4

  return (
    <div className="selector-nivel-raiz" style={{
      height: '100dvh', minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
      overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y',
      userSelect: 'none', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '20px 14px 30px 14px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        .anim-pop { animation: popIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.88); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        @keyframes flotarSel { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .glass-panel {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 4px solid white;
          border-radius: 24px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .btn-nivel { 
          cursor: pointer; 
          transition: transform 0.12s cubic-bezier(0.4,0,0.2,1), box-shadow 0.12s; 
          border: 3px solid rgba(255,255,255,0.95); 
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-nivel:active { 
          transform: scale(0.97); 
          filter: brightness(0.96);
        }

        .btn-volver-selector {
          position: fixed; 
          top: 16px; 
          left: 16px;
          width: 52px; 
          height: 52px; 
          border-radius: 18px;
          background-color: #FFFFFF; 
          color: #FF5E62; 
          border: none;
          font-size: 22px; 
          cursor: pointer;
          box-shadow: 0 5px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15);
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 50;
        }

        .layout-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: ${tieneMuchosNiveles ? '820px' : '520px'};
          margin: auto 0;
        }

        .lista-niveles {
          display: grid;
          grid-template-columns: ${tieneMuchosNiveles ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr'};
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }

        /* Adaptación a móviles en apaisado (pantallas de baja altura) */
        @media (max-height: 550px) {
          .selector-nivel-raiz {
            padding: 8px 12px 16px 12px !important;
            justify-content: flex-start !important;
          }
          .btn-volver-selector {
            top: 8px !important;
            left: 8px !important;
            width: 42px !important;
            height: 42px !important;
            font-size: 18px !important;
            border-radius: 14px !important;
          }
          .layout-selector {
            max-width: 920px !important;
            flex-direction: row !important;
            align-items: flex-start !important;
            justify-content: center !important;
            gap: 18px !important;
            margin-top: 4px !important;
          }
          .col-info-selector {
            flex: 0 0 180px !important;
            position: sticky !important;
            top: 10px !important;
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            text-align: center !important;
          }
          .emoji-juego-selector {
            font-size: 42px !important;
          }
          .titulo-juego-selector {
            font-size: 1.25rem !important;
            margin: 2px 0 !important;
          }
          .subtitulo-juego-selector {
            font-size: 0.8rem !important;
            margin: 0 !important;
          }
          .lista-niveles {
            flex: 1 !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            max-height: calc(100dvh - 30px) !important;
            overflow-y: auto !important;
            padding-right: 4px !important;
            touch-action: pan-y !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .btn-nivel {
            padding: 8px 12px !important;
            border-radius: 18px !important;
          }
          .icono-nivel-caja {
            width: 40px !important;
            height: 40px !important;
            font-size: 20px !important;
            border-radius: 12px !important;
          }
          .nombre-nivel-txt {
            font-size: 0.98rem !important;
          }
          .desc-nivel-txt {
            font-size: 0.76rem !important;
          }
        }
      `}</style>

      <button onClick={onVolver} className="btn-volver-selector">
        ❮
      </button>

      <div className="anim-pop layout-selector">
        <div className="col-info-selector">
          <div className="emoji-juego-selector" style={{ fontSize: '60px', filter: 'drop-shadow(0 8px 14px rgba(0,0,0,0.18))', animation: 'flotarSel 3s ease-in-out infinite' }}>
            {emojiJuego}
          </div>
          <h2 className="titulo-juego-selector" style={{ color: '#334155', fontSize: '1.75rem', margin: '6px 0 2px', fontWeight: '900', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            {titulo}
          </h2>
          {subtitulo && (
            <p className="subtitulo-juego-selector" style={{ color: '#64748b', fontSize: '0.95rem', margin: '0 0 14px', fontWeight: '700', textAlign: 'center' }}>
              {subtitulo}
            </p>
          )}
        </div>

        <div className="lista-niveles">
          {niveles.map((n) => {
            const estrellas = mejores[n.id] || 0
            return (
              <button
                key={n.id}
                className="btn-nivel glass-panel"
                onClick={() => onSeleccionar(n.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                  textAlign: 'left', width: '100%', boxSizing: 'border-box'
                }}
              >
                <div className="icono-nivel-caja" style={{
                  width: '48px', height: '48px', borderRadius: '15px', flexShrink: 0,
                  backgroundColor: n.color, boxShadow: `0 4px 0 ${n.sombra}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'
                }}>
                  {n.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nombre-nivel-txt" style={{ fontSize: '1.1rem', fontWeight: '900', color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.nombre}</div>
                  {n.descripcion && (
                    <div className="desc-nivel-txt" style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: '700' }}>{n.descripcion}</div>
                  )}
                </div>
                <div style={{ fontSize: '1rem', flexShrink: 0, letterSpacing: '1px' }}>
                  {[1, 2, 3].map((i) => (
                    <span key={i}>{i <= estrellas ? '⭐' : '☆'}</span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
