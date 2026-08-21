create or replace function public.start_beta(
  p_user_id uuid,
  p_now timestamptz,
  p_duration_days integer default 30
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
  existing_entitlement public.entitlements%rowtype;
  new_license public.licenses%rowtype;
  beta_expires_at timestamptz := p_now + make_interval(days => p_duration_days);
begin
  if p_duration_days <= 0 or p_duration_days > 90 then
    raise exception 'invalid_beta_duration';
  end if;

  select * into existing_entitlement
  from public.entitlements e
  where e.user_id = p_user_id and e.tier = 'beta'
  order by e.created_at asc
  limit 1
  for update;

  if found then
    return query
      select existing_entitlement.license_id, existing_entitlement.user_id,
        existing_entitlement.tier, existing_entitlement.status,
        existing_entitlement.expires_at;
    return;
  end if;

  insert into public.licenses (key_hash, tier, status, redeemed_by, redeemed_at, expires_at)
  values ('beta:' || p_user_id::text, 'beta', 'redeemed', p_user_id, p_now, beta_expires_at)
  returning * into new_license;

  insert into public.entitlements (license_id, user_id, tier, status, expires_at)
  values (new_license.id, p_user_id, 'beta', 'active', beta_expires_at);

  return query
    select new_license.id, p_user_id, 'beta'::text, 'active'::text, beta_expires_at;
end;
$$;

revoke all on function public.start_beta(uuid, timestamptz, integer) from public, anon, authenticated;
grant execute on function public.start_beta(uuid, timestamptz, integer) to service_role;