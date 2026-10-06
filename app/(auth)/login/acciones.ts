"use server";

import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";

export async function iniciarSesion(datos: FormData) {
  const correo = String(datos.get("correo") ?? "");
  const contrasena = String(datos.get("contrasena") ?? "");

  const supabase = await crearClienteServidor();
  const { error } = await supabase.auth.signInWithPassword({
    email: correo,
    password: contrasena,
  });

  if (error) redirect("/login?error=1");
  redirect("/panel");
}

export async function cerrarSesion() {
  const supabase = await crearClienteServidor();
  await supabase.auth.signOut();
  redirect("/login");
}