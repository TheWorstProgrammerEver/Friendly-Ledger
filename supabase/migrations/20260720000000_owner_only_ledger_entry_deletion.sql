drop policy if exists "Members can delete ledger entries" on public.ledger_entries;

create policy "Creators can delete ledger entries"
on public.ledger_entries
for delete
to authenticated
using (public.current_user_created_group(group_id));
