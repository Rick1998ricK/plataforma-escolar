import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const RUTAS_PUBLICAS = ["/login"];

export async function actualizarSesion(request: NextRequest) {
  let respuesta = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesNuevas) {
          cookiesNuevas.forEach(({ name, value }) => request.cookies.set(name, value));
          respuesta = NextResponse.next({ request });
          cookiesNuevas.forEach(({ name, value, options }) =>
            respuesta.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Revisa la pulsera y la renueva si ya vencio
  const { data } = await supabase.auth.getClaims();
  const tieneSesion = Boolean(data?.claims);

  const ruta = request.nextUrl.pathname;
  const esPublica = RUTAS_PUBLICAS.some((publica) => ruta.startsWith(publica));

  if (!tieneSesion && !esPublica) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/login";
    return NextResponse.redirect(destino);
  }

  if (tieneSesion && ruta === "/login") {
    const destino = request.nextUrl.clone();
    destino.pathname = "/panel";
    return NextResponse.redirect(destino);
  }

  return respuesta;
}