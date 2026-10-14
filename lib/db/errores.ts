// Drizzle envuelve los errores de PostgreSQL; aqui sacamos el codigo y la regla que fallo.
// Codigos utiles: 23505 = valor repetido, 23514 = no cumple un check, 23503 = referencia invalida.
export function errorPostgres(error: unknown): { codigo?: string; regla?: string } {
  const original = (error as { cause?: unknown })?.cause ?? error;
  const datos = original as { code?: string; constraint_name?: string };
  return { codigo: datos?.code, regla: datos?.constraint_name };
}