import { useState } from 'react'

// Guarda en localStorage la mejor puntuación (estrellas 1-3) que ha conseguido
// el perfil en cada nivel de un juego. Se usa para pintar las estrellitas en
// el selector de niveles y para que el niño vea su propio progreso.
export default function useMejoresNiveles(juegoId, perfilId) {
  const clave = `niveles_${juegoId}_${perfilId || 'anon'}`

  const [mejores, setMejores] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(clave) || '{}')
    } catch {
      return {}
    }
  })

  const guardarMejorNivel = (nivelId, estrellas) => {
    setMejores((prev) => {
      const actual = prev[nivelId] || 0
      if (estrellas <= actual) return prev
      const nuevo = { ...prev, [nivelId]: estrellas }
      try {
        localStorage.setItem(clave, JSON.stringify(nuevo))
      } catch {
        // Si localStorage falla (modo privado, cuota, etc.) simplemente no persistimos
      }
      return nuevo
    })
  }

  return { mejores, guardarMejorNivel }
}
