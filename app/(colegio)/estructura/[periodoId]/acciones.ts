"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sesionConPermiso } from "@/lib/auth/sesion";
import { errorPostgres } from "@/lib/db/errores";
import { crearEtapa, crearGrado, crearSeccion, eliminarElemento, periodoDe } from "@/lib/services/estructura";
import {
  esquemaEtapa,
  esquemaGrado,
  esquemaSeccion,
  type EstadoFormulario,
  type Nivel,
} from "@/lib/validaciones/estructura";

function falla(mensaje: string, valores: Record<string, string> = {}): EstadoFormulario {
  return { ok: false, mensaje, errores: {}, valores };
}

// Pasos 1 y parte del 2 de la receta, iguales para todas las acciones del arbol:
// ¿puede configurar? y ¿el elemento es de su colegio y su periodo no esta cerrado?
type Preparado =
  | { error: string }
  | { sesion: { colegio_id: string }; periodo_id: string };

async function prepararCambio(nivel: Nivel, id: string): Promise<Preparado> {
  const sesion = await sesionConPermiso("estructura.configurar");
  if (!sesion) return { error: "No tienes permiso para configurar la estructura." };

  const periodo = await periodoDe(sesion.colegio_id, nivel, id);
  if (!periodo) return { error: "No encontramos ese elemento. Recarga la página." };
  if (periodo.estado === "cerrado") return { error: "Este periodo está cerrado y ya no se puede modificar." };

  return { sesion, periodo_id: periodo.periodo_id };
}

const MENSAJES_REPETIDO: Record<string, string> = {
  etapas_periodo_nombre_unico: "Ya existe una etapa con ese nombre en este periodo",
  grados_etapa_nombre_unico: "Ya existe un grado con ese nombre en esta etapa",
  secciones_grado_nombre_unico: "Ya existe una sección con ese nombre en este grado",
};

function leer(datos: FormData, campos: string[]) {
  return Object.fromEntries(campos.map((campo) => [campo, String(datos.get(campo) ?? "")]));
}

export async function accionCrearEtapa(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const valores = leer(datos, ["periodo_id", "nombre", "modalidad"]);
  const resultado = esquemaEtapa.safeParse(valores);
  if (!resultado.success) return { ok: false, mensaje: null, errores: z.flattenError(resultado.error).fieldErrors, valores };

  const preparado = await prepararCambio("periodo", resultado.data.periodo_id);
  if ("error" in preparado) return falla(preparado.error, valores);

  return guardar(() => crearEtapa(preparado.sesion.colegio_id, resultado.data), preparado.periodo_id, valores);
}

export async function accionCrearGrado(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const valores = leer(datos, ["etapa_id", "nombre"]);
  const resultado = esquemaGrado.safeParse(valores);
  if (!resultado.success) return { ok: false, mensaje: null, errores: z.flattenError(resultado.error).fieldErrors, valores };

  const preparado = await prepararCambio("etapa", resultado.data.etapa_id);
  if ("error" in preparado) return falla(preparado.error, valores);

  return guardar(() => crearGrado(preparado.sesion.colegio_id, resultado.data), preparado.periodo_id, valores);
}

export async function accionCrearSeccion(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const valores = leer(datos, ["grado_id", "nombre", "vacantes"]);
  const resultado = esquemaSeccion.safeParse(valores);
  if (!resultado.success) return { ok: false, mensaje: null, errores: z.flattenError(resultado.error).fieldErrors, valores };

  const preparado = await prepararCambio("grado", resultado.data.grado_id);
  if ("error" in preparado) return falla(preparado.error, valores);

  return guardar(() => crearSeccion(preparado.sesion.colegio_id, resultado.data), preparado.periodo_id, valores);
}

// Pasos 3 y 4 de la receta: guardar y redibujar
async function guardar(operacion: () => Promise<unknown>, periodo_id: string, valores: Record<string, string>) {
  try {
    await operacion();
  } catch (error) {
    const { codigo, regla } = errorPostgres(error);
    if (codigo === "23505" && regla && MENSAJES_REPETIDO[regla]) {
      return { ok: false, mensaje: null, errores: { nombre: [MENSAJES_REPETIDO[regla]] }, valores };
    }
    throw error;
  }

  revalidatePath(`/estructura/${periodo_id}`);
  return { ok: true, mensaje: null, errores: {}, valores: {} };
}

const esquemaEliminar = z.object({
  nivel: z.enum(["etapa", "grado", "seccion"]),
  id: z.uuid(),
});

export async function accionEliminar(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const resultado = esquemaEliminar.safeParse({ nivel: datos.get("nivel"), id: datos.get("id") });
  if (!resultado.success) return falla("Datos inválidos.");

  const preparado = await prepararCambio(resultado.data.nivel, resultado.data.id);
  if ("error" in preparado) return falla(preparado.error);

  try {
    await eliminarElemento(preparado.sesion.colegio_id, resultado.data.nivel, resultado.data.id);
  } catch (error) {
    // 23503: algo depende de este elemento (por ejemplo, matriculas en una seccion)
    if (errorPostgres(error).codigo === "23503") {
      return falla("No se puede eliminar porque ya tiene información registrada.");
    }
    throw error;
  }

  revalidatePath(`/estructura/${preparado.periodo_id}`);
  return { ok: true, mensaje: null, errores: {}, valores: {} };
}