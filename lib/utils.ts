export { cn } from "cn"
export function obtenerIniciales(texto: string) {
  const palabras = texto.split(" ").filter((palabra) => palabra.length > 2);
  return (palabras.length ? palabras : [texto])
    .slice(-2)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase();
}

export function formatearFecha(fecha: string) {
  return new Intl.DateTimeFormat("es-PE", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${fecha}T00:00:00Z`),
  );
}