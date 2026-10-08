"use server";

import { redirect } from "next/navigation";
import { obtenerColegioActual } from "@/lib/services/colegios";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function iniciarSesion(datos: FormData) {
  const correo = String(datos.get("correo") ?? "");
  const contrasena = String(datos.get("contrasena") ?? "");

  const colegio = await obtenerColegioActual();
  if (!colegio) redirect("/login?error=colegio");

  const supabase = await crearClienteServidor();
  const { data: inicio, error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error || !inicio.session) redirect("/login?error=credenciales");

  // La pulsera debe ser del colegio de esta puerta
  const { data } = await supabase.auth.getClaims(inicio.session.access_token);
  const pulsera = data?.claims as Record<string, unknown> | undefined;

  if (pulsera?.colegio_id !== colegio.id) {
    await supabase.auth.signOut();
    redirect("/login?error=credenciales");
  }

  redirect("/panel");
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}