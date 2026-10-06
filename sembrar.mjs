import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });

const CORREO = "rrick8757@gmail.com";

const sql = postgres(process.env.DATABASE_URL, { prepare: false, onnotice: () => {} });

try {
  await sql.begin(async (tx) => {
    const [cuenta] = await tx`select id from auth.users where email = ${CORREO}`;
    if (!cuenta) {
      throw new Error(`No existe una cuenta con el correo ${CORREO}. Creala en Authentication > Users.`);
    }

    const [colegio] = await tx`
      insert into colegios (nombre, subdominio)
      values ('Colegio Demo', 'demo')
      on conflict (subdominio) do update set nombre = excluded.nombre
      returning id`;

    const [usuario] = await tx`
      insert into usuarios (auth_id, colegio_id, nombres, apellidos)
      values (${cuenta.id}, ${colegio.id}, 'Ricardo', 'Romero')
      on conflict (auth_id, colegio_id) do update set nombres = excluded.nombres
      returning id`;

    const [rol] = await tx`
      insert into roles (colegio_id, nombre, descripcion)
      values (${colegio.id}, 'Director', 'Administra el colegio')
      on conflict (colegio_id, nombre) do update set descripcion = excluded.descripcion
      returning id`;

    await tx`
      insert into usuario_roles (usuario_id, rol_id, colegio_id)
      values (${usuario.id}, ${rol.id}, ${colegio.id})
      on conflict do nothing`;

    console.log("Datos de prueba creados:", { colegio: colegio.id, usuario: usuario.id, rol: rol.id });
  });
} catch (error) {
  console.error("Error:", error.message);
} finally {
  await sql.end();
}