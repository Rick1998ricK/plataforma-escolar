"use client";

import { Ellipsis, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { estaActiva, MENU } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

export function NavegacionMovil({ rutasPermitidas }: { rutasPermitidas: string[] }) {
  const rutaActual = usePathname();
  const [abierto, setAbierto] = useState(false);

  const items = MENU.filter((item) => rutasPermitidas.includes(item.ruta));
  const principales = items.slice(0, 3);
  const resto = items.slice(3);

  return (
    <>
      {abierto && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setAbierto(false)}>
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card p-4 pb-8"
            onClick={(evento) => evento.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold">Más opciones</span>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="flex size-10 items-center justify-center rounded-lg text-muted-foreground"
                aria-label="Cerrar menú"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {resto.map((item) => {
                const Icono = item.icono;
                return (
                  <Link
                    key={item.ruta}
                    href={item.ruta}
                    onClick={() => setAbierto(false)}
                    className="flex flex-col items-center gap-2 rounded-xl bg-secondary px-2 py-4 text-sm"
                  >
                    <Icono className="size-6 text-primary" />
                    {item.titulo}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {principales.map((item) => {
          const activa = estaActiva(rutaActual, item.ruta);
          const Icono = item.icono;
          return (
            <Link
              key={item.ruta}
              href={item.ruta}
              className={cn(
                "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs",
                activa ? "text-foreground" : "text-muted-foreground",
              )}
            >
              <Icono className={cn("size-6", activa && "text-primary")} />
              {item.titulo}
            </Link>
          );
        })}
        {resto.length > 0 && (
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs text-muted-foreground"
          >
            <Ellipsis className="size-6" />
            Más
          </button>
        )}
      </nav>
    </>
  );
}