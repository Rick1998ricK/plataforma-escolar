import {
  CalendarCheck,
  ChartColumn,
  LayoutDashboard,
  NotebookPen,
  School,
  UserPlus,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { Permiso } from "@/lib/auth/permisos";

export type ItemMenu = {
  titulo: string;
  ruta: string;
  icono: LucideIcon;
  permiso?: Permiso; // sin permiso = lo ven todos
};

// El orden de esta lista es el orden del menu.
// En celular, los 3 primeros que el usuario pueda ver van en la barra inferior.
export const MENU: ItemMenu[] = [
  { titulo: "Resumen", ruta: "/panel", icono: LayoutDashboard },
  { titulo: "Matrículas", ruta: "/matriculas", icono: UserPlus, permiso: "matriculas.ver" },
  { titulo: "Pagos", ruta: "/pagos", icono: Wallet, permiso: "pagos.ver" },
  { titulo: "Notas", ruta: "/notas", icono: NotebookPen, permiso: "notas.registrar" },
  { titulo: "Asistencia", ruta: "/asistencia", icono: CalendarCheck, permiso: "asistencia.registrar" },
  { titulo: "Reportes", ruta: "/reportes", icono: ChartColumn, permiso: "reportes.ver" },
  { titulo: "Estructura", ruta: "/estructura", icono: School, permiso: "estructura.configurar" },
  { titulo: "Usuarios", ruta: "/usuarios", icono: Users, permiso: "usuarios.gestionar" },
];

export function filtrarMenu(permisos: Set<string>) {
  return MENU.filter((item) => !item.permiso || permisos.has(item.permiso)).map((item) => item.ruta);
}

export function estaActiva(rutaActual: string, ruta: string) {
  return rutaActual === ruta || rutaActual.startsWith(`${ruta}/`);
}