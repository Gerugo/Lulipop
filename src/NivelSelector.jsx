import fondoImg from './fondo-lulipop.png'

// Componente maestro de "Elige tu nivel / receta / canción" utilizado en todo Mundo Lulipop.
// Diseñado para una visualización 100% impecable y fluida en cualquier pantalla (móvil vertical, apaisado, tablet y PC).
export default function NivelSelector({ onVolver, emojiJuego, titulo, subtitulo, niveles, mejores = {}, onSeleccionar }) {
  const tieneMuchosNiveles = niveles && niveles.length > 4

  return (
    <div className="selector-nivel-raiz" style={{
      height: '100dvh', minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      fontFamily: '"Fredoka", sans-serif',
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 50,
      overflowY: 'auto', WebkitOverflowScrolling: 'touch', touchAction: 'pan-y',
      userSelect: 'none', boxSizing: 'border-box',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '24px 16px 36px 16px'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        .anim-pop { animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        @keyframes flotarSel { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .glass-card-nivel {
          background: rgba(255, 255, 255, 0.94);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 4px solid white;
          border-radius: 24px;
          box-shadow: 0 10px 24px rgba(0,0,0,0.09), 0 3px 0 rgba(0,0,0,0.04);
          cursor: pointer;
          transition: transform 0.12s cubic-bezier(0.4,0,0.2,1), box-shadow 0.12s;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        .glass-card-nivel:hover {
          transform: translateY(-2px);
          box-shadow: 0 14px 28px rgba(0,0,0,0.12), 0 4px 0 rgba(0,0,0,0.06);
        }
        .glass-card-nivel:active {
          transform: scale(0.97) translateY(2px);
          filter: brightness(0.97);
        }

        .btn-volver-selector {
          position: fixed; 
          top: 18px; 
          left: 18px;
          width: 52px; 
          height: 52px; 
          border-radius: 18px;
          background-color: #FFFFFF; 
          color: #FF5E62; 
          border: none;
          font-size: 22px; 
          cursor: pointer;
          box-shadow: 0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15);
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 60;
          transition: transform 0.1s;
        }
        .btn-volver-selector:active { transform: translateY(3px); }

        .layout-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: ${tieneMuchosNiveles ? '840px' : '480px'};
          margin: auto 0;
          box-sizing: border-box;
        }

        .col-info-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 20px;
          width: 100%;
        }

        .lista-niveles {
          display: grid;
          grid-template-columns: ${tieneMuchosNiveles ? 'repeat(auto-fit, minmax(260px, 1fr))' : '1fr'};
          gap: 14px;
          width: 100%;
          box-sizing: border-box;
        }

        /* Adaptación para móviles en orientación horizontal (apaisado) */
        @media (max-height: 550px) {
          .selector-nivel-raiz {
            padding: 10px 14px 20px 14px !important;
            justify-content: flex-start !important;
          }
          .btn-volver-selector {
            top: 10px !important;
            left: 10px !important;
            width: 42px !important;
            height: 42px !important;
            font-size: 18px !important;
            border-radius: 14px !important;
          }
          .layout-selector {
            max-width: 920px !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: center !important;
            gap: 22px !important;
            margin: auto 0 !important;
          }
          .col-info-selector {
            flex: 0 0 200px !important;
            margin-bottom: 0 !important;
            position: sticky !important;
            top: 10px !important;
          }
          .emoji-juego-selector {
            font-size: 46px !important;
          }
          .titulo-juego-selector {
            font-size: 1.35rem !important;
            margin: 4px 0 2px !important;
          }
          .subtitulo-juego-selector {
            font-size: 0.82rem !important;
            margin: 0 !important;
          }
          .lista-niveles {
            flex: 1 !important;
            grid-template-columns: ${tieneMuchosNiveles ? 'repeat(2, 1fr)' : '1fr'} !important;
            gap: 10px !important;
            max-height: calc(100dvh - 30px) !important;
            overflow-y: auto !important;
            padding-right: 4px !important;
            touch-action: pan-y !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .glass-card-nivel {
            padding: 10px 14px !important;
            border-radius: 20px !important;
          }
          .icono-nivel-caja {
            width: 42px !important;
            height: 42px !important;
            font-size: 22px !important;
            border-radius: 14px !important;
          }
          .nombre-nivel-txt {
            font-size: 1.05rem !important;
          }
          .desc-nivel-txt {
            font-size: 0.78rem !important;
          }
        }
      `}</style>

      {/* BOTÓN VOLVER */}
      <button onClick={onVolver} className="btn-volver-selector" title="Volver al menú">
        ❮
      </button>

      {/* CONTENIDO PRINCIPAL */}
      <div className="anim-pop layout-selector">
        <div className="col-info-selector">
          <div className="emoji-juego-selector" style={{ fontSize: '66px', filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.18))', animation: 'flotarSel 3s ease-in-out infinite' }}>
            {emojiJuego}
          </div>
          <h2 className="titulo-juego-selector" style={{ color: '#334155', fontSize: '1.85rem', margin: '8px 0 3px', fontWeight: '900', textShadow: '0 2px 4px rgba(0,0,0,0.06)' }}>
            {titulo}
          </h2>
          {subtitulo && (
            <p className="subtitulo-juego-selector" style={{ color: '#64748b', fontSize: '0.98rem', margin: '0', fontWeight: '700' }}>
              {subtitulo}
            </p>
          )}
        </div>

        {/* LISTA DE NIVELES */}
        <div className="lista-niveles">
          {niveles.map((n) => {
            const estrellas = mejores[n.id] || 0
            return (
              <button
                key={n.id}
                className="glass-card-nivel"
                onClick={() => onSeleccionar(n.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 18px',
                  textAlign: 'left', width: '100%', boxSizing: 'border-box'
                }}
              >
                <div className="icono-nivel-caja" style={{
                  width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
                  backgroundColor: n.color || '#4facfe', boxShadow: `0 4px 0 ${n.sombra || '#005580'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px'
                }}>
                  {n.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nombre-nivel-txt" style={{ fontSize: '1.15rem', fontWeight: '900', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {n.nombre}
                  </div>
                  {n.descripcion && (
                    <div className="desc-nivel-txt" style={{ fontSize: '0.84rem', color: '#64748b', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {n.descripcion}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '1.05rem', flexShrink: 0, letterSpacing: '1px', display: 'flex', gap: '2px' }}>
                  {[1, 2, 3].map((i) => (
                    <span key={i} style={{ filter: i <= estrellas ? 'drop-shadow(0 1px 2px rgba(255,209,102,0.6))' : 'none' }}>
                      {i <= estrellas ? '⭐' : '☆'}
                    </span>
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
