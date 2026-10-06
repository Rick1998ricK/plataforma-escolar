-- Custom SQL migration file, put your code below! --
create or replace function public.hook_token_acceso(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  ficha record;
  lista_roles jsonb;
begin
  claims := event -> 'claims';

  select u.id, u.colegio_id into ficha
  from public.usuarios u
  where u.auth_id = (event ->> 'user_id')::uuid
    and u.activo = true
  order by u.creado_en
  limit 1;

  if found then
    select coalesce(jsonb_agg(r.nombre), '[]'::jsonb) into lista_roles
    from public.usuario_roles ur
    join public.roles r on r.id = ur.rol_id
    where ur.usuario_id = ficha.id;

    claims := jsonb_set(claims, '{colegio_id}', to_jsonb(ficha.colegio_id));
    claims := jsonb_set(claims, '{usuario_id}', to_jsonb(ficha.id));
    claims := jsonb_set(claims, '{roles}', lista_roles);
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;
--> statement-breakpoint
grant usage on schema public to supabase_auth_admin;
--> statement-breakpoint
grant execute on function public.hook_token_acceso to supabase_auth_admin;
--> statement-breakpoint
revoke execute on function public.hook_token_acceso from authenticated, anon, public;
--> statement-breakpoint
grant select on public.usuarios, public.roles, public.usuario_roles to supabase_auth_admin;
--> statement-breakpoint
create policy "auth_admin_lee_usuarios" on public.usuarios
  for select to supabase_auth_admin using (true);
--> statement-breakpoint
create policy "auth_admin_lee_roles" on public.roles
  for select to supabase_auth_admin using (true);
--> statement-breakpoint
create policy "auth_admin_lee_usuario_roles" on public.usuario_roles
  for select to supabase_auth_admin using (true);