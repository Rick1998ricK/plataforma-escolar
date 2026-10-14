import { BotonCerrarSesion } from "./boton-cerrar-sesion";
import { BotonTema } from "./boton-tema";

type Props = {
  nombreColegio: string;
  periodoActivo: string | null;
  nombreUsuario: string;
  iniciales: string;
};

export function Cabecera({ nombreColegio, periodoActivo, nombreUsuario, iniciales }: Props) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/90 px-4 py-3 backdrop-blur md:px-8">
      <div className="min-w-0">
        <p className="truncate font-semibold md:hidden">{nombreColegio}</p>
        <p className="truncate text-sm text-muted-foreground">
          {periodoActivo ? `Periodo ${periodoActivo} · Activo` : "Sin periodo activo"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <BotonTema />
        <BotonCerrarSesion />
        <div className="ml-2 flex items-center gap-3">
          <span className="hidden text-sm lg:block">{nombreUsuario}</span>
          <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-medium">
            {iniciales}
          </div>
        </div>
      </div>
    </header>
  );
}