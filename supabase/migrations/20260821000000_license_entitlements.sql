create table if not exists public.licenses (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  tier text not null check (tier in ('retail', 'beta')),
  status text not null default 'active' check (status in ('active', 'redeemed', 'expired', 'revoked')),
  redeemed_by uuid references auth.users(id) on delete set null,
  redeemed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  license_id uuid primary key references public.licenses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  tier text not null check (tier in ('retail', 'beta')),
  status text not null default 'active' check (status in ('active', 'expired', 'revoked')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_hash text not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (user_id, device_hash)
);

create index if not exists licenses_status_idx on public.licenses(status);
create index if not exists entitlements_user_id_idx on public.entitlements(user_id);

alter table public.licenses enable row level security;
alter table public.entitlements enable row level security;
alter table public.devices enable row level security;

create or replace function public.redeem_license(
  p_key_hash text,
  p_user_id uuid,
  p_now timestamptz
)
returns table (
  license_id uuid,
  user_id uuid,
  tier text,
  status text,
  expires_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_license public.licenses%rowtype;
begin
  select * into selected_license
  from public.licenses
  where key_hash = p_key_hash
  for update;

  if not found then
    raise exception 'license_not_redeemable';
  end if;

  if selected_license.expires_at is not null and selected_license.expires_at <= p_now then
    update public.licenses set status = 'expired' where id = selected_license.id;
    raise exception 'license_not_redeemable';
  end if;

  if selected_license.status = 'redeemed' and selected_license.redeemed_by = p_user_id then
    return query
      select e.license_id, e.user_id, e.tier, e.status, e.expires_at
      from public.entitlements e
      where e.license_id = selected_license.id;
    return;
  end if;

  if selected_license.status <> 'active' then
    raise exception 'license_not_redeemable';
  end if;

  update public.licenses
  set status = 'redeemed', redeemed_by = p_user_id, redeemed_at = p_now
  where id = selected_license.id;

  insert into public.entitlements (license_id, user_id, tier, status, expires_at)
  values (selected_license.id, p_user_id, selected_license.tier, 'active', selected_license.expires_at)
  on conflict (license_id) do update
  set user_id = excluded.user_id,
      tier = excluded.tier,
      status = excluded.status,
      expires_at = excluded.expires_at;

  return query
    select e.license_id, e.user_id, e.tier, e.status, e.expires_at
    from public.entitlements e
    where e.license_id = selected_license.id;
end;
$$;

revoke all on function public.redeem_license(text, uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.redeem_license(text, uuid, timestamptz) to service_role;
