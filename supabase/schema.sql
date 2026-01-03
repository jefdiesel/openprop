-- Users (handled by Supabase Auth, extended with profile)
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  company_name text,
  logo_url text,
  brand_color text default '#000000',
  created_at timestamptz default now()
);

-- Documents
create table documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  title text not null,
  status text default 'draft',
  content jsonb not null default '[]',
  variables jsonb,
  settings jsonb,
  is_template boolean default false,
  template_category text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  sent_at timestamptz,
  expires_at timestamptz
);

-- Recipients/Signers
create table recipients (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  email text not null,
  name text,
  role text default 'signer',
  signing_order int default 1,
  status text default 'pending',
  access_token text unique not null,
  viewed_at timestamptz,
  signed_at timestamptz,
  signature_data jsonb,
  ip_address text,
  user_agent text
);

-- Document Events
create table document_events (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  recipient_id uuid references recipients(id),
  event_type text not null,
  event_data jsonb,
  created_at timestamptz default now()
);

-- Payments
create table payments (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references documents(id) on delete cascade,
  recipient_id uuid references recipients(id),
  stripe_payment_intent_id text,
  amount int not null,
  currency text default 'usd',
  status text default 'pending',
  created_at timestamptz default now()
);

-- Subscriptions
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null,
  stripe_customer_id text,
  stripe_subscription_id text unique,
  plan_id text not null default 'free',
  status text not null default 'active',
  is_early_bird boolean default false,
  billing_interval text default 'monthly',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  canceled_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscription add-ons
create table subscription_addons (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references subscriptions(id) on delete cascade,
  addon_id text not null,
  stripe_subscription_item_id text,
  status text not null default 'active',
  created_at timestamptz default now()
);

-- Early bird tracking
create table early_bird_slots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) not null unique,
  slot_number int not null,
  plan_id text not null,
  claimed_at timestamptz default now()
);

-- Function to get remaining early bird slots
create or replace function get_early_bird_slots_remaining()
returns int as $$
begin
  return 100 - (select count(*) from early_bird_slots);
end;
$$ language plpgsql;

-- Enable RLS
alter table profiles enable row level security;
alter table documents enable row level security;
alter table recipients enable row level security;
alter table document_events enable row level security;
alter table payments enable row level security;
alter table subscriptions enable row level security;
alter table subscription_addons enable row level security;
alter table early_bird_slots enable row level security;

-- RLS Policies
create policy "Users can manage own profile" on profiles for all using (auth.uid() = id);
create policy "Users can manage own documents" on documents for all using (auth.uid() = user_id);
create policy "Users can manage recipients on own documents" on recipients for all using (document_id in (select id from documents where user_id = auth.uid()));
create policy "Public can view documents via token" on documents for select using (id in (select document_id from recipients where access_token = current_setting('app.recipient_token', true)));
create policy "Users can view events on own documents" on document_events for select using (document_id in (select id from documents where user_id = auth.uid()));
create policy "Users can view payments on own documents" on payments for select using (document_id in (select id from documents where user_id = auth.uid()));
create policy "Users can manage own subscription" on subscriptions for all using (auth.uid() = user_id);
create policy "Users can view own subscription addons" on subscription_addons for select using (subscription_id in (select id from subscriptions where user_id = auth.uid()));
create policy "Users can view own early bird slot" on early_bird_slots for select using (auth.uid() = user_id);

-- Functions
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- Update timestamp trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger documents_updated_at
  before update on documents
  for each row execute procedure update_updated_at();
