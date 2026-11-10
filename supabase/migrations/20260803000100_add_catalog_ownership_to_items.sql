alter table public.items
  add column if not exists catalog_item_id text;

create unique index if not exists items_user_catalog_item_unique_idx
  on public.items (user_id, catalog_item_id)
  where catalog_item_id is not null;

create index if not exists items_user_category_idx
  on public.items (user_id, category);
