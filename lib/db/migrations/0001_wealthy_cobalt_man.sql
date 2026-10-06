CREATE TABLE "roles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"colegio_id" uuid NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_colegio_nombre_unico" UNIQUE("colegio_id","nombre")
);
--> statement-breakpoint
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "usuario_roles" (
	"usuario_id" uuid NOT NULL,
	"rol_id" uuid NOT NULL,
	"colegio_id" uuid NOT NULL,
	CONSTRAINT "usuario_roles_usuario_id_rol_id_pk" PRIMARY KEY("usuario_id","rol_id")
);
--> statement-breakpoint
ALTER TABLE "usuario_roles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"auth_id" uuid NOT NULL,
	"colegio_id" uuid NOT NULL,
	"nombres" text NOT NULL,
	"apellidos" text NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "usuarios_auth_colegio_unico" UNIQUE("auth_id","colegio_id")
);
--> statement-breakpoint
ALTER TABLE "usuarios" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "roles" ADD CONSTRAINT "roles_colegio_id_colegios_id_fk" FOREIGN KEY ("colegio_id") REFERENCES "public"."colegios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_rol_id_roles_id_fk" FOREIGN KEY ("rol_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuario_roles" ADD CONSTRAINT "usuario_roles_colegio_id_colegios_id_fk" FOREIGN KEY ("colegio_id") REFERENCES "public"."colegios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_auth_id_users_id_fk" FOREIGN KEY ("auth_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_colegio_id_colegios_id_fk" FOREIGN KEY ("colegio_id") REFERENCES "public"."colegios"("id") ON DELETE no action ON UPDATE no action;