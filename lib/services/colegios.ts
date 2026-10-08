import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { colegios } from "@/lib/db/schema";

const DOMINIO_RAIZ = process.env.NEXT_PUBLIC_DOMINIO_RAIZ ?? "localhost:3000";

// "demo.localhost:3000" -> "demo" | "localhost:3000" -> null
export function extraerSubdominio(host: string): string | null {
  const nombre = host.split(":")[0].toLowerCase();
  const raiz = DOMINIO_RAIZ.split(":")[0].toLowerCase();

  if (nombre === raiz || !nombre.endsWith(`.${raiz}`)) return null;

  const subdominio = nombre.slice(0, -(raiz.length + 1));
  return subdominio && subdominio !== "www" ? subdominio : null;
}

export async function obtenerColegioActual() {
  const host = (await headers()).get("host") ?? "";
  const subdominio = extraerSubdominio(host);
  if (!subdominio) return null;

  const [colegio] = await db
    .select({
      id: colegios.id,
      nombre: colegios.nombre,
      subdominio: colegios.subdominio,
      logo_url: colegios.logo_url,
    })
    .from(colegios)
    .where(and(eq(colegios.subdominio, subdominio), eq(colegios.activo, true)))
    .limit(1);

  return colegio ?? null;
}