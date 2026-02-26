-- ============================================================
-- InvenTrack — Schema completo
-- Ejecutar en: Supabase > SQL Editor
-- ============================================================

-- ------------------------------------------------------------
-- TABLAS
-- ------------------------------------------------------------

create table sedes (
  id          uuid        default gen_random_uuid() primary key,
  nombre      text        not null,
  ciudad      text        not null,
  direccion   text,
  created_at  timestamp   default now()
);

create table items (
  id           uuid           default gen_random_uuid() primary key,
  codigo       text           unique not null,
  nombre       text           not null,
  descripcion  text,
  categoria    text,
  precio       numeric(10,2)  default 0,
  stock        integer        default 0,
  stock_minimo integer        default 5,
  sede_id      uuid           references sedes(id) on delete set null,
  imagen_url   text,
  created_at   timestamp      default now(),
  updated_at   timestamp      default now()
);

create table movimientos (
  id          uuid      default gen_random_uuid() primary key,
  item_id     uuid      references items(id) on delete cascade,
  tipo        text      check (tipo in ('ENTRADA', 'SALIDA')),
  cantidad    integer   not null,
  motivo      text,
  fecha       timestamp default now(),
  usuario_id  uuid      references auth.users(id) on delete set null
);

-- ------------------------------------------------------------
-- TRIGGER: updated_at automático en items
-- ------------------------------------------------------------

create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger items_updated_at
  before update on items
  for each row execute function update_updated_at();

-- ------------------------------------------------------------
-- FUNCIÓN: registrar movimiento y actualizar stock (atómica)
-- ------------------------------------------------------------

create or replace function registrar_movimiento(
  p_item_id    uuid,
  p_tipo       text,
  p_cantidad   integer,
  p_motivo     text,
  p_usuario_id uuid
) returns void as $$
begin
  insert into movimientos (item_id, tipo, cantidad, motivo, usuario_id)
  values (p_item_id, p_tipo, p_cantidad, p_motivo, p_usuario_id);

  if p_tipo = 'ENTRADA' then
    update items set stock = stock + p_cantidad where id = p_item_id;

  elsif p_tipo = 'SALIDA' then
    if (select stock from items where id = p_item_id) < p_cantidad then
      raise exception 'Stock insuficiente para el item %', p_item_id;
    end if;
    update items set stock = stock - p_cantidad where id = p_item_id;
  end if;
end;
$$ language plpgsql;

-- ------------------------------------------------------------
-- ÍNDICES
-- ------------------------------------------------------------

create index on items(sede_id);
create index on items(categoria);
create index on items(codigo);
create index on movimientos(item_id);
create index on movimientos(fecha);

-- ------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ------------------------------------------------------------

alter table sedes       enable row level security;
alter table items       enable row level security;
alter table movimientos enable row level security;

-- Sedes
create policy "Autenticados pueden leer sedes"
  on sedes for select
  using (auth.role() = 'authenticated');

create policy "Autenticados pueden insertar sedes"
  on sedes for insert
  with check (auth.role() = 'authenticated');

create policy "Autenticados pueden actualizar sedes"
  on sedes for update
  using (auth.role() = 'authenticated');

create policy "Autenticados pueden eliminar sedes"
  on sedes for delete
  using (auth.role() = 'authenticated');

-- Items
create policy "Autenticados pueden leer items"
  on items for select
  using (auth.role() = 'authenticated');

create policy "Autenticados pueden insertar items"
  on items for insert
  with check (auth.role() = 'authenticated');

create policy "Autenticados pueden actualizar items"
  on items for update
  using (auth.role() = 'authenticated');

create policy "Autenticados pueden eliminar items"
  on items for delete
  using (auth.role() = 'authenticated');

-- Movimientos
create policy "Autenticados pueden leer movimientos"
  on movimientos for select
  using (auth.role() = 'authenticated');

create policy "Autenticados pueden insertar movimientos"
  on movimientos for insert
  with check (auth.role() = 'authenticated');
