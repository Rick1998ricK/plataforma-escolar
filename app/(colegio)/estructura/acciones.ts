"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { sesionConPermiso } from "@/lib/auth/sesion";
import { errorPostgres } from "@/lib/db/errores";
import { cambiarEstadoPeriodo, crearPeriodo } from "@/lib/services/estructura";
import { esquemaPeriodo, type EstadoFormulario } from "@/lib/validaciones/estructura";

const SIN_PERMISO: EstadoFormulario = {
  ok: false,
  mensaje: "No tienes permiso para configurar la estructura.",
  errores: {},
  valores: {},
};

export async function accionCrearPeriodo(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  // 1. ¿Quien es y puede hacerlo?
  const sesion = await sesionConPermiso("estructura.configurar");
  if (!sesion) return SIN_PERMISO;

  // 2. ¿Los datos tienen sentido?
  const valores = {
    nombre: String(datos.get("nombre") ?? ""),
    fecha_inicio: String(datos.get("fecha_inicio") ?? ""),
    fecha_fin: String(datos.get("fecha_fin") ?? ""),
  };
  const resultado = esquemaPeriodo.safeParse(valores);
  if (!resultado.success) {
    return { ok: false, mensaje: null, errores: z.flattenError(resultado.error).fieldErrors, valores };
  }

  // 3. Guardar, siempre con el colegio de la pulsera
  try {
    await crearPeriodo(sesion.colegio_id, resultado.data);
  } catch (error) {
    const { codigo, regla } = errorPostgres(error);
    if (codigo === "23505" && regla === "periodos_colegio_nombre_unico") {
      return { ok: false, mensaje: null, errores: { nombre: ["Ya existe un periodo con ese nombre"] }, valores };
    }
    throw error;
  }

  // 4. Pedir que la pantalla se vuelva a dibujar con el periodo nuevo
  revalidatePath("/estructura");
  return { ok: true, mensaje: `Periodo ${resultado.data.nombre} creado`, errores: {}, valores: {} };
}

const esquemaCambioEstado = z.object({
  periodo_id: z.uuid(),
  nuevo_estado: z.enum(["activo", "cerrado"]),
});

export async function accionCambiarEstadoPeriodo(_previo: EstadoFormulario, datos: FormData): Promise<EstadoFormulario> {
  const sesion = await sesionConPermiso("estructura.configurar");
  if (!sesion) return SIN_PERMISO;

  const resultado = esquemaCambioEstado.safeParse({
    periodo_id: datos.get("periodo_id"),
    nuevo_estado: datos.get("nuevo_estado"),
  });
  if (!resultado.success) return { ok: false, mensaje: "Datos inválidos.", errores: {}, valores: {} };

  try {
    const cambiado = await cambiarEstadoPeriodo(sesion.colegio_id, resultado.data.periodo_id, resultado.data.nuevo_estado);
    if (!cambiado) return { ok: false, mensaje: "Este periodo ya cambió de estado. Recarga la página.", errores: {}, valores: {} };
  } catch (error) {
    const { codigo, regla } = errorPostgres(error);
    if (codigo === "23505" && regla === "periodos_un_solo_activo") {
      return { ok: false, mensaje: "Ya hay un periodo activo. Ciérralo antes de activar otro.", errores: {}, valores: {} };
    }
    throw error;
  }

  revalidatePath("/estructura");
  return { ok: true, mensaje: null, errores: {}, valores: {} };
}