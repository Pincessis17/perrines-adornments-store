-- Initial schema: products and orders
-- Reconstructed from the live Supabase project schema.

create table if not exists public.products (
  id bigint generated always as identity primary key,
  name text not null,
  category text not null,
  price numeric not null,
  image text
);

create table if not exists public.orders (
  order_number bigint generated always as identity primary key,
  product text not null,
  name text not null,
  email text not null,
  quantity numeric not null check (quantity > 0),
  whatsapp text,
  address text
);
