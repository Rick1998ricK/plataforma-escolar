"use server";

import { obtenerColegioActual } from "@/lib/services/colegios";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export type EstadoLogin = { ok: boolean; error: string | null };

// No redirige: solo responde si salio bien o mal.
// La navegacion la hace el navegador (ver formulario-login.tsx).
export async function iniciarSesion(_estadoPrevio: EstadoLogin, datos: FormData): Promise<EstadoLogin> {
  const correo = String(datos.get("correo") ?? "");
  const contrasena = String(datos.get("contrasena") ?? "");

  const colegio = await obtenerColegioActual();
  if (!colegio) return { ok: false, error: "Ingresa desde la dirección de tu colegio." };

  const supabase = await crearClienteServidor();
  const { data: inicio, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error || !inicio.session) return { ok: false, error: "Correo o contraseña incorrectos." };

  // La pulsera debe ser del colegio de esta puerta
  const { data } = await supabase.auth.getClaims(inicio.session.access_token);
  const pulsera = data?.claims as Record<string, unknown> | undefined;

  if (pulsera?.colegio_id !== colegio.id) {
    await supabase.auth.signOut();
    return { ok: false, error: "Correo o contraseña incorrectos." };
  }

  return { ok: true, error: null };
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
}