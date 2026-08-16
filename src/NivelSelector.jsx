import fondoImg from './fondo-lulipop.png'

// Pantalla común de "elige tu nivel" que usan todos los juegos de Lulipop.
// Totalmente responsiva para pantallas móviles horizontales y verticales.
export default function NivelSelector({ onVolver, emojiJuego, titulo, subtitulo, niveles, mejores = {}, onSeleccionar }) {
  return (
    <div className="selector-nivel-raiz" style={{
      minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflowY: 'auto', userSelect: 'none', padding: '16px', boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        .anim-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        @keyframes flotarSel { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border: 5px solid white;
          border-radius: 28px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.12);
        }

        .btn-nivel { 
          cursor: pointer; 
          transition: transform 0.15s cubic-bezier(0.4,0,0.2,1); 
          border: 4px solid rgba(255,255,255,0.9); 
        }
        .btn-nivel:active { transform: translateY(4px) scale(0.97); }

        .btn-volver-selector {
          position: absolute; 
          top: 20px; 
          left: 20px;
          width: 55px; 
          height: 55px; 
          border-radius: 18px;
          background-color: #FFFFFF; 
          color: #FF5E62; 
          border: none;
          font-size: 24px; 
          cursor: pointer;
          box-shadow: 0 6px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15);
          display: flex; 
          align-items: center; 
          justify-content: center; 
          z-index: 30;
        }

        .layout-selector {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 500px;
        }

        .lista-niveles {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
        }

        /* Adaptación a pantallas de baja altura (móviles en horizontal) */
        @media (max-height: 550px) {
          .selector-nivel-raiz {
            padding: 10px 16px;
            justify-content: center;
          }
          .btn-volver-selector {
            top: 10px;
            left: 12px;
            width: 44px;
            height: 44px;
            font-size: 20px;
            border-radius: 14px;
          }
          .layout-selector {
            max-width: 820px;
            flex-direction: row;
            align-items: center;
            justify-content: center;
            gap: 24px;
          }
          .col-info-selector {
            flex: 0 0 200px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
          .emoji-juego-selector {
            font-size: 48px !important;
          }
          .titulo-juego-selector {
            font-size: 1.4rem !important;
            margin: 4px 0 2px !important;
          }
          .subtitulo-juego-selector {
            font-size: 0.85rem !important;
            margin: 0 !important;
          }
          .lista-niveles {
            flex: 1;
            gap: 8px;
          }
          .btn-nivel {
            padding: 8px 14px !important;
            border-radius: 18px !important;
          }
          .icono-nivel-caja {
            width: 42px !important;
            height: 42px !important;
            font-size: 22px !important;
            border-radius: 12px !important;
          }
          .nombre-nivel-txt {
            font-size: 1.05rem !important;
          }
          .desc-nivel-txt {
            font-size: 0.8rem !important;
          }
        }
      `}</style>

      <button onClick={onVolver} className="btn-volver-selector">
        ❮
      </button>

      <div className="anim-pop layout-selector">
        <div className="col-info-selector">
          <div className="emoji-juego-selector" style={{ fontSize: '64px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))', animation: 'flotarSel 3s ease-in-out infinite' }}>
            {emojiJuego}
          </div>
          <h2 className="titulo-juego-selector" style={{ color: '#334155', fontSize: '1.8rem', margin: '8px 0 2px', fontWeight: '900', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
            {titulo}
          </h2>
          {subtitulo && (
            <p className="subtitulo-juego-selector" style={{ color: '#64748b', fontSize: '1rem', margin: '0 0 16px', fontWeight: '700', textAlign: 'center' }}>
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
                  display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px',
                  textAlign: 'left', width: '100%', boxSizing: 'border-box'
                }}
              >
                <div className="icono-nivel-caja" style={{
                  width: '52px', height: '52px', borderRadius: '16px', flexShrink: 0,
                  backgroundColor: n.color, boxShadow: `0 5px 0 ${n.sombra}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px'
                }}>
                  {n.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="nombre-nivel-txt" style={{ fontSize: '1.15rem', fontWeight: '900', color: '#334155' }}>{n.nombre}</div>
                  {n.descripcion && (
                    <div className="desc-nivel-txt" style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '700' }}>{n.descripcion}</div>
                  )}
                </div>
                <div style={{ fontSize: '1.05rem', flexShrink: 0, letterSpacing: '1px' }}>
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
