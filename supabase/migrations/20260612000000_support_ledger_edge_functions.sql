alter table public.groups
  drop constraint groups_created_by_profile_id_fkey,
  add constraint groups_created_by_profile_id_fkey
    foreign key (created_by_profile_id)
    references public.profiles(id)
    on delete cascade;

drop policy "Active members can read groups" on public.groups;

create policy "Relevant users can read groups"
on public.groups
for select
to authenticated
using (
  public.current_user_is_group_member(id)
  or exists (
    select 1
    from public.group_invitations
    where group_invitations.group_id = groups.id
      and group_invitations.email = public.current_user_email()
      and group_invitations.status = 'pending'::public.invitation_status
  )
);
