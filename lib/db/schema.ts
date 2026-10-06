import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const colegios = pgTable("colegios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  subdominio: text("subdominio").notNull().unique(),
  logo_url: text("logo_url"),
  activo: boolean("activo").notNull().default(true),
  creado_en: timestamp("creado_en", { withTimezone: true }).notNull().defaultNow(),
  actualizado_en: timestamp("actualizado_en", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS();
