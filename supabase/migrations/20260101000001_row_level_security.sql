-- Row Level Security
--
-- products: readable by anyone (storefront catalog); insertable only by
-- authenticated admins (used by the /admin CSV bulk importer).
-- orders: insertable by anyone (checkout form), but not readable/editable
-- by the public — only visible via the Supabase dashboard/service role.

alter table public.products enable row level security;
alter table public.orders enable row level security;

create policy "Public can read products" on public.products
  for select using (true);

create policy "Authenticated users can insert products" on public.products
  for insert
  to authenticated
  with check (true);

create policy "Public can submit orders" on public.orders
  for insert with check (true);
