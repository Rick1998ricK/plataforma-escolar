import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env.local" });

const cliente = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });

try {
  await migrate(drizzle(cliente), { migrationsFolder: "./lib/db/migrations" });
  console.log("Migraciones aplicadas correctamente");
} catch (error) {
  console.error("Error en la migracion:", error.message);
} finally {
  await cliente.end();
}