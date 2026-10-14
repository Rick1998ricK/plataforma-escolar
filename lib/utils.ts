export { cn } from "cn"
export function obtenerIniciales(texto: string) {
  const palabras = texto.split(" ").filter((palabra) => palabra.length > 2);
  return (palabras.length ? palabras : [texto])
    .slice(-2)
    .map((palabra) => palabra[0])
    .join("")
    .toUpperCase();
}