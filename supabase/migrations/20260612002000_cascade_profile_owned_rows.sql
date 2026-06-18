alter table public.group_members
  drop constraint group_members_profile_id_fkey,
  add constraint group_members_profile_id_fkey
    foreign key (profile_id)
    references public.profiles(id)
    on delete cascade;

alter table public.group_invitations
  drop constraint group_invitations_accepted_by_profile_id_fkey,
  add constraint group_invitations_accepted_by_profile_id_fkey
    foreign key (accepted_by_profile_id)
    references public.profiles(id)
    on delete cascade;
