"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ESTADO_FORMULARIO_INICIAL } from "@/lib/validaciones/estructura";
import { accionCrearPeriodo } from "./acciones";

export function FormularioPeriodo() {
  const [estado, enviar, enviando] = useActionState(accionCrearPeriodo, ESTADO_FORMULARIO_INICIAL);

  return (
    <form action={enviar} className="space-y-3">
      <div className="grid gap-4 sm:grid-cols-3">
        <Campo etiqueta="Nombre" nombre="nombre" placeholder="2027 o 2027-I" estado={estado} />
        <Campo etiqueta="Fecha de inicio" nombre="fecha_inicio" tipo="date" estado={estado} />
        <Campo etiqueta="Fecha de fin" nombre="fecha_fin" tipo="date" estado={estado} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={enviando} className="h-11 px-5">
          {enviando ? "Creando…" : "Crear periodo"}
        </Button>
        {estado.mensaje && (
          <p className={estado.ok ? "text-sm text-exito" : "text-sm text-peligro"}>{estado.mensaje}</p>
        )}
      </div>
    </form>
  );
}

type PropsCampo = {
  etiqueta: string;
  nombre: string;
  tipo?: string;
  placeholder?: string;
  estado: typeof ESTADO_FORMULARIO_INICIAL;
};

function Campo({ etiqueta, nombre, tipo = "text", placeholder, estado }: PropsCampo) {
  const error = estado.errores[nombre]?.[0];

  return (
    <div className="space-y-1.5">
      <Label htmlFor={nombre}>{etiqueta}</Label>
      <Input
        id={nombre}
        name={nombre}
        type={tipo}
        placeholder={placeholder}
        defaultValue={estado.valores[nombre] ?? ""}
        aria-invalid={Boolean(error)}
        className="h-11"
      />
      {error && <p className="text-sm text-peligro">{error}</p>}
    </div>
  );
}