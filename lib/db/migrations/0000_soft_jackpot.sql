CREATE TABLE "colegios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nombre" text NOT NULL,
	"subdominio" text NOT NULL,
	"logo_url" text,
	"activo" boolean DEFAULT true NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	"actualizado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "colegios_subdominio_unique" UNIQUE("subdominio")
);
--> statement-breakpoint
ALTER TABLE "colegios" ENABLE ROW LEVEL SECURITY;