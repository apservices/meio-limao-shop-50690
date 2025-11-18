create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  source text default 'contact_page',
  status text default 'new',
  metadata jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_email_idx on public.contact_messages (email);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  source text default 'newsletter_section',
  metadata jsonb,
  subscribed_at timestamptz not null default timezone('utc', now())
);

create index if not exists newsletter_subscribers_subscribed_at_idx on public.newsletter_subscribers (subscribed_at desc);
