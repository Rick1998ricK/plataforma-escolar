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

export const esquemaEtapa = z.object({
  periodo_id: z.uuid(),
  nombre: z.string().trim().min(1, "Escribe un nombre, por ejemplo Primaria").max(40, "Máximo 40 caracteres"),
  modalidad: z.enum(["ebr", "eba"], "Elige la modalidad"),
});

export const esquemaGrado = z.object({
  etapa_id: z.uuid(),
  nombre: z.string().trim().min(1, "Escribe un nombre, por ejemplo 1.er grado").max(40, "Máximo 40 caracteres"),
});

export const esquemaSeccion = z.object({
  grado_id: z.uuid(),
  nombre: z.string().trim().min(1, "Escribe una letra o nombre").max(15, "Máximo 15 caracteres"),
  vacantes: z.coerce
    .number("Escribe un número")
    .int("Debe ser un número entero")
    .min(0, "No puede ser negativo")
    .max(200, "Máximo 200"),
});

export const NIVELES = ["periodo", "etapa", "grado", "seccion"] as const;
export type Nivel = (typeof NIVELES)[number];