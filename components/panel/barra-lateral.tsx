"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { estaActiva, MENU } from "@/lib/navegacion";
import { cn } from "@/lib/utils";

type Props = {
  nombreColegio: string;
  iniciales: string;
  rutasPermitidas: string[];
};

export function BarraLateral({ nombreColegio, iniciales, rutasPermitidas }: Props) {
  const rutaActual = usePathname();
  const items = MENU.filter((item) => rutasPermitidas.includes(item.ruta));

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-card md:flex">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
          {iniciales}
        </div>
        <span className="truncate font-semibold">{nombreColegio}</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map((item) => {
          const activa = estaActiva(rutaActual, item.ruta);
          const Icono = item.icono;
          return (
            <Link
              key={item.ruta}
              href={item.ruta}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                activa
                  ? "bg-primary/15 font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icono className={cn("size-5", activa && "text-primary")} />
              {item.titulo}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}