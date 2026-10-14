"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { ESTADO_FORMULARIO_INICIAL } from "@/lib/validaciones/estructura";
import { accionCambiarEstadoPeriodo } from "./acciones";

type Props = {
  periodoId: string;
  nombre: string;
  estado: "planificado" | "activo" | "cerrado";
};

export function AccionesPeriodo({ periodoId, nombre, estado }: Props) {
  const [respuesta, enviar, enviando] = useActionState(accionCambiarEstadoPeriodo, ESTADO_FORMULARIO_INICIAL);

  if (estado === "cerrado") return null;

  const nuevo = estado === "planificado" ? "activo" : "cerrado";

  function confirmar(evento: React.FormEvent<HTMLFormElement>) {
    const pregunta =
      nuevo === "activo"
        ? `¿Activar el periodo ${nombre}? Será el periodo en el que se matricula y se registran notas.`
        : `¿Cerrar el periodo ${nombre}? Quedará como historial y ya no se podrá editar.`;
    if (!window.confirm(pregunta)) evento.preventDefault();
  }

  return (
    <div className="space-y-2">
      <form action={enviar} onSubmit={confirmar}>
        <input type="hidden" name="periodo_id" value={periodoId} />
        <input type="hidden" name="nuevo_estado" value={nuevo} />
        <Button type="submit" variant="outline" size="sm" disabled={enviando}>
          {enviando ? "Guardando…" : nuevo === "activo" ? "Activar" : "Cerrar periodo"}
        </Button>
      </form>
      {respuesta.mensaje && !respuesta.ok && <p className="text-sm text-peligro">{respuesta.mensaje}</p>}
    </div>
  );
}