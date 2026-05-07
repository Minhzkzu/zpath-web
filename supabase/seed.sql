-- ZPATH local/dev seed entrypoint.
-- This file is executed by `supabase db reset` after migrations.
-- Keep seeds idempotent (safe to run multiple times).

-- Template (example)
-- Add local-only reference data using an idempotent UPSERT pattern:
--
-- insert into public.some_table (id, name)
-- values ('00000000-0000-0000-0000-000000000001', 'Example')
-- on conflict (id) do update set name = excluded.name;

