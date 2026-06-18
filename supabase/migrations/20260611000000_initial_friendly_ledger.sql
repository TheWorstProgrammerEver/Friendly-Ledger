create extension if not exists pgcrypto with schema extensions;

create type public.group_member_status as enum ('active', 'invited');
create type public.invitation_status as enum ('pending', 'accepted');
create type public.entry_shortcut_effect as enum ('positive', 'negative');
create type public.recurring_frequency as enum ('weekly', 'fortnightly', 'monthly');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  email text not null,
  created_date date not null default current_date,
  constraint profiles_display_name_not_blank check (length(trim(display_name)) > 0),
  constraint profiles_email_not_blank check (length(trim(email)) > 0),
  constraint profiles_email_is_lowercase check (email = lower(email))
);

create table public.groups (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  created_by_profile_id uuid not null default auth.uid() references public.profiles(id),
  created_date date not null default current_date,
  constraint groups_name_not_blank check (length(trim(name)) > 0)
);

create table public.group_members (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  status public.group_member_status not null default 'invited',
  created_date date not null default current_date,
  constraint group_members_name_not_blank check (length(trim(name)) > 0),
  constraint group_members_email_not_blank check (length(trim(email)) > 0),
  constraint group_members_email_is_lowercase check (email = lower(email)),
  constraint group_members_active_profile check (
    status <> 'active'::public.group_member_status or profile_id is not null
  )
);

create unique index group_members_group_email_key
  on public.group_members (group_id, email);

create unique index group_members_group_profile_key
  on public.group_members (group_id, profile_id)
  where profile_id is not null;

create table public.group_invitations (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  email text not null,
  status public.invitation_status not null default 'pending',
  invited_date date not null default current_date,
  accepted_date date,
  accepted_by_profile_id uuid references public.profiles(id) on delete set null,
  constraint group_invitations_email_not_blank check (length(trim(email)) > 0),
  constraint group_invitations_email_is_lowercase check (email = lower(email)),
  constraint group_invitations_acceptance_consistent check (
    (
      status = 'pending'::public.invitation_status
      and accepted_date is null
      and accepted_by_profile_id is null
    )
    or (
      status = 'accepted'::public.invitation_status
      and accepted_date is not null
      and accepted_by_profile_id is not null
    )
  )
);

create unique index group_invitations_pending_group_email_key
  on public.group_invitations (group_id, email)
  where status = 'pending'::public.invitation_status;

create table public.ledger_entries (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  entry_date date not null,
  description text not null,
  category text not null,
  amount_cents integer not null,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  created_by_name text,
  created_date date not null default current_date,
  constraint ledger_entries_amount_non_zero check (amount_cents <> 0),
  constraint ledger_entries_description_not_blank check (length(trim(description)) > 0),
  constraint ledger_entries_category_not_blank check (length(trim(category)) > 0)
);

create index ledger_entries_group_entry_date_idx
  on public.ledger_entries (group_id, entry_date desc, created_date desc);

create table public.entry_shortcuts (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  label text not null,
  emoji text not null default '⚡',
  description text not null,
  category text not null,
  effect public.entry_shortcut_effect not null,
  created_date date not null default current_date,
  constraint entry_shortcuts_label_not_blank check (length(trim(label)) > 0),
  constraint entry_shortcuts_emoji_not_blank check (length(trim(emoji)) > 0),
  constraint entry_shortcuts_emoji_length check (char_length(emoji) <= 16),
  constraint entry_shortcuts_description_not_blank check (length(trim(description)) > 0),
  constraint entry_shortcuts_category_not_blank check (length(trim(category)) > 0)
);

create index entry_shortcuts_group_label_idx
  on public.entry_shortcuts (group_id, lower(label));

create table public.recurring_items (
  id uuid primary key default extensions.gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  title text not null,
  category text not null,
  amount_cents integer not null,
  frequency public.recurring_frequency not null,
  start_date date not null,
  end_date date,
  active boolean not null default true,
  created_date date not null default current_date,
  constraint recurring_items_amount_non_zero check (amount_cents <> 0),
  constraint recurring_items_title_not_blank check (length(trim(title)) > 0),
  constraint recurring_items_category_not_blank check (length(trim(category)) > 0),
  constraint recurring_items_date_range check (end_date is null or end_date >= start_date)
);

create index recurring_items_group_active_idx
  on public.recurring_items (group_id, active, start_date);

create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.current_user_created_group(group_id_to_check uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.groups
    where id = group_id_to_check
      and created_by_profile_id = auth.uid()
  );
$$;

create or replace function public.current_user_is_group_member(group_id_to_check uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.group_members
    where group_id = group_id_to_check
      and profile_id = auth.uid()
      and status = 'active'::public.group_member_status
  );
$$;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invitations enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.entry_shortcuts enable row level security;
alter table public.recurring_items enable row level security;

create policy "Users can read their own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Active members can read groups"
on public.groups
for select
to authenticated
using (public.current_user_is_group_member(id));

create policy "Users can create groups for themselves"
on public.groups
for insert
to authenticated
with check (created_by_profile_id = auth.uid());

create policy "Active members can update groups"
on public.groups
for update
to authenticated
using (public.current_user_is_group_member(id))
with check (public.current_user_is_group_member(id));

create policy "Creators can delete groups"
on public.groups
for delete
to authenticated
using (created_by_profile_id = auth.uid());

create policy "Relevant users can read group members"
on public.group_members
for select
to authenticated
using (
  public.current_user_is_group_member(group_id)
  or profile_id = auth.uid()
  or (status = 'invited'::public.group_member_status and email = public.current_user_email())
);

create policy "Members can add group members"
on public.group_members
for insert
to authenticated
with check (
  public.current_user_is_group_member(group_id)
  or public.current_user_created_group(group_id)
);

create policy "Members can update group members"
on public.group_members
for update
to authenticated
using (
  public.current_user_is_group_member(group_id)
  or email = public.current_user_email()
)
with check (
  public.current_user_is_group_member(group_id)
  or (profile_id = auth.uid() and email = public.current_user_email())
);

create policy "Members can remove group members"
on public.group_members
for delete
to authenticated
using (public.current_user_is_group_member(group_id));

create policy "Relevant users can read invitations"
on public.group_invitations
for select
to authenticated
using (
  public.current_user_is_group_member(group_id)
  or email = public.current_user_email()
);

create policy "Members can create invitations"
on public.group_invitations
for insert
to authenticated
with check (
  public.current_user_is_group_member(group_id)
  or public.current_user_created_group(group_id)
);

create policy "Relevant users can update invitations"
on public.group_invitations
for update
to authenticated
using (
  public.current_user_is_group_member(group_id)
  or email = public.current_user_email()
)
with check (
  public.current_user_is_group_member(group_id)
  or (accepted_by_profile_id = auth.uid() and email = public.current_user_email())
);

create policy "Members can delete invitations"
on public.group_invitations
for delete
to authenticated
using (public.current_user_is_group_member(group_id));

create policy "Members can read ledger entries"
on public.ledger_entries
for select
to authenticated
using (public.current_user_is_group_member(group_id));

create policy "Members can create ledger entries"
on public.ledger_entries
for insert
to authenticated
with check (
  public.current_user_is_group_member(group_id)
  and (created_by_profile_id is null or created_by_profile_id = auth.uid())
);

create policy "Members can update ledger entries"
on public.ledger_entries
for update
to authenticated
using (public.current_user_is_group_member(group_id))
with check (
  public.current_user_is_group_member(group_id)
  and (created_by_profile_id is null or created_by_profile_id = auth.uid())
);

create policy "Members can delete ledger entries"
on public.ledger_entries
for delete
to authenticated
using (public.current_user_is_group_member(group_id));

create policy "Members can read entry shortcuts"
on public.entry_shortcuts
for select
to authenticated
using (public.current_user_is_group_member(group_id));

create policy "Members can create entry shortcuts"
on public.entry_shortcuts
for insert
to authenticated
with check (public.current_user_is_group_member(group_id));

create policy "Members can update entry shortcuts"
on public.entry_shortcuts
for update
to authenticated
using (public.current_user_is_group_member(group_id))
with check (public.current_user_is_group_member(group_id));

create policy "Members can delete entry shortcuts"
on public.entry_shortcuts
for delete
to authenticated
using (public.current_user_is_group_member(group_id));

create policy "Members can read recurring items"
on public.recurring_items
for select
to authenticated
using (public.current_user_is_group_member(group_id));

create policy "Members can create recurring items"
on public.recurring_items
for insert
to authenticated
with check (public.current_user_is_group_member(group_id));

create policy "Members can update recurring items"
on public.recurring_items
for update
to authenticated
using (public.current_user_is_group_member(group_id))
with check (public.current_user_is_group_member(group_id));

create policy "Members can delete recurring items"
on public.recurring_items
for delete
to authenticated
using (public.current_user_is_group_member(group_id));

revoke execute on function public.current_user_email() from public, anon;
revoke execute on function public.current_user_created_group(uuid) from public, anon;
revoke execute on function public.current_user_is_group_member(uuid) from public, anon;

grant usage on schema public to authenticated;
grant usage on type public.group_member_status to authenticated;
grant usage on type public.invitation_status to authenticated;
grant usage on type public.entry_shortcut_effect to authenticated;
grant usage on type public.recurring_frequency to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.groups to authenticated;
grant select, insert, update, delete on public.group_members to authenticated;
grant select, insert, update, delete on public.group_invitations to authenticated;
grant select, insert, update, delete on public.ledger_entries to authenticated;
grant select, insert, update, delete on public.entry_shortcuts to authenticated;
grant select, insert, update, delete on public.recurring_items to authenticated;
grant execute on function public.current_user_email() to authenticated;
grant execute on function public.current_user_created_group(uuid) to authenticated;
grant execute on function public.current_user_is_group_member(uuid) to authenticated;
