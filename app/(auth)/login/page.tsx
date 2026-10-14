import { obtenerColegioActual } from "@/lib/services/colegios";
import { obtenerIniciales } from "@/lib/utils";
import { FormularioLogin } from "./formulario-login";

export default async function PaginaLogin() {
  const colegio = await obtenerColegioActual();

  if (!colegio) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">Colegio no encontrado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Ingresa desde la dirección de tu institución, por ejemplo micolegio.tuplataforma.pe
          </p>
        </div>
      </main>
    );
  }

  const estiloColegio = colegio.color_primario
    ? ({ "--primary": colegio.color_primario, "--ring": colegio.color_primario } as React.CSSProperties)
    : undefined;

  return (
    <main style={estiloColegio} className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-border bg-card p-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-xl bg-primary text-lg font-semibold text-primary-foreground">
            {obtenerIniciales(colegio.nombre)}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{colegio.nombre}</h1>
            <p className="text-sm text-muted-foreground">Ingresa con tu cuenta</p>
          </div>
        </div>
        <FormularioLogin />
      </div>
    </main>
  );
}