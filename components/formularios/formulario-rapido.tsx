"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ESTADO_FORMULARIO_INICIAL, type EstadoFormulario } from "@/lib/validaciones/estructura";

export type CampoRapido = {
  nombre: string;
  etiqueta: string;
  tipo?: "text" | "number" | "select";
  placeholder?: string;
  valorInicial?: string;
  opciones?: { valor: string; texto: string }[];
  clase?: string;
};

type Props = {
  accion: (previo: EstadoFormulario, datos: FormData) => Promise<EstadoFormulario>;
  ocultos?: Record<string, string>;
  campos: CampoRapido[];
  textoBoton: string;
};

// Formulario pequeño de una sola fila, reutilizable en todo el arbol
export function FormularioRapido({ accion, ocultos = {}, campos, textoBoton }: Props) {
  const [estado, enviar, enviando] = useActionState(accion, ESTADO_FORMULARIO_INICIAL);

  return (
    <form action={enviar} className="space-y-2">
      {Object.entries(ocultos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}

      <div className="flex flex-wrap items-end gap-2">
        {campos.map((campo) => {
          const id = `${campo.nombre}-${Object.values(ocultos).join("-")}`;
          const valor = estado.valores[campo.nombre] ?? campo.valorInicial ?? "";
          const error = estado.errores[campo.nombre]?.[0];

          return (
            <div key={campo.nombre} className={cn("min-w-0 space-y-1", campo.clase ?? "flex-1")}>
              <Label htmlFor={id} className="text-xs text-muted-foreground">
                {campo.etiqueta}
              </Label>
              {campo.tipo === "select" ? (
                <select
                  id={id}
                  name={campo.nombre}
                  defaultValue={valor}
                  className="h-11 w-full rounded-md border border-input bg-background px-3 text-base"
                >
                  {campo.opciones?.map((opcion) => (
                    <option key={opcion.valor} value={opcion.valor}>
                      {opcion.texto}
                    </option>
                  ))}
                </select>
              ) : (
                <Input
                  id={id}
                  name={campo.nombre}
                  type={campo.tipo ?? "text"}
                  inputMode={campo.tipo === "number" ? "numeric" : undefined}
                  placeholder={campo.placeholder}
                  defaultValue={valor}
                  aria-invalid={Boolean(error)}
                  className="h-11"
                />
              )}
              {error && <p className="text-xs text-peligro">{error}</p>}
            </div>
          );
        })}

        <Button type="submit" variant="outline" disabled={enviando} className="h-11">
          {enviando ? "Guardando…" : textoBoton}
        </Button>
      </div>

      {estado.mensaje && !estado.ok && <p className="text-sm text-peligro">{estado.mensaje}</p>}
    </form>
  );
}