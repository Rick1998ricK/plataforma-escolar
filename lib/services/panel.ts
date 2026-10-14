import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { periodos_academicos, usuarios } from "@/lib/db/schema";

export async function obtenerDatosCabecera(usuario_id: string, colegio_id: string) {
  const [usuario] = await db
    .select({ nombres: usuarios.nombres, apellidos: usuarios.apellidos })
    .from(usuarios)
    .where(and(eq(usuarios.id, usuario_id), eq(usuarios.colegio_id, colegio_id)))
    .limit(1);

  const [periodo] = await db
    .select({ nombre: periodos_academicos.nombre })
    .from(periodos_academicos)
    .where(and(eq(periodos_academicos.colegio_id, colegio_id), eq(periodos_academicos.estado, "activo")))
    .limit(1);

  return {
    nombreUsuario: usuario ? `${usuario.nombres} ${usuario.apellidos}` : "",
    periodoActivo: periodo?.nombre ?? null,
  };
}