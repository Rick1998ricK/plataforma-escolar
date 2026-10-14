import { z } from "zod";

// Las mismas reglas sirven en el formulario y en el servidor
export const esquemaPeriodo = z
  .object({
    nombre: z.string().trim().min(1, "Escribe un nombre, por ejemplo 2027").max(30, "Máximo 30 caracteres"),
    fecha_inicio: z.iso.date("Elige la fecha de inicio"),
    fecha_fin: z.iso.date("Elige la fecha de fin"),
  })
  .refine((datos) => datos.fecha_fin > datos.fecha_inicio, {
    message: "La fecha de fin debe ser posterior a la de inicio",
    path: ["fecha_fin"],
  });

export type DatosPeriodo = z.infer<typeof esquemaPeriodo>;

// Respuesta comun de todas las acciones de formulario
export type EstadoFormulario = {
  ok: boolean;
  mensaje: string | null;
  errores: Record<string, string[] | undefined>;
  valores: Record<string, string>;
};

export const ESTADO_FORMULARIO_INICIAL: EstadoFormulario = { ok: false, mensaje: null, errores: {}, valores: {} };