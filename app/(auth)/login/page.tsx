import { iniciarSesion } from "./acciones";

export default async function PaginaLogin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <form
        action={iniciarSesion}
        className="w-full max-w-sm space-y-4 rounded-xl border bg-white p-6 text-slate-900 shadow-sm"
      >
        <h1 className="text-xl font-semibold">Iniciar sesión</h1>

        {error && (
          <p className="rounded bg-red-50 p-2 text-sm text-red-700">
            Correo o contraseña incorrectos.
          </p>
        )}

        <label className="block text-sm">
          Correo
          <input name="correo" type="email" required className="mt-1 w-full rounded border px-3 py-2" />
        </label>

        <label className="block text-sm">
          Contraseña
          <input name="contrasena" type="password" required className="mt-1 w-full rounded border px-3 py-2" />
        </label>

        <button type="submit" className="w-full rounded bg-slate-900 px-3 py-2 text-white">
          Entrar
        </button>
      </form>
    </main>
  );
}