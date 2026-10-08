import { redirect } from "next/navigation";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { cerrarSesion } from "@/app/(auth)/login/acciones";
import { obtenerPermisos } from "@/lib/auth/sesion";

export default async function PaginaPanel() {
  const supabase = await crearClienteServidor();

  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const pulsera = data.claims as Record<string, unknown>;
  const roles = (pulsera.roles as string[] | undefined) ?? [];
  const permisos = [...(await obtenerPermisos())].sort();

  const { data: colegios, error } = await supabase
    .from("colegios")
    .select("nombre, subdominio");

  return (
    <main className="mx-auto max-w-xl space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Panel</h1>
        <form action={cerrarSesion}>
          <button type="submit" className="rounded border px-3 py-1 text-sm">
            Cerrar sesión
          </button>
        </form>
      </div>

      <section className="rounded border p-4 text-sm">
        <h2 className="mb-2 font-medium">Lo que dice tu pulsera</h2>
        <p>Correo: {String(pulsera.email ?? "")}</p>
        <p>colegio_id: {String(pulsera.colegio_id ?? "no tiene")}</p>
        <p>Roles: {roles.join(", ") || "ninguno"}</p>
      </section>

      <section className="rounded border p-4 text-sm">
        <h2 className="mb-2 font-medium">Lo que el guardia te deja ver</h2>
        {error && <p className="text-red-600">Error: {error.message}</p>}
        {colegios?.map((colegio) => (
          <p key={colegio.subdominio}>
            {colegio.nombre} ({colegio.subdominio})
          </p>
        ))}
        {!error && colegios?.length === 0 && <p>Ningún colegio.</p>}
      </section>

      <section className="rounded border p-4 text-sm">
        <h2 className="mb-2 font-medium">Lo que puedes hacer</h2>
        {permisos.map((permiso) => (
          <p key={permiso}>{permiso}</p>
        ))}
        {permisos.length === 0 && <p>Ningún permiso.</p>}
      </section>
    </main>
  );
}