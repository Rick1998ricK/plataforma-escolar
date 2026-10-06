import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const cliente = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(cliente, { schema });