-- Admissions RAG (public data) using pgvector

create extension if not exists vector;

create table if not exists public.admissions_chunks (
  id uuid primary key default gen_random_uuid(),
  source_id text not null,
  source_title text not null,
  source_url text,
  school_name text,
  year int,
  chunk_index int not null,
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  embedding vector(768),
  created_at timestamptz not null default now()
);

create index if not exists admissions_chunks_source_id_idx on public.admissions_chunks (source_id);
create index if not exists admissions_chunks_school_year_idx on public.admissions_chunks (school_name, year);

-- ivfflat needs ANALYZE + enough rows; ok for later. We still create it for prod.
create index if not exists admissions_chunks_embedding_ivfflat
on public.admissions_chunks using ivfflat (embedding vector_cosine_ops) with (lists = 100);

alter table public.admissions_chunks enable row level security;

-- Public reference data: readable by anyone
drop policy if exists "admissions_chunks_select_all" on public.admissions_chunks;
create policy "admissions_chunks_select_all"
on public.admissions_chunks
for select
to anon, authenticated
using (true);

-- Writes should be done via service role only (RLS blocks anon/auth by default).

-- Vector search RPC (security invoker, respects RLS; service role bypasses anyway)
create or replace function public.match_admissions_chunks(
  query_embedding vector(768),
  match_count int default 8,
  filter jsonb default '{}'::jsonb
)
returns table (
  id uuid,
  source_id text,
  source_title text,
  source_url text,
  school_name text,
  year int,
  chunk_index int,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    c.id,
    c.source_id,
    c.source_title,
    c.source_url,
    c.school_name,
    c.year,
    c.chunk_index,
    c.content,
    c.metadata,
    (1 - (c.embedding <=> query_embedding))::float as similarity
  from public.admissions_chunks c
  where c.embedding is not null
    and (
      filter = '{}'::jsonb
      or (
        (filter ? 'school_name' is false or c.school_name = (filter->>'school_name'))
        and (filter ? 'year' is false or c.year = (filter->>'year')::int)
      )
    )
  order by c.embedding <=> query_embedding
  limit match_count;
end;
$$;

grant execute on function public.match_admissions_chunks(vector(768), int, jsonb) to anon, authenticated;

