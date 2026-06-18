alter table public.entry_shortcuts
  add column default_amount_cents integer,
  add constraint entry_shortcuts_default_amount_not_zero
    check (default_amount_cents is null or default_amount_cents <> 0);
