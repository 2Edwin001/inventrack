-- ============================================================
-- InvenTrack — Auth setup
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- Tabla profiles vinculada a auth.users
create table if not exists profiles (
  id        uuid references auth.users(id) on delete cascade primary key,
  nombre    text,
  rol       text check (rol in ('ADMIN', 'OPERADOR')) default 'OPERADOR',
  sede_id   uuid references sedes(id) on delete set null,
  created_at timestamp default now()
);

alter table profiles enable row level security;

create policy "Usuarios ven su perfil"
  on profiles for select
  using (auth.uid() = id);

create policy "Usuarios actualizan su perfil"
  on profiles for update
  using (auth.uid() = id);

-- Trigger: crea automáticamente un profile al registrar un usuario
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, nombre)
  values (new.id, new.raw_user_meta_data->>'nombre');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================
-- Restaurar políticas RLS (requieren autenticación)
-- ============================================================

-- Eliminar políticas de acceso público si existen
drop policy if exists "Public access sedes"        on sedes;
drop policy if exists "Public access items"        on items;
drop policy if exists "Public access movimientos"  on movimientos;

-- ── Sedes ───────────────────────────────────────────────────
drop policy if exists "Autenticados pueden leer sedes"       on sedes;
drop policy if exists "Autenticados pueden insertar sedes"   on sedes;
drop policy if exists "Autenticados pueden actualizar sedes" on sedes;
drop policy if exists "Autenticados pueden eliminar sedes"   on sedes;

create policy "Autenticados pueden leer sedes"
  on sedes for select using (auth.role() = 'authenticated');
create policy "Autenticados pueden insertar sedes"
  on sedes for insert with check (auth.role() = 'authenticated');
create policy "Autenticados pueden actualizar sedes"
  on sedes for update using (auth.role() = 'authenticated');
create policy "Autenticados pueden eliminar sedes"
  on sedes for delete using (auth.role() = 'authenticated');

-- ── Items ────────────────────────────────────────────────────
drop policy if exists "Autenticados pueden leer items"       on items;
drop policy if exists "Autenticados pueden insertar items"   on items;
drop policy if exists "Autenticados pueden actualizar items" on items;
drop policy if exists "Autenticados pueden eliminar items"   on items;

create policy "Autenticados pueden leer items"
  on items for select using (auth.role() = 'authenticated');
create policy "Autenticados pueden insertar items"
  on items for insert with check (auth.role() = 'authenticated');
create policy "Autenticados pueden actualizar items"
  on items for update using (auth.role() = 'authenticated');
create policy "Autenticados pueden eliminar items"
  on items for delete using (auth.role() = 'authenticated');

-- ── Movimientos ──────────────────────────────────────────────
drop policy if exists "Autenticados pueden leer movimientos"     on movimientos;
drop policy if exists "Autenticados pueden insertar movimientos" on movimientos;

create policy "Autenticados pueden leer movimientos"
  on movimientos for select using (auth.role() = 'authenticated');
create policy "Autenticados pueden insertar movimientos"
  on movimientos for insert with check (auth.role() = 'authenticated');
