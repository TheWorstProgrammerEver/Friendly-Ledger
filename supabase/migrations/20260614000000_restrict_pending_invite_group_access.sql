alter table public.group_invitations
  add column group_name text;

update public.group_invitations
set group_name = groups.name
from public.groups
where groups.id = group_invitations.group_id;

alter table public.group_invitations
  alter column group_name set not null,
  add constraint group_invitations_group_name_not_blank check (length(trim(group_name)) > 0);

drop policy "Relevant users can read groups" on public.groups;

create policy "Active members can read groups"
on public.groups
for select
to authenticated
using (public.current_user_is_group_member(id));
