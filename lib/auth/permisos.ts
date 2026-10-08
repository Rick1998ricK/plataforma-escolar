// Catalogo de acciones que existen en la plataforma.
// Cada colegio decide que roles reciben cada una.
export const PERMISOS = {
  "usuarios.gestionar": "Crear usuarios y asignar roles",
  "estructura.configurar": "Configurar periodos, etapas, grados y secciones",
  "matriculas.ver": "Ver matrículas y fichas de alumnos",
  "matriculas.gestionar": "Registrar, aprobar y retirar matrículas",
  "pagos.ver": "Ver estados de cuenta y morosidad",
  "pagos.registrar": "Registrar cobros",
  "pagos.anular": "Anular pagos con motivo",
  "notas.registrar": "Registrar notas de sus cursos asignados",
  "notas.reabrir_periodo": "Reabrir un periodo de evaluación cerrado",
  "reportes.ver": "Ver reportes gerenciales",
} as const;

export type Permiso = keyof typeof PERMISOS;