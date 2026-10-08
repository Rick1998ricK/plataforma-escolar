import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "@/lib/db";
import { rol_permisos, usuario_roles } from "@/lib/db/schema";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import type { Permiso } from "./permisos";

// Quien esta usando la plataforma en este momento
export const obtenerSesion = cache(async () => {
  const supabase = await crearClienteServidor();
  const { data } = await supabase.auth.getClaims();
  const pulsera = data?.claims as Record<string, unknown> | undefined;

  if (!pulsera?.colegio_id || !pulsera?.usuario_id) return null;

  return {
    correo: String(pulsera.email ?? ""),
    usuario_id: String(pulsera.usuario_id),
    colegio_id: String(pulsera.colegio_id),
    roles: (pulsera.roles as string[] | undefined) ?? [],
  };
});

// Todas las acciones que puede hacer, sumando sus roles
export const obtenerPermisos = cache(async (): Promise<Set<string>> => {
  const sesion = await obtenerSesion();
  if (!sesion) return new Set();

  const filas = await db
    .selectDistinct({ permiso: rol_permisos.permiso })
    .from(rol_permisos)
    .innerJoin(usuario_roles, eq(usuario_roles.rol_id, rol_permisos.rol_id))
    .where(
      and(
        eq(usuario_roles.usuario_id, sesion.usuario_id),
        eq(rol_permisos.colegio_id, sesion.colegio_id),
      ),
    );

  return new Set(filas.map((fila) => fila.permiso));
});

export async function tienePermiso(permiso: Permiso) {
  return (await obtenerPermisos()).has(permiso);
}

// Para paginas y acciones: si no tiene el permiso, no pasa
export async function exigirPermiso(permiso: Permiso) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");
  if (!(await tienePermiso(permiso))) redirect("/panel");
  return sesion;
}