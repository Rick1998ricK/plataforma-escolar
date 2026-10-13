CREATE TYPE "public"."estado_periodo" AS ENUM('planificado', 'activo', 'cerrado');--> statement-breakpoint
CREATE TYPE "public"."modalidad" AS ENUM('ebr', 'eba');--> statement-breakpoint
CREATE TABLE "etapas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colegio_id" uuid NOT NULL,
	"periodo_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"modalidad" "modalidad" NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "etapas_periodo_nombre_unico" UNIQUE("periodo_id","nombre"),
	CONSTRAINT "etapas_id_colegio_unico" UNIQUE("id","colegio_id")
);
--> statement-breakpoint
ALTER TABLE "etapas" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "grados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colegio_id" uuid NOT NULL,
	"etapa_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "grados_etapa_nombre_unico" UNIQUE("etapa_id","nombre"),
	CONSTRAINT "grados_id_colegio_unico" UNIQUE("id","colegio_id")
);
--> statement-breakpoint
ALTER TABLE "grados" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "periodos_academicos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colegio_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"fecha_inicio" date NOT NULL,
	"fecha_fin" date NOT NULL,
	"estado" "estado_periodo" DEFAULT 'planificado' NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "periodos_colegio_nombre_unico" UNIQUE("colegio_id","nombre"),
	CONSTRAINT "periodos_id_colegio_unico" UNIQUE("id","colegio_id"),
	CONSTRAINT "periodos_fechas_validas" CHECK ("periodos_academicos"."fecha_fin" > "periodos_academicos"."fecha_inicio")
);
--> statement-breakpoint
ALTER TABLE "periodos_academicos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "secciones" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colegio_id" uuid NOT NULL,
	"grado_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"vacantes" integer DEFAULT 30 NOT NULL,
	CONSTRAINT "secciones_grado_nombre_unico" UNIQUE("grado_id","nombre"),
	CONSTRAINT "secciones_id_colegio_unico" UNIQUE("id","colegio_id"),
	CONSTRAINT "secciones_vacantes_validas" CHECK ("secciones"."vacantes" >= 0)
);
--> statement-breakpoint
ALTER TABLE "secciones" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "etapas" ADD CONSTRAINT "etapas_colegio_id_colegios_id_fk" FOREIGN KEY ("colegio_id") REFERENCES "public"."colegios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "etapas" ADD CONSTRAINT "etapas_periodo_fk" FOREIGN KEY ("periodo_id","colegio_id") REFERENCES "public"."periodos_academicos"("id","colegio_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grados" ADD CONSTRAINT "grados_colegio_id_colegios_id_fk" FOREIGN KEY ("colegio_id") REFERENCES "public"."colegios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grados" ADD CONSTRAINT "grados_etapa_fk" FOREIGN KEY ("etapa_id","colegio_id") REFERENCES "public"."etapas"("id","colegio_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "periodos_academicos" ADD CONSTRAINT "periodos_academicos_colegio_id_colegios_id_fk" FOREIGN KEY ("colegio_id") REFERENCES "public"."colegios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_colegio_id_colegios_id_fk" FOREIGN KEY ("colegio_id") REFERENCES "public"."colegios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "secciones" ADD CONSTRAINT "secciones_grado_fk" FOREIGN KEY ("grado_id","colegio_id") REFERENCES "public"."grados"("id","colegio_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "etapas_ver_de_mi_colegio" ON "etapas" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("etapas"."colegio_id" = ((select auth.jwt()) ->> 'colegio_id')::uuid);--> statement-breakpoint
CREATE POLICY "grados_ver_de_mi_colegio" ON "grados" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("grados"."colegio_id" = ((select auth.jwt()) ->> 'colegio_id')::uuid);--> statement-breakpoint
CREATE POLICY "periodos_ver_de_mi_colegio" ON "periodos_academicos" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("periodos_academicos"."colegio_id" = ((select auth.jwt()) ->> 'colegio_id')::uuid);--> statement-breakpoint
CREATE POLICY "secciones_ver_de_mi_colegio" ON "secciones" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("secciones"."colegio_id" = ((select auth.jwt()) ->> 'colegio_id')::uuid);