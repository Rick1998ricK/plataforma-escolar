CREATE TABLE "rol_permisos" (
	"rol_id" uuid NOT NULL,
	"permiso" text NOT NULL,
	"colegio_id" uuid NOT NULL,
	CONSTRAINT "rol_permisos_rol_id_permiso_pk" PRIMARY KEY("rol_id","permiso")
);
--> statement-breakpoint
ALTER TABLE "rol_permisos" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_rol_id_roles_id_fk" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rol_permisos" ADD CONSTRAINT "rol_permisos_colegio_id_colegios_id_fk" FOREIGN KEY ("colegio_id") REFERENCES "public"."colegios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE POLICY "rol_permisos_ver_de_mi_colegio" ON "rol_permisos" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("rol_permisos"."colegio_id" = ((select auth.jwt()) ->> 'colegio_id')::uuid);