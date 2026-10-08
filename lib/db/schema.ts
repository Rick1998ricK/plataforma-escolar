import { sql } from "drizzle-orm";
import { boolean, pgPolicy, pgTable, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import { authenticatedRole, authUsers } from "drizzle-orm/supabase";

// Lee el colegio_id escrito en la pulsera (JWT) de quien hace la consulta
const colegioDelToken = sql`((select auth.jwt()) ->> 'colegio_id')::uuid`;

// Tabla padre: cada fila es una institucion (colegio o CEBA)
export const colegios = pgTable(
  "colegios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    nombre: text("nombre").notNull(),
    subdominio: text("subdominio").notNull().unique(),
    logo_url: text("logo_url"),
    activo: boolean("activo").notNull().default(true),
    creado_en: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
    actualizado_en: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabla) => [
    pgPolicy("colegios_ver_el_propio", {
      for: "select",
      to: authenticatedRole,
      using: sql`${tabla.id} = ${colegioDelToken}`,
    }),
  ],
).enableRLS();

// Ficha de una persona dentro de un colegio
export const usuarios = pgTable(
  "usuarios",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    auth_id: uuid("auth_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    colegio_id: uuid("colegio_id").notNull().references(() => colegios.id),
    nombres: text("nombres").notNull(),
    apellidos: text("apellidos").notNull(),
    activo: boolean("activo").notNull().default(true),
    creado_en: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabla) => [
    unique("usuarios_auth_colegio_unico").on(tabla.auth_id, tabla.colegio_id),
    pgPolicy("usuarios_ver_de_mi_colegio", {
      for: "select",
      to: authenticatedRole,
      using: sql`${tabla.colegio_id} = ${colegioDelToken}`,
    }),
  ],
).enableRLS();

// Cargos que define cada colegio (Director, Secretaria, Docente...)
export const roles = pgTable(
  "roles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    colegio_id: uuid("colegio_id").notNull().references(() => colegios.id),
    nombre: text("nombre").notNull(),
    descripcion: text("descripcion"),
    creado_en: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabla) => [
    unique("roles_colegio_nombre_unico").on(tabla.colegio_id, tabla.nombre),
    pgPolicy("roles_ver_de_mi_colegio", {
      for: "select",
      to: authenticatedRole,
      using: sql`${tabla.colegio_id} = ${colegioDelToken}`,
    }),
  ],
).enableRLS();

// Que usuario tiene que cargo
export const usuario_roles = pgTable(
  "usuario_roles",
  {
    usuario_id: uuid("usuario_id").notNull().references(() => usuarios.id, { onDelete: "cascade" }),
    rol_id: uuid("rol_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    colegio_id: uuid("colegio_id").notNull().references(() => colegios.id),
  },
  (tabla) => [
    primaryKey({ columns: [tabla.usuario_id, tabla.rol_id] }),
    pgPolicy("usuario_roles_ver_de_mi_colegio", {
      for: "select",
      to: authenticatedRole,
      using: sql`${tabla.colegio_id} = ${colegioDelToken}`,
    }),
  ],
).enableRLS();

// Que acciones puede hacer cada rol
export const rol_permisos = pgTable(
  "rol_permisos",
  {
    rol_id: uuid("rol_id").notNull().references(() => roles.id, { onDelete: "cascade" }),
    permiso: text("permiso").notNull(),
    colegio_id: uuid("colegio_id").notNull().references(() => colegios.id),
  },
  (tabla) => [
    primaryKey({ columns: [tabla.rol_id, tabla.permiso] }),
    pgPolicy("rol_permisos_ver_de_mi_colegio", {
      for: "select",
      to: authenticatedRole,
      using: sql`${tabla.colegio_id} = ${colegioDelToken}`,
    }),
  ],
).enableRLS();