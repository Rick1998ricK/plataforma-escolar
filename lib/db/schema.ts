import { sql } from "drizzle-orm";
import { boolean, check, date, foreignKey, integer, pgEnum, pgPolicy, pgTable, primaryKey, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import type { AnyPgColumn } from "drizzle-orm/pg-core";
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

// ===== Estructura academica =====

// Regla de lectura que se repite en todas las tablas del colegio
const verDeMiColegio = (nombre: string, columna: AnyPgColumn) =>
  pgPolicy(nombre, {
    for: "select",
    to: authenticatedRole,
    using: sql`${columna} = ${colegioDelToken}`,
  });

export const estado_periodo = pgEnum("estado_periodo", ["planificado", "activo", "cerrado"]);
export const modalidad = pgEnum("modalidad", ["ebr", "eba"]);

// Un año lectivo (2027) o un periodo de CEBA (2027-I)
export const periodos_academicos = pgTable(
  "periodos_academicos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    colegio_id: uuid("colegio_id").notNull().references(() => colegios.id),
    nombre: text("nombre").notNull(),
    fecha_inicio: date("fecha_inicio").notNull(),
    fecha_fin: date("fecha_fin").notNull(),
    estado: estado_periodo("estado").notNull().default("planificado"),
    creado_en: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  },
  (tabla) => [
    unique("periodos_colegio_nombre_unico").on(tabla.colegio_id, tabla.nombre),
    unique("periodos_id_colegio_unico").on(tabla.id, tabla.colegio_id),
    check("periodos_fechas_validas", sql`${tabla.fecha_fin} > ${tabla.fecha_inicio}`),
    verDeMiColegio("periodos_ver_de_mi_colegio", tabla.colegio_id),
  ],
).enableRLS();

// Nivel o ciclo: "Primaria", "Ciclo Avanzado"
export const etapas = pgTable(
  "etapas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    colegio_id: uuid("colegio_id").notNull().references(() => colegios.id),
    periodo_id: uuid("periodo_id").notNull(),
    nombre: text("nombre").notNull(),
    modalidad: modalidad("modalidad").notNull(),
    orden: integer("orden").notNull().default(0),
  },
  (tabla) => [
    foreignKey({
      name: "etapas_periodo_fk",
      columns: [tabla.periodo_id, tabla.colegio_id],
      foreignColumns: [periodos_academicos.id, periodos_academicos.colegio_id],
    }).onDelete("cascade"),
    unique("etapas_periodo_nombre_unico").on(tabla.periodo_id, tabla.nombre),
    unique("etapas_id_colegio_unico").on(tabla.id, tabla.colegio_id),
    verDeMiColegio("etapas_ver_de_mi_colegio", tabla.colegio_id),
  ],
).enableRLS();

// "3er grado", "1er grado del Ciclo Avanzado"
export const grados = pgTable(
  "grados",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    colegio_id: uuid("colegio_id").notNull().references(() => colegios.id),
    etapa_id: uuid("etapa_id").notNull(),
    nombre: text("nombre").notNull(),
    orden: integer("orden").notNull().default(0),
  },
  (tabla) => [
    foreignKey({
      name: "grados_etapa_fk",
      columns: [tabla.etapa_id, tabla.colegio_id],
      foreignColumns: [etapas.id, etapas.colegio_id],
    }).onDelete("cascade"),
    unique("grados_etapa_nombre_unico").on(tabla.etapa_id, tabla.nombre),
    unique("grados_id_colegio_unico").on(tabla.id, tabla.colegio_id),
    verDeMiColegio("grados_ver_de_mi_colegio", tabla.colegio_id),
  ],
).enableRLS();

// "A", "B", con sus vacantes
export const secciones = pgTable(
  "secciones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    colegio_id: uuid("colegio_id").notNull().references(() => colegios.id),
    grado_id: uuid("grado_id").notNull(),
    nombre: text("nombre").notNull(),
    vacantes: integer("vacantes").notNull().default(30),
  },
  (tabla) => [
    foreignKey({
      name: "secciones_grado_fk",
      columns: [tabla.grado_id, tabla.colegio_id],
      foreignColumns: [grados.id, grados.colegio_id],
    }).onDelete("cascade"),
    unique("secciones_grado_nombre_unico").on(tabla.grado_id, tabla.nombre),
    unique("secciones_id_colegio_unico").on(tabla.id, tabla.colegio_id),
    check("secciones_vacantes_validas", sql`${tabla.vacantes} >= 0`),
    verDeMiColegio("secciones_ver_de_mi_colegio", tabla.colegio_id),
  ],
).enableRLS();