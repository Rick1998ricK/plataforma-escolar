import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const global = globalThis as unknown as { clientePostgres?: ReturnType<typeof postgres> };

const cliente = global.clientePostgres ?? postgres(process.env.DATABASE_URL!, { prepare: false });

if (process.env.NODE_ENV !== "production") global.clientePostgres = cliente;

export const db = drizzle(cliente, { schema });