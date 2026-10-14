import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { periodos_academicos } from "@/lib/db/schema";
import type { DatosPeriodo } from "@/lib/validaciones/estructura";

// Toda funcion recibe colegio_id y filtra por el: Drizzle usa la llave maestra
// y el guardia RLS no lo revisa, asi que el filtro lo ponemos nosotros.

export async function listarPeriodos(colegio_id: string) {
  return db
    .select()
    .from(periodos_academicos)
    .where(eq(periodos_academicos.colegio_id, colegio_id))
    .orderBy(desc(periodos_academicos.fecha_inicio), asc(periodos_academicos.nombre));
}

export async function crearPeriodo(colegio_id: string, datos: DatosPeriodo) {
  const [periodo] = await db
    .insert(periodos_academicos)
    .values({ colegio_id, ...datos })
    .returning({ id: periodos_academicos.id });
  return periodo;
}

// Solo se permiten dos cambios: planificado -> activo, y activo -> cerrado
const CAMBIOS_PERMITIDOS = { activo: "planificado", cerrado: "activo" } as const;

export async function cambiarEstadoPeriodo(colegio_id: string, periodo_id: string, nuevo: "activo" | "cerrado") {
  const filas = await db
    .update(periodos_academicos)
    .set({ estado: nuevo })
    .where(
      and(
        eq(periodos_academicos.id, periodo_id),
        eq(periodos_academicos.colegio_id, colegio_id),
        eq(periodos_academicos.estado, CAMBIOS_PERMITIDOS[nuevo]),
      ),
    )
    .returning({ id: periodos_academicos.id });
  return filas.length > 0;
}