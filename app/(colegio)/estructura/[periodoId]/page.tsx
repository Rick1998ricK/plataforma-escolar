import { ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { BotonEliminar } from "@/components/formularios/boton-eliminar";
import { FormularioRapido } from "@/components/formularios/formulario-rapido";
import { exigirPermiso } from "@/lib/auth/sesion";
import { obtenerArbol, obtenerPeriodo, type EtapaConGrados } from "@/lib/services/estructura";
import { cn, formatearFecha } from "@/lib/utils";
import { accionCrearEtapa, accionCrearGrado, accionCrearSeccion, accionEliminar } from "./acciones";

const OPCIONES_MODALIDAD = [
  { valor: "ebr", texto: "EBR (regular)" },
  { valor: "eba", texto: "EBA (CEBA)" },
];

export default async function PaginaPeriodo({ params }: { params: Promise<{ periodoId: string }> }) {
  const sesion = await exigirPermiso("estructura.configurar");

  const { periodoId } = await params;
  if (!z.uuid().safeParse(periodoId).success) notFound();

  const periodo = await obtenerPeriodo(sesion.colegio_id, periodoId);
  if (!periodo) notFound();

  const arbol = await obtenerArbol(sesion.colegio_id, periodo.id);
  const editable = periodo.estado !== "cerrado";
  const totalVacantes = arbol
    .flatMap((etapa) => etapa.grados)
    .flatMap((grado) => grado.secciones)
    .reduce((suma, seccion) => suma + seccion.vacantes, 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="space-y-3">
        <Link
          href="/estructura"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Periodos
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Periodo {periodo.nombre}</h1>
            <p className="text-sm text-muted-foreground tabular-nums">
              {formatearFecha(periodo.fecha_inicio)} – {formatearFecha(periodo.fecha_fin)}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="text-lg font-semibold text-foreground tabular-nums">{totalVacantes}</span> vacantes en
            total
          </p>
        </div>
      </div>

      {!editable && (
        <p className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm text-muted-foreground">
          <Lock className="size-4 shrink-0" />
          Este periodo está cerrado. Se muestra como historial y no se puede modificar.
        </p>
      )}

      {arbol.length === 0 && (
        <section className="rounded-xl border border-dashed border-border p-8 text-center">
          <h2 className="font-semibold">Agrega tu primera etapa</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Por ejemplo Inicial, Primaria o Secundaria. En un CEBA: Ciclo Inicial, Intermedio o Avanzado.
          </p>
        </section>
      )}

      {arbol.map((etapa) => (
        <TarjetaEtapa key={etapa.id} etapa={etapa} editable={editable} />
      ))}

      {editable && (
        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-3 font-semibold">Nueva etapa</h2>
          <FormularioRapido
            accion={accionCrearEtapa}
            ocultos={{ periodo_id: periodo.id }}
            campos={[
              { nombre: "nombre", etiqueta: "Nombre", placeholder: "Primaria" },
              {
                nombre: "modalidad",
                etiqueta: "Modalidad",
                tipo: "select",
                valorInicial: "ebr",
                opciones: OPCIONES_MODALIDAD,
                clase: "w-40",
              },
            ]}
            textoBoton="Agregar etapa"
          />
        </section>
      )}
    </div>
  );
}

function TarjetaEtapa({ etapa, editable }: { etapa: EtapaConGrados; editable: boolean }) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <header className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="truncate text-lg font-semibold">{etapa.nombre}</h2>
          <span
            className={cn(
              "shrink-0 rounded-md px-2 py-0.5 text-xs font-medium",
              etapa.modalidad === "ebr" ? "bg-primary/15 text-primary" : "bg-chart-2/15 text-chart-2",
            )}
          >
            {etapa.modalidad.toUpperCase()}
          </span>
        </div>
        {editable && (
          <BotonEliminar accion={accionEliminar} nivel="etapa" id={etapa.id} descripcion={`la etapa ${etapa.nombre}`} />
        )}
      </header>

      <div className="divide-y divide-border">
        {etapa.grados.length === 0 && (
          <p className="px-5 py-4 text-sm text-muted-foreground">Todavía no tiene grados.</p>
        )}

        {etapa.grados.map((grado) => (
          <div key={grado.id} className="space-y-3 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium">{grado.nombre}</h3>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {grado.secciones.length} {grado.secciones.length === 1 ? "sección" : "secciones"} ·{" "}
                  {grado.secciones.reduce((suma, seccion) => suma + seccion.vacantes, 0)} vacantes
                </p>
              </div>
              {editable && (
                <BotonEliminar accion={accionEliminar} nivel="grado" id={grado.id} descripcion={grado.nombre} />
              )}
            </div>

            {grado.secciones.length > 0 && (
              <ul className="flex flex-wrap gap-2">
                {grado.secciones.map((seccion) => (
                  <li
                    key={seccion.id}
                    className="flex items-center gap-1 rounded-lg border border-border bg-background py-1 pl-3 pr-1 text-sm"
                  >
                    <span className="font-medium">{seccion.nombre}</span>
                    <span className="text-muted-foreground tabular-nums">· {seccion.vacantes}</span>
                    {editable && (
                      <BotonEliminar
                        accion={accionEliminar}
                        nivel="seccion"
                        id={seccion.id}
                        descripcion={`la sección ${seccion.nombre} de ${grado.nombre}`}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}

            {editable && (
              <FormularioRapido
                accion={accionCrearSeccion}
                ocultos={{ grado_id: grado.id }}
                campos={[
                  { nombre: "nombre", etiqueta: "Sección", placeholder: "A", clase: "w-24" },
                  { nombre: "vacantes", etiqueta: "Vacantes", tipo: "number", valorInicial: "30", clase: "w-24" },
                ]}
                textoBoton="Agregar sección"
              />
            )}
          </div>
        ))}
      </div>

      {editable && (
        <footer className="border-t border-border bg-muted/40 px-5 py-4">
          <FormularioRapido
            accion={accionCrearGrado}
            ocultos={{ etapa_id: etapa.id }}
            campos={[{ nombre: "nombre", etiqueta: "Nuevo grado", placeholder: "1.er grado" }]}
            textoBoton="Agregar grado"
          />
        </footer>
      )}
    </section>
  );
}