import { and, asc, count, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { etapas, grados, periodos_academicos, secciones } from "@/lib/db/schema";
import type { DatosPeriodo, Nivel } from "@/lib/validaciones/estructura";

// Toda funcion recibe colegio_id y filtra por el: Drizzle usa la llave maestra
// y el guardia RLS no lo revisa, asi que el filtro lo ponemos nosotros.

// ===== Periodos =====

export async function listarPeriodos(colegio_id: string) {
  return db
    .select()
    .from(periodos_academicos)
    .where(eq(periodos_academicos.colegio_id, colegio_id))
    .orderBy(desc(periodos_academicos.fecha_inicio), asc(periodos_academicos.nombre));
}

export async function obtenerPeriodo(colegio_id: string, periodo_id: string) {
  const [periodo] = await db
    .select()
    .from(periodos_academicos)
    .where(and(eq(periodos_academicos.id, periodo_id), eq(periodos_academicos.colegio_id, colegio_id)))
    .limit(1);
  return periodo ?? null;
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

// ===== El arbol: etapas > grados > secciones =====

export async function obtenerArbol(colegio_id: string, periodo_id: string) {
  const listaEtapas = await db
    .select()
    .from(etapas)
    .where(and(eq(etapas.periodo_id, periodo_id), eq(etapas.colegio_id, colegio_id)))
    .orderBy(asc(etapas.orden), asc(etapas.nombre));

  const idsEtapas = listaEtapas.map((etapa) => etapa.id);
  const listaGrados = idsEtapas.length
    ? await db
        .select()
        .from(grados)
        .where(and(inArray(grados.etapa_id, idsEtapas), eq(grados.colegio_id, colegio_id)))
        .orderBy(asc(grados.orden), asc(grados.nombre))
    : [];

  const idsGrados = listaGrados.map((grado) => grado.id);
  const listaSecciones = idsGrados.length
    ? await db
        .select()
        .from(secciones)
        .where(and(inArray(secciones.grado_id, idsGrados), eq(secciones.colegio_id, colegio_id)))
        .orderBy(asc(secciones.nombre))
    : [];

  // Armar las munecas rusas: cada etapa con sus grados, cada grado con sus secciones
  return listaEtapas.map((etapa) => ({
    ...etapa,
    grados: listaGrados
      .filter((grado) => grado.etapa_id === etapa.id)
      .map((grado) => ({
        ...grado,
        secciones: listaSecciones.filter((seccion) => seccion.grado_id === grado.id),
      })),
  }));
}

export type EtapaConGrados = Awaited<ReturnType<typeof obtenerArbol>>[number];

// El nuevo elemento va al final de su lista
async function siguienteOrden(tabla: typeof etapas | typeof grados, condicion: ReturnType<typeof eq>) {
  const [fila] = await db.select({ total: count() }).from(tabla).where(condicion);
  return fila?.total ?? 0;
}

export async function crearEtapa(colegio_id: string, datos: { periodo_id: string; nombre: string; modalidad: "ebr" | "eba" }) {
  const orden = await siguienteOrden(etapas, eq(etapas.periodo_id, datos.periodo_id));
  await db.insert(etapas).values({ colegio_id, orden, ...datos });
}

export async function crearGrado(colegio_id: string, datos: { etapa_id: string; nombre: string }) {
  const orden = await siguienteOrden(grados, eq(grados.etapa_id, datos.etapa_id));
  await db.insert(grados).values({ colegio_id, orden, ...datos });
}

export async function crearSeccion(colegio_id: string, datos: { grado_id: string; nombre: string; vacantes: number }) {
  await db.insert(secciones).values({ colegio_id, ...datos });
}

// ¿A que periodo pertenece este elemento? Sirve para no tocar periodos cerrados.
// Devuelve null si el elemento no existe o es de otro colegio.
export async function periodoDe(colegio_id: string, nivel: Nivel, id: string) {
  const columnas = { periodo_id: periodos_academicos.id, estado: periodos_academicos.estado };
  const delColegio = eq(periodos_academicos.colegio_id, colegio_id);

  if (nivel === "periodo") {
    const [fila] = await db.select(columnas).from(periodos_academicos).where(and(eq(periodos_academicos.id, id), delColegio));
    return fila ?? null;
  }
  if (nivel === "etapa") {
    const [fila] = await db
      .select(columnas)
      .from(etapas)
      .innerJoin(periodos_academicos, eq(periodos_academicos.id, etapas.periodo_id))
      .where(and(eq(etapas.id, id), delColegio));
    return fila ?? null;
  }
  if (nivel === "grado") {
    const [fila] = await db
      .select(columnas)
      .from(grados)
      .innerJoin(etapas, eq(etapas.id, grados.etapa_id))
      .innerJoin(periodos_academicos, eq(periodos_academicos.id, etapas.periodo_id))
      .where(and(eq(grados.id, id), delColegio));
    return fila ?? null;
  }
  const [fila] = await db
    .select(columnas)
    .from(secciones)
    .innerJoin(grados, eq(grados.id, secciones.grado_id))
    .innerJoin(etapas, eq(etapas.id, grados.etapa_id))
    .innerJoin(periodos_academicos, eq(periodos_academicos.id, etapas.periodo_id))
    .where(and(eq(secciones.id, id), delColegio));
  return fila ?? null;
}

export async function eliminarElemento(colegio_id: string, nivel: Exclude<Nivel, "periodo">, id: string) {
  const tabla = { etapa: etapas, grado: grados, seccion: secciones }[nivel];
  await db.delete(tabla).where(and(eq(tabla.id, id), eq(tabla.colegio_id, colegio_id)));
}