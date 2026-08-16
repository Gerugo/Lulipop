import { useState } from 'react'
import fondoImg from './fondo-lulipop.png'
import { concederMinutosExtra } from './tiempoPantalla'

// Verificación sencilla "solo para adultos": una cuenta que un niño pequeño
// difícilmente resuelve pero cualquier adulto sí, sin necesidad de gestionar
// contraseñas ni PINs.
function generarProblema() {
  const a = Math.floor(Math.random() * 8) + 4   // 4-11
  const b = Math.floor(Math.random() * 8) + 3   // 3-10
  return { a, b, resultado: a + b }
}

export default function PantallaTiempoAgotado({ perfil, minutosJugadosHoy, onVolverAPerfiles, onDesbloquear }) {
  const [mostrarVerificacion, setMostrarVerificacion] = useState(false)
  const [problema, setProblema] = useState(generarProblema)
  const [respuesta, setRespuesta] = useState('')
  const [error, setError] = useState(false)

  const comprobar = (e) => {
    e.preventDefault()
    if (parseInt(respuesta, 10) === problema.resultado) {
      if (perfil?.id) {
        concederMinutosExtra(perfil.id, 15)
      }
      onDesbloquear()
    } else {
      setError(true)
      setProblema(generarProblema())
      setRespuesta('')
      setTimeout(() => setError(false), 1600)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh', width: '100vw',
      backgroundImage: `url(${fondoImg})`,
      backgroundSize: 'cover', backgroundPosition: 'center',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '"Fredoka", sans-serif', position: 'absolute', top: 0, left: 0, zIndex: 300,
      padding: '16px', boxSizing: 'border-box', overflowY: 'auto'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700;900&display=swap');
        .anim-pop-tiempo { animation: popTiempo 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes popTiempo { 0% { transform: scale(0.85); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
        .anim-flota-luna { animation: flotaLuna 3.5s ease-in-out infinite; }
        @keyframes flotaLuna { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
        .anim-shake-tiempo { animation: shakeTiempo 0.4s ease-in-out; }
        @keyframes shakeTiempo { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }

        @media (max-height: 550px) {
          .card-tiempo-agotado {
            padding: 18px 22px !important;
            border-radius: 26px !important;
            max-width: 480px !important;
          }
          .icono-luna-tiempo {
            font-size: 3rem !important;
          }
          .titulo-tiempo-agotado {
            font-size: 1.3rem !important;
            margin: 4px 0 !important;
          }
          .desc-tiempo-agotado {
            font-size: 0.85rem !important;
            margin-bottom: 10px !important;
          }
        }
      `}</style>

      <div className="anim-pop-tiempo card-tiempo-agotado" style={{
        backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(15px)',
        border: '6px solid white', borderRadius: '40px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        padding: '40px 30px', maxWidth: '420px', width: '100%', textAlign: 'center'
      }}>
        <div className="anim-flota-luna icono-luna-tiempo" style={{ fontSize: '5rem' }}>🌙</div>
        <h2 className="titulo-tiempo-agotado" style={{ color: '#334155', fontSize: '1.8rem', fontWeight: '900', margin: '10px 0 8px 0' }}>
          ¡Hora de descansar, {perfil?.nombre}!
        </h2>
        <p className="desc-tiempo-agotado" style={{ color: '#64748B', fontSize: '1.05rem', fontWeight: '600', margin: '0 0 20px 0', lineHeight: '1.4' }}>
          Hoy ya has jugado {minutosJugadosHoy} minutos en Lulipop. ¡Mañana seguimos la aventura! 🚀
        </p>

        {!mostrarVerificacion ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={onVolverAPerfiles}
              style={{
                padding: '15px', fontSize: '1.15rem', fontWeight: '900',
                background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white',
                border: '4px solid white', borderRadius: '25px', cursor: 'pointer',
                boxShadow: '0 8px 0 #27ae60', fontFamily: '"Fredoka", sans-serif'
              }}
            >
              Volver a elegir perfil 🚪
            </button>
            <button
              onClick={() => setMostrarVerificacion(true)}
              style={{
                padding: '10px', fontSize: '0.9rem', fontWeight: '700',
                background: 'none', color: '#94A3B8', border: 'none', cursor: 'pointer',
                textDecoration: 'underline', fontFamily: '"Fredoka", sans-serif'
              }}
            >
              Soy un adulto y quiero dar más tiempo
            </button>
          </div>
        ) : (
          <form onSubmit={comprobar} className={error ? 'anim-shake-tiempo' : ''} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ color: '#334155', fontSize: '1rem', fontWeight: '800', margin: 0 }}>
              Verificación para adultos: ¿cuánto es {problema.a} + {problema.b}?
            </p>
            <input
              type="number"
              autoFocus
              value={respuesta}
              onChange={(e) => setRespuesta(e.target.value)}
              style={{
                padding: '14px', borderRadius: '18px', border: `3px solid ${error ? '#FF6B6B' : '#E2E8F0'}`,
                fontFamily: '"Fredoka", sans-serif', fontSize: '1.2rem', textAlign: 'center', outline: 'none'
              }}
            />
            {error && <p style={{ color: '#DC2626', fontWeight: '800', margin: 0, fontSize: '0.9rem' }}>No es correcto, prueba de nuevo</p>}
            <button
              type="submit"
              style={{
                padding: '14px', fontSize: '1.1rem', fontWeight: '900',
                backgroundColor: '#FFD166', color: '#7A5C00', border: '4px solid white',
                borderRadius: '25px', cursor: 'pointer', boxShadow: '0 8px 0 #CCAC00',
                fontFamily: '"Fredoka", sans-serif'
              }}
            >
              Dar 15 minutos más ⏱️
            </button>
            <button
              type="button"
              onClick={() => setMostrarVerificacion(false)}
              style={{
                padding: '8px', fontSize: '0.9rem', fontWeight: '700',
                background: 'none', color: '#94A3B8', border: 'none', cursor: 'pointer',
                fontFamily: '"Fredoka", sans-serif'
              }}
            >
              Cancelar
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
