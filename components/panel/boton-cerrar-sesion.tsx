"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { cerrarSesion } from "@/app/(auth)/login/acciones";

export function BotonCerrarSesion({ conTexto = false }: { conTexto?: boolean }) {
  const [saliendo, iniciarSalida] = useTransition();

  function salir() {
    iniciarSalida(async () => {
      await cerrarSesion();
      // El navegador vuelve al login por la misma puerta (demo.localhost).
      // Recarga completa a proposito: borra de memoria las paginas del panel.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      window.location.assign("/login");
    });
  }

  if (conTexto) {
    return (
      <button
        type="button"
        onClick={salir}
        disabled={saliendo}
        className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-60"
      >
        {saliendo ? "Saliendo…" : "Cerrar sesión"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={salir}
      disabled={saliendo}
      className="flex size-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
      aria-label="Cerrar sesión"
    >
      <LogOut className="size-5" />
    </button>
  );
}