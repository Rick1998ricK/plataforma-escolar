"use client";

import { useActionState, useEffect } from "react";
import { iniciarSesion, type EstadoLogin } from "./acciones";

const ESTADO_INICIAL: EstadoLogin = { ok: false, error: null };

export function FormularioLogin() {
  const [estado, enviar, enviando] = useActionState(iniciarSesion, ESTADO_INICIAL);

  // Si el login salio bien, el navegador va al panel por la misma puerta (demo.localhost).
  // Recarga completa a proposito: asi no queda nada de la sesion anterior en memoria.
  useEffect(() => {
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    if (estado.ok) window.location.assign("/panel");
  }, [estado.ok]);

  return (
    <form action={enviar} className="space-y-5">
      {estado.error && (
        <p className="rounded-lg bg-peligro/15 px-3 py-2 text-sm text-peligro">{estado.error}</p>
      )}

      <label className="block space-y-1.5 text-sm font-medium">
        <span>Correo</span>
        <input
          name="correo"
          type="email"
          required
          autoComplete="email"
          placeholder="nombre@colegio.edu.pe"
          className="h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <label className="block space-y-1.5 text-sm font-medium">
        <span>Contraseña</span>
        <input
          name="contrasena"
          type="password"
          required
          autoComplete="current-password"
          className="h-11 w-full rounded-lg border border-input bg-background px-3 font-normal outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
        />
      </label>

      <button
        type="submit"
        disabled={enviando || estado.ok}
        className="h-11 w-full rounded-lg bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {enviando || estado.ok ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}