-- Rutgers-only sign-up.
-- Blocks creation of any auth user whose email is not rutgers.edu or a
-- subdomain of it (netid@scarletmail.rutgers.edu, first.last@rutgers.edu,
-- rwjms.rutgers.edu, ...).
-- This runs inside Supabase Auth, so it cannot be bypassed by calling
-- supabase.auth.signUp directly with the public anon key.
--
-- Also turn on "Confirm email" in Supabase Auth settings so users must prove
-- they own the address. Without it, anyone can type a made-up scarletmail
-- address.

create or replace function public.is_rutgers_email(email_to_check text)
returns boolean
language sql
immutable
as $$
  select coalesce(
    lower(split_part(email_to_check, '@', 2)) = 'rutgers.edu'
      or lower(split_part(email_to_check, '@', 2)) like '%.rutgers.edu',
    false
  );
$$;

create or replace function public.enforce_rutgers_email_domain()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_rutgers_email(new.email) then
    raise exception 'Sign-up is limited to Rutgers email addresses (netid@scarletmail.rutgers.edu or first.last@rutgers.edu).'
      using errcode = 'check_violation';
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_rutgers_email_domain_on_insert on auth.users;
create trigger enforce_rutgers_email_domain_on_insert
  before insert on auth.users
  for each row execute function public.enforce_rutgers_email_domain();

-- Stop users from switching an existing account to a non-Rutgers address.
drop trigger if exists enforce_rutgers_email_domain_on_update on auth.users;
create trigger enforce_rutgers_email_domain_on_update
  before update of email on auth.users
  for each row
  when (new.email is distinct from old.email)
  execute function public.enforce_rutgers_email_domain();
