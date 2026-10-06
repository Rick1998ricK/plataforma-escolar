import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const sql = postgres(process.env.DATABASE_URL, { prepare: false });

try {
  const [fila] = await sql`select current_database() as base, now() as hora`;
  console.log("Conexion correcta:", fila);

  const tablas = await sql`
    select table_schema, table_name
    from information_schema.tables
    where table_name in ('colegios', '__drizzle_migrations')
  `;
  console.log("Tablas encontradas:", tablas);
} catch (error) {
  console.error("Error de conexion:", error.message);
} finally {
  await sql.end();
}