-- ============================================================================
--  Sakina Art Blog – database for the studio admin
--  Run this ONCE:  Supabase dashboard  ->  SQL Editor  ->  New query  ->  paste  ->  Run
--  (It is safe to run again – it drops and re-creates its own policies.)
--
--  Who can do what:
--    * Everyone (the public website)  -> can READ listings that are marked visible, and see the photos.
--    * Only the admin account         -> can read hidden listings, add, edit, delete, and upload photos.
--  The admin account is identified by its email address. If you change the admin email,
--  change it in the 8 places below (search for sakinamurtaza004@gmail.com) and in js/config.js.
-- ============================================================================

-- ---------- the listings table ----------
create table if not exists public.listings (
  id             bigint generated always as identity primary key,
  title          text        not null,
  category       text        not null check (category in ('paintings','resin','tshirts','decor','gifting')),
  description    text        not null default '',
  price          numeric(12,2),
  price_type     text        not null default 'fixed' check (price_type in ('fixed','from','contact')),
  size           text        not null default '',
  medium         text        not null default '',
  images         text[]      not null default '{}',   -- public photo links; the first one is the cover
  visible        boolean     not null default true,
  one_of_a_kind  boolean     not null default false,
  created_at     timestamptz not null default now()
);

alter table public.listings enable row level security;

drop policy if exists "Visitors can see visible listings" on public.listings;
create policy "Visitors can see visible listings"
  on public.listings for select to anon, authenticated
  using (visible = true);

drop policy if exists "Admin can see every listing" on public.listings;
create policy "Admin can see every listing"
  on public.listings for select to authenticated
  using ((auth.jwt() ->> 'email') = 'sakinamurtaza004@gmail.com');

drop policy if exists "Admin can add listings" on public.listings;
create policy "Admin can add listings"
  on public.listings for insert to authenticated
  with check ((auth.jwt() ->> 'email') = 'sakinamurtaza004@gmail.com');

drop policy if exists "Admin can edit listings" on public.listings;
create policy "Admin can edit listings"
  on public.listings for update to authenticated
  using ((auth.jwt() ->> 'email') = 'sakinamurtaza004@gmail.com')
  with check ((auth.jwt() ->> 'email') = 'sakinamurtaza004@gmail.com');

drop policy if exists "Admin can delete listings" on public.listings;
create policy "Admin can delete listings"
  on public.listings for delete to authenticated
  using ((auth.jwt() ->> 'email') = 'sakinamurtaza004@gmail.com');

grant select on public.listings to anon;
grant select, insert, update, delete on public.listings to authenticated;

-- ---------- the photo storage bucket ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('listing-images', 'listing-images', true, 5242880,
        array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update
  set public = true,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can view listing photos" on storage.objects;
create policy "Anyone can view listing photos"
  on storage.objects for select to public
  using (bucket_id = 'listing-images');

drop policy if exists "Admin can upload listing photos" on storage.objects;
create policy "Admin can upload listing photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'listing-images' and (auth.jwt() ->> 'email') = 'sakinamurtaza004@gmail.com');

drop policy if exists "Admin can replace listing photos" on storage.objects;
create policy "Admin can replace listing photos"
  on storage.objects for update to authenticated
  using (bucket_id = 'listing-images' and (auth.jwt() ->> 'email') = 'sakinamurtaza004@gmail.com');

drop policy if exists "Admin can delete listing photos" on storage.objects;
create policy "Admin can delete listing photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'listing-images' and (auth.jwt() ->> 'email') = 'sakinamurtaza004@gmail.com');
