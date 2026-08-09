// Utilidades de "tiempo de pantalla" por perfil.
// Se guarda en localStorage (por dispositivo) y se resetea solo cada día,
// porque las claves incluyen la fecha de hoy.

function obtenerFechaHoy() {
  const hoy = new Date()
  const y = hoy.getFullYear()
  const m = String(hoy.getMonth() + 1).padStart(2, '0')
  const d = String(hoy.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function leerNumero(clave) {
  try {
    const valor = localStorage.getItem(clave)
    return valor ? parseInt(valor, 10) || 0 : 0
  } catch (e) {
    return 0
  }
}

function escribirNumero(clave, valor) {
  try {
    localStorage.setItem(clave, String(valor))
  } catch (e) { /* localStorage no disponible: no rompemos el juego por esto */ }
}

export function obtenerMinutosJugadosHoy(perfilId) {
  return leerNumero(`tiempo_${obtenerFechaHoy()}_${perfilId}`)
}

export function sumarMinutoJugado(perfilId) {
  const clave = `tiempo_${obtenerFechaHoy()}_${perfilId}`
  const nuevoTotal = leerNumero(clave) + 1
  escribirNumero(clave, nuevoTotal)
  return nuevoTotal
}

export function obtenerMinutosExtraHoy(perfilId) {
  return leerNumero(`tiempoExtra_${obtenerFechaHoy()}_${perfilId}`)
}

export function concederMinutosExtra(perfilId, minutos) {
  const clave = `tiempoExtra_${obtenerFechaHoy()}_${perfilId}`
  const nuevoTotal = leerNumero(clave) + minutos
  escribirNumero(clave, nuevoTotal)
  return nuevoTotal
}

// Limpieza opcional: borra registros de tiempo de días anteriores para no acumular basura
export function limpiarTiempoAntiguo() {
  try {
    const hoy = obtenerFechaHoy()
    Object.keys(localStorage)
      .filter((clave) => (clave.startsWith('tiempo_') || clave.startsWith('tiempoExtra_')) && !clave.includes(hoy))
      .forEach((clave) => localStorage.removeItem(clave))
  } catch (e) { /* no crítico */ }
}
