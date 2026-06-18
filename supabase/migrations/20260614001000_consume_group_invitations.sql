delete from public.group_invitations
where status = 'accepted'::public.invitation_status;

drop policy "Relevant users can update invitations" on public.group_invitations;
drop policy "Members can delete invitations" on public.group_invitations;

drop index public.group_invitations_pending_group_email_key;

alter table public.group_invitations
  drop constraint group_invitations_acceptance_consistent,
  drop column accepted_date,
  drop column accepted_by_profile_id,
  drop column status;

create unique index group_invitations_group_email_key
  on public.group_invitations (group_id, email);

drop type public.invitation_status;

create policy "Relevant users can delete invitations"
on public.group_invitations
for delete
to authenticated
using (
  public.current_user_is_group_member(group_id)
  or email = public.current_user_email()
);

create policy "Invitees can remove own invited member"
on public.group_members
for delete
to authenticated
using (
  status = 'invited'::public.group_member_status
  and email = public.current_user_email()
);
