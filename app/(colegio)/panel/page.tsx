import { CalendarCheck, TriangleAlert, Users, Wallet } from "lucide-react";
import { obtenerSesion } from "@/lib/auth/sesion";

const INDICADORES = [
  { titulo: "Matriculados", valor: "—", nota: "Llega con el módulo de matrícula", icono: Users, destacado: false },
  { titulo: "Cobrado este mes", valor: "—", nota: "Llega con el módulo de pagos", icono: Wallet, destacado: true },
  { titulo: "Morosidad", valor: "—", nota: "Llega con el módulo de pagos", icono: TriangleAlert, destacado: false },
  { titulo: "Asistencia de hoy", valor: "—", nota: "Llega con el módulo de asistencia", icono: CalendarCheck, destacado: false },
];

export default async function PaginaResumen() {
  const sesion = await obtenerSesion();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Resumen</h1>
        <p className="text-sm text-muted-foreground">Rol: {sesion?.roles.join(", ") || "sin rol"}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {INDICADORES.map((indicador) => {
          const Icono = indicador.icono;
          return (
            <div
              key={indicador.titulo}
              className={
                indicador.destacado
                  ? "rounded-xl bg-primary p-4 text-primary-foreground"
                  : "rounded-xl border border-border bg-card p-4"
              }
            >
              <div className="flex items-start justify-between gap-2">
                <p className={indicador.destacado ? "text-sm opacity-90" : "text-sm text-muted-foreground"}>
                  {indicador.titulo}
                </p>
                <Icono className="size-5 shrink-0 opacity-80" />
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">{indicador.valor}</p>
              <p className={indicador.destacado ? "mt-1 text-xs opacity-80" : "mt-1 text-xs text-muted-foreground"}>
                {indicador.nota}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid gap-3 lg:grid-cols-3 lg:gap-4">
        <section className="rounded-xl border border-border bg-card p-5 lg:col-span-2">
          <h2 className="font-semibold">Cobros por mes</h2>
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            El gráfico aparecerá cuando registremos pagos
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Estados de ejemplo</h2>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            <span className="rounded-md bg-exito/15 px-2.5 py-1 text-exito">Pagado</span>
            <span className="rounded-md bg-alerta/15 px-2.5 py-1 text-alerta">Por vencer</span>
            <span className="rounded-md bg-peligro/15 px-2.5 py-1 text-peligro">Vencido</span>
          </div>
        </section>
      </div>
    </div>
  );
}