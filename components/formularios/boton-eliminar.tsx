"use client";

import { Trash2 } from "lucide-react";
import { useActionState } from "react";
import { ESTADO_FORMULARIO_INICIAL, type EstadoFormulario } from "@/lib/validaciones/estructura";

type Props = {
  accion: (previo: EstadoFormulario, datos: FormData) => Promise<EstadoFormulario>;
  nivel: "etapa" | "grado" | "seccion";
  id: string;
  descripcion: string;
};

export function BotonEliminar({ accion, nivel, id, descripcion }: Props) {
  const [estado, enviar, enviando] = useActionState(accion, ESTADO_FORMULARIO_INICIAL);

  const advertencia = {
    etapa: "Se eliminarán también todos sus grados y secciones.",
    grado: "Se eliminarán también todas sus secciones.",
    seccion: "",
  }[nivel];

  function confirmar(evento: React.FormEvent<HTMLFormElement>) {
    if (!window.confirm(`¿Eliminar ${descripcion}? ${advertencia}`.trim())) evento.preventDefault();
  }

  return (
    <form action={enviar} onSubmit={confirmar} className="inline-flex flex-col items-end">
      <input type="hidden" name="nivel" value={nivel} />
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={enviando}
        className="flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-peligro/15 hover:text-peligro disabled:opacity-50"
        aria-label={`Eliminar ${descripcion}`}
      >
        <Trash2 className="size-4" />
      </button>
      {estado.mensaje && !estado.ok && <p className="max-w-48 text-right text-xs text-peligro">{estado.mensaje}</p>}
    </form>
  );
}