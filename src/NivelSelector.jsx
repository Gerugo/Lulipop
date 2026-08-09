import React from 'react'
import fondoImg from './fondo-lulipop.png'

// Pantalla común de "elige tu nivel" que usan todos los juegos de Lulipop.
// niveles: [{ id, nombre, descripcion, emoji, color, sombra }]
// mejores: { [nivelId]: estrellas (0-3) } — viene de useMejoresNiveles
export default function NivelSelector({ onVolver, emojiJuego, titulo, subtitulo, niveles, mejores = {}, onSeleccionar }) {
  return (
    <div style={{
      minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 10,
      overflow: 'hidden', userSelect: 'none', padding: '20px', boxSizing: 'border-box'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');

        .anim-pop { animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popIn { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }

        @keyframes flotarSel { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(15px);
          border: 6px solid white;
          border-radius: 32px;
          box-shadow: 0 15px 30px rgba(0,0,0,0.12);
        }

        .btn-nivel { cursor: pointer; transition: transform 0.15s cubic-bezier(0.4,0,0.2,1); border: 4px solid rgba(255,255,255,0.9); }
        .btn-nivel:active { transform: translateY(6px) scale(0.97); }
      `}</style>

      <button
        onClick={onVolver}
        style={{
          position: 'absolute', top: '25px', left: '25px',
          width: '60px', height: '60px', borderRadius: '20px',
          backgroundColor: '#FFFFFF', color: '#FF5E62', border: 'none',
          fontSize: '26px', cursor: 'pointer',
          boxShadow: '0 8px 0 #E0E0E0, 0 10px 15px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20
        }}
      >
        ❮
      </button>

      <div className="anim-pop" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '520px' }}>
        <div style={{ fontSize: '68px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))', animation: 'flotarSel 3s ease-in-out infinite' }}>
          {emojiJuego}
        </div>
        <h2 style={{ color: '#334155', fontSize: '1.9rem', margin: '10px 0 2px', fontWeight: '900', textAlign: 'center', textShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          {titulo}
        </h2>
        {subtitulo && (
          <p style={{ color: '#64748b', fontSize: '1.05rem', margin: '0 0 25px', fontWeight: '700', textAlign: 'center' }}>
            {subtitulo}
          </p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', marginTop: subtitulo ? 0 : '20px' }}>
          {niveles.map((n) => {
            const estrellas = mejores[n.id] || 0
            return (
              <button
                key={n.id}
                className="btn-nivel glass-panel"
                onClick={() => onSeleccionar(n.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '18px', padding: '14px 20px',
                  textAlign: 'left', width: '100%', boxSizing: 'border-box'
                }}
              >
                <div style={{
                  width: '58px', height: '58px', borderRadius: '18px', flexShrink: 0,
                  backgroundColor: n.color, boxShadow: `0 6px 0 ${n.sombra}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px'
                }}>
                  {n.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: '900', color: '#334155' }}>{n.nombre}</div>
                  {n.descripcion && (
                    <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: '700' }}>{n.descripcion}</div>
                  )}
                </div>
                <div style={{ fontSize: '1.1rem', flexShrink: 0, letterSpacing: '1px' }}>
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
