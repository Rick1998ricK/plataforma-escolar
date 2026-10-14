import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { exigirPermiso } from "@/lib/auth/sesion";
import { listarPeriodos } from "@/lib/services/estructura";
import { cn, formatearFecha } from "@/lib/utils";
import { AccionesPeriodo } from "./acciones-periodo";
import { FormularioPeriodo } from "./formulario-periodo";

const ETIQUETA_ESTADO = {
  planificado: { texto: "Planificado", clase: "bg-secondary text-secondary-foreground" },
  activo: { texto: "Activo", clase: "bg-exito/15 text-exito" },
  cerrado: { texto: "Cerrado", clase: "bg-muted text-muted-foreground" },
};

export default async function PaginaEstructura() {
  const sesion = await exigirPermiso("estructura.configurar");
  const periodos = await listarPeriodos(sesion.colegio_id);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Estructura académica</h1>
        <p className="text-sm text-muted-foreground">
          Los periodos de tu institución. Dentro de cada uno se configuran etapas, grados y secciones.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5">
        <h2 className="mb-4 font-semibold">Nuevo periodo</h2>
        <FormularioPeriodo />
      </section>

      {periodos.length === 0 ? (
        <section className="rounded-xl border border-dashed border-border p-8 text-center">
          <h2 className="font-semibold">Crea tu primer periodo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Un año lectivo como 2027, o un periodo de CEBA como 2027-I.
          </p>
        </section>
      ) : (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {periodos.map((periodo) => {
            const etiqueta = ETIQUETA_ESTADO[periodo.estado];
            return (
              <article
                key={periodo.id}
                className={cn(
                  "flex flex-col gap-4 rounded-xl border bg-card p-5",
                  periodo.estado === "activo" ? "border-primary" : "border-border",
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-semibold">{periodo.nombre}</h3>
                    <p className="text-sm text-muted-foreground tabular-nums">
                      {formatearFecha(periodo.fecha_inicio)} – {formatearFecha(periodo.fecha_fin)}
                    </p>
                  </div>
                  <span className={cn("rounded-md px-2.5 py-1 text-xs font-medium", etiqueta.clase)}>
                    {etiqueta.texto}
                  </span>
                </div>

                <div className="mt-auto flex flex-wrap items-start justify-between gap-3">
                  <AccionesPeriodo periodoId={periodo.id} nombre={periodo.nombre} estado={periodo.estado} />
                  <Link
                    href={`/estructura/${periodo.id}`}
                    className="inline-flex h-8 items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Configurar
                    <ChevronRight className="size-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}