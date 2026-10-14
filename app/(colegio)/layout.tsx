import { redirect } from "next/navigation";
import { BarraLateral } from "@/components/panel/barra-lateral";
import { BotonCerrarSesion } from "@/components/panel/boton-cerrar-sesion";
import { Cabecera } from "@/components/panel/cabecera";
import { NavegacionMovil } from "@/components/panel/navegacion-movil";
import { obtenerPermisos, obtenerSesion } from "@/lib/auth/sesion";
import { filtrarMenu } from "@/lib/navegacion";
import { obtenerColegioActual } from "@/lib/services/colegios";
import { obtenerDatosCabecera } from "@/lib/services/panel";
import { obtenerIniciales } from "@/lib/utils";

export default async function LayoutColegio({ children }: { children: React.ReactNode }) {
  const sesion = await obtenerSesion();
  if (!sesion) redirect("/login");

  const colegio = await obtenerColegioActual();

  // La pulsera es de otro colegio (o se entro sin subdominio)
  if (!colegio || colegio.id !== sesion.colegio_id) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-sm rounded-xl border border-border bg-card p-6 text-center">
          <h1 className="text-lg font-semibold">No tienes acceso a este colegio</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu cuenta pertenece a otra institución. Ingresa desde la dirección de tu colegio.
          </p>
          <div className="mt-4">
            <BotonCerrarSesion conTexto />
          </div>
        </div>
      </main>
    );
  }

  const permisos = await obtenerPermisos();
  const rutasPermitidas = filtrarMenu(permisos);
  const { nombreUsuario, periodoActivo } = await obtenerDatosCabecera(sesion.usuario_id, colegio.id);

  // El color del colegio reemplaza al color de la plataforma solo dentro del panel
  const estiloColegio = colegio.color_primario
    ? ({ "--primary": colegio.color_primario, "--ring": colegio.color_primario } as React.CSSProperties)
    : undefined;

  return (
    <div style={estiloColegio} className="flex min-h-screen bg-background text-foreground">
      <BarraLateral
        nombreColegio={colegio.nombre}
        iniciales={obtenerIniciales(colegio.nombre)}
        rutasPermitidas={rutasPermitidas}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Cabecera
          nombreColegio={colegio.nombre}
          periodoActivo={periodoActivo}
          nombreUsuario={nombreUsuario || sesion.correo}
          iniciales={obtenerIniciales(nombreUsuario || sesion.correo)}
        />
        <main className="flex-1 px-4 py-6 pb-28 md:px-8 md:pb-8">{children}</main>
      </div>

      <NavegacionMovil rutasPermitidas={rutasPermitidas} />
    </div>
  );
}