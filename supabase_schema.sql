-- 🏗️ TYPEMASTER PRO: SUPABASE SCHEMA (v1.0)
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Enable UUID extension
create extension if not exists "uuid-ossp";

-- 2. Create PROFILES table (Extends auth.users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  full_name text,
  username text unique,
  avatar_url text,
  
  -- Personal Details (Encrypted fields handled by client, but schema supports text)
  father_name text,
  date_of_birth date,
  mobile_number text,
  address text,
  city text,
  country text,
  gender text,
  
  -- Gamification Stats
  level int default 1,
  xp int default 0,
  arena_coins int default 0,
  
  -- System
  is_banned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),

  constraint username_length check (char_length(username) >= 3)
);

-- 3. Create TEST_RESULTS table
create table public.test_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  
  wpm int not null,
  raw_wpm int,
  accuracy float not null,
  duration int not null, -- Seconds
  mistakes int default 0,
  
  -- Security / Anti-Cheat
  integrity_score int default 100, -- calculated by bot detection
  is_verified boolean default false,
  client_hash text, -- check against tamper
  
  -- Metadata
  test_mode text, -- 'time', 'words', 'quote'
  language text default 'english',
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Create CERTIFICATES table
create table public.certificates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  test_id uuid references public.test_results(id) not null,
  
  certificate_code text unique not null, -- e.g. TMP-2026-X8Y9
  issued_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Profiles: Public Read (Leaderboards), Self Update
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using ( true );

create policy "Users can update own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Test Results: Self Read, Self Insert (Subject to verification)
alter table public.test_results enable row level security;

create policy "Users can view own results"
  on public.test_results for select
  using ( auth.uid() = user_id );

create policy "Users can insert own results"
  on public.test_results for insert
  with check ( auth.uid() = user_id );

-- Certificates: Public Read (Verify), Server-Side Insert Only
alter table public.certificates enable row level security;

create policy "Certificates are viewable by everyone"
  on public.certificates for select
  using ( true );

-- 6. TRIGGERS (Auto-update updated_at)
create or replace function public.handle_updated_at() 
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 7. FUNCTION: Handle New User Signup (Auto-create Profile)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 🛡️ MASTER ACTION PLAN: TASK 1 (TRUTH ENGINE)
-- ==========================================

-- 8. Betting Sessions Table
create table public.betting_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    status varchar(20) default 'active' check (status in ('active', 'completed', 'flagged', 'disqualified')),
    target_text text not null,
    start_time timestamptz default now(),
    end_time timestamptz,
    nonce uuid default gen_random_uuid(),
    created_at timestamptz default now()
);

-- 9. Typing Chunks Data (For interval validation)
create table public.typing_chunks (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.betting_sessions(id) on delete cascade,
    chars_typed text not null,
    client_timestamp bigint not null,
    server_time timestamptz default now()
);

create index idx_typing_chunks_session on public.typing_chunks(session_id);

-- 10. validation RPC (Server-side speed burst check)
create or replace function public.validate_typing_chunk(
    p_session_id uuid,
    p_chars_typed text,
    p_client_timestamp bigint
) returns jsonb as $$
declare
    v_session betting_sessions%rowtype;
    v_last_chunk typing_chunks%rowtype;
    v_time_diff_ms bigint;
    v_char_count int;
    v_wpm_burst numeric;
begin
    -- Check if session is active
    select * into v_session from public.betting_sessions where id = p_session_id and status = 'active';
    if not found then
        return '{"success": false, "error": "Invalid or blocked session."}'::jsonb;
    end if;

    -- Get last chunk
    select * into v_last_chunk from public.typing_chunks 
    where session_id = p_session_id 
    order by server_time desc limit 1;

    -- Insert new chunk
    insert into public.typing_chunks (session_id, chars_typed, client_timestamp)
    values (p_session_id, p_chars_typed, p_client_timestamp);

    -- Validate if prior chunk exists (The Truth Engine)
    if v_last_chunk.id is not null then
        v_time_diff_ms := extract(epoch from (now() - v_last_chunk.server_time)) * 1000;
        v_char_count := length(p_chars_typed);
        
        if v_time_diff_ms > 0 then
            v_wpm_burst := (v_char_count / 5.0) / (v_time_diff_ms / 60000.0);

            -- Impossible burst detection (e.g. script injection)
            if v_wpm_burst > 300 then
                update public.betting_sessions set status = 'flagged' where id = p_session_id;
                return '{"success": false, "flagged": true, "reason": "Superhuman burst detected!"}'::jsonb;
            end if;
        end if;
    end if;

    return '{"success": true, "flagged": false}'::jsonb;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 👻 MASTER ACTION PLAN: TASK 2 (GHOST HUNTER)
-- ==========================================

-- 11. Keystroke Biometrics
create table public.keystroke_logs (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.betting_sessions(id) on delete cascade,
    char_typed varchar(10),
    dwell_time_ms integer not null,
    flight_time_ms integer not null
);

create index idx_keystroke_logs_session on public.keystroke_logs(session_id);

-- 12. Ghost Hunter Biometric Validator
create or replace function public.verify_ghost_hunter(p_session_id uuid) 
returns jsonb as $$
declare
    v_dwell_stddev numeric;
    v_flight_stddev numeric;
    v_total_keys int;
begin
    -- Calculate standard deviation of keystrokes
    select 
        count(*), 
        coalesce(stddev(dwell_time_ms), 0), 
        coalesce(stddev(flight_time_ms), 0)
    into v_total_keys, v_dwell_stddev, v_flight_stddev
    from public.keystroke_logs
    where session_id = p_session_id;

    if v_total_keys < 20 then
       return '{"success": true, "reason": "Not enough data"}'::jsonb;
    end if;

    -- Anomaly Detection: Humans never have 0-2ms variance over 20+ keys
    if v_dwell_stddev < 2.0 or v_flight_stddev < 2.0 then
        update public.betting_sessions set status = 'flagged' where id = p_session_id;
        return '{"success": false, "flagged": true, "reason": "Mechanical consistency detected!"}'::jsonb;
    end if;

    -- Update session as completely verified
    update public.betting_sessions 
    set status = 'completed', end_time = now() 
    where id = p_session_id and status = 'active';

    return '{"success": true, "flagged": false, "reason": "Human verified"}'::jsonb;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 🏦 MASTER ACTION PLAN: TASK 3 (THE BANK)
-- ==========================================

-- 13. Financial Ledger (Double-Entry System)
create table public.financial_ledger (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    session_id uuid references public.betting_sessions(id),
    transaction_type varchar(20) check (transaction_type in ('deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_refunded')),
    amount numeric(10, 2) not null,
    description text,
    created_at timestamptz default now()
);

create index idx_ledger_user on public.financial_ledger(user_id);

-- 14. Live Balance Calculator RPC
create or replace function public.get_wallet_balance(p_user_id uuid) 
returns numeric as $$
declare
    v_balance numeric;
begin
    select coalesce(sum(amount), 0) into v_balance
    from public.financial_ledger
    where user_id = p_user_id;
    
    return v_balance;
end;
$$ language plpgsql;

-- 15. Atomic Bet Placement RPC
create or replace function public.place_bet(
    p_user_id uuid, 
    p_session_id uuid, 
    p_bet_amount numeric
) returns jsonb as $$
declare
    v_balance numeric;
begin
    -- 1. Get Live Balance
    v_balance := public.get_wallet_balance(p_user_id);

    -- 2. Check Balance
    if v_balance < p_bet_amount then
        return '{"success": false, "error": "Insufficient funds in wallet."}'::jsonb;
    end if;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- 7. FUNCTION: Handle New User Signup (Auto-create Profile)
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 🛡️ MASTER ACTION PLAN: TASK 1 (TRUTH ENGINE)
-- ==========================================

-- 8. Betting Sessions Table
create table public.betting_sessions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    status varchar(20) default 'active' check (status in ('active', 'completed', 'flagged', 'disqualified')),
    target_text text not null,
    start_time timestamptz default now(),
    end_time timestamptz,
    nonce uuid default gen_random_uuid(),
    created_at timestamptz default now()
);

-- 9. Typing Chunks Data (For interval validation)
create table public.typing_chunks (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.betting_sessions(id) on delete cascade,
    chars_typed text not null,
    client_timestamp bigint not null,
    server_time timestamptz default now()
);

create index idx_typing_chunks_session on public.typing_chunks(session_id);

-- 10. validation RPC (Server-side speed burst check)
create or replace function public.validate_typing_chunk(
    p_session_id uuid,
    p_chars_typed text,
    p_client_timestamp bigint
) returns jsonb as $$
declare
    v_session betting_sessions%rowtype;
    v_last_chunk typing_chunks%rowtype;
    v_time_diff_ms bigint;
    v_char_count int;
    v_wpm_burst numeric;
begin
    -- Check if session is active
    select * into v_session from public.betting_sessions where id = p_session_id and status = 'active';
    if not found then
        return '{"success": false, "error": "Invalid or blocked session."}'::jsonb;
    end if;

    -- Get last chunk
    select * into v_last_chunk from public.typing_chunks 
    where session_id = p_session_id 
    order by server_time desc limit 1;

    -- Insert new chunk
    insert into public.typing_chunks (session_id, chars_typed, client_timestamp)
    values (p_session_id, p_chars_typed, p_client_timestamp);

    -- Validate if prior chunk exists (The Truth Engine)
    if v_last_chunk.id is not null then
        v_time_diff_ms := extract(epoch from (now() - v_last_chunk.server_time)) * 1000;
        v_char_count := length(p_chars_typed);
        
        if v_time_diff_ms > 0 then
            v_wpm_burst := (v_char_count / 5.0) / (v_time_diff_ms / 60000.0);

            -- Impossible burst detection (e.g. script injection)
            if v_wpm_burst > 300 then
                update public.betting_sessions set status = 'flagged' where id = p_session_id;
                return '{"success": false, "flagged": true, "reason": "Superhuman burst detected!"}'::jsonb;
            end if;
        end if;
    end if;

    return '{"success": true, "flagged": false}'::jsonb;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 👻 MASTER ACTION PLAN: TASK 2 (GHOST HUNTER)
-- ==========================================

-- 11. Keystroke Biometrics
create table public.keystroke_logs (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.betting_sessions(id) on delete cascade,
    char_typed varchar(10),
    dwell_time_ms integer not null,
    flight_time_ms integer not null
);

create index idx_keystroke_logs_session on public.keystroke_logs(session_id);

-- 12. Ghost Hunter Biometric Validator
create or replace function public.verify_ghost_hunter(p_session_id uuid) 
returns jsonb as $$
declare
    v_dwell_stddev numeric;
    v_flight_stddev numeric;
    v_total_keys int;
begin
    -- Calculate standard deviation of keystrokes
    select 
        count(*), 
        coalesce(stddev(dwell_time_ms), 0), 
        coalesce(stddev(flight_time_ms), 0)
    into v_total_keys, v_dwell_stddev, v_flight_stddev
    from public.keystroke_logs
    where session_id = p_session_id;

    if v_total_keys < 20 then
       return '{"success": true, "reason": "Not enough data"}'::jsonb;
    end if;

    -- Anomaly Detection: Humans never have 0-2ms variance over 20+ keys
    if v_dwell_stddev < 2.0 or v_flight_stddev < 2.0 then
        update public.betting_sessions set status = 'flagged' where id = p_session_id;
        return '{"success": false, "flagged": true, "reason": "Mechanical consistency detected!"}'::jsonb;
    end if;

    -- Update session as completely verified
    update public.betting_sessions 
    set status = 'completed', end_time = now() 
    where id = p_session_id and status = 'active';

    return '{"success": true, "flagged": false, "reason": "Human verified"}'::jsonb;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 🏦 MASTER ACTION PLAN: TASK 3 (THE BANK)
-- ==========================================

-- 13. Financial Ledger (Double-Entry System)
create table public.financial_ledger (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users not null,
    session_id uuid references public.betting_sessions(id),
    transaction_type varchar(20) check (transaction_type in ('deposit', 'withdrawal', 'bet_placed', 'bet_won', 'bet_refunded')),
    amount numeric(10, 2) not null,
    description text,
    created_at timestamptz default now()
);

create index idx_ledger_user on public.financial_ledger(user_id);

-- 14. Live Balance Calculator RPC
create or replace function public.get_wallet_balance(p_user_id uuid) 
returns numeric as $$
declare
    v_balance numeric;
begin
    select coalesce(sum(amount), 0) into v_balance
    from public.financial_ledger
    where user_id = p_user_id;
    
    return v_balance;
end;
$$ language plpgsql;

-- 15. Atomic Bet Placement RPC
create or replace function public.place_bet(
    p_user_id uuid, 
    p_session_id uuid, 
    p_bet_amount numeric
) returns jsonb as $$
declare
    v_balance numeric;
begin
    -- 1. Get Live Balance
    v_balance := public.get_wallet_balance(p_user_id);

    -- 2. Check Balance
    if v_balance < p_bet_amount then
        return '{"success": false, "error": "Insufficient funds in wallet."}'::jsonb;
    end if;

    -- 3. Deduct Bet Amount (Negative amount for debit)
    insert into public.financial_ledger (user_id, session_id, transaction_type, amount, description)
    values (p_user_id, p_session_id, 'bet_placed', -p_bet_amount, 'Bet placed for typing session');

    return '{"success": true, "message": "Bet placed successfully"}'::jsonb;
end;
$$ language plpgsql security definer;

-- ==========================================
-- 🌐 MASTER ACTION PLAN: TASK 4 (WEBSOCKET SEC)
-- ==========================================

-- 16. Realtime Streaming Table
create table public.realtime_streams (
    id uuid default gen_random_uuid() primary key,
    session_id uuid references public.betting_sessions(id) on delete cascade,
    client_nonce uuid not null,
    payload jsonb not null,
    created_at timestamptz default now()
);

-- Enable Realtime
alter publication supabase_realtime add table public.realtime_streams;

-- 17. Replay Attack & Rate Limit Validator RPC
create or replace function public.secure_realtime_broadcast(
    p_session_id uuid,
    p_client_nonce uuid,
    p_payload jsonb
) returns jsonb as $$
declare
    v_session_nonce uuid;
    v_packets_last_second int;
begin
    -- Authenticate Nonce (Stop Replay Attacks)
    select nonce into v_session_nonce from public.betting_sessions where id = p_session_id and status = 'active';
    
    if v_session_nonce is null or v_session_nonce != p_client_nonce then
        return '{"success": false, "error": "Integrity Failure: Invalid Nonce / Replay Attack"}'::jsonb;
    end if;

    -- Rate Limiting
    select count(*) into v_packets_last_second 
    from public.realtime_streams 
    where session_id = p_session_id and created_at > (now() - interval '1 second');

    if v_packets_last_second > 10 then
        return '{"success": false, "error": "Rate limit exceeded."}'::jsonb;
    end if;

    -- Save and Broadcast (Will trigger Supabase Realtime automatically)
    insert into public.realtime_streams (session_id, client_nonce, payload)
    values (p_session_id, p_client_nonce, p_payload);

    return '{"success": true, "message": "Broadcast sent"}'::jsonb;
end;
$$ language plpgsql security definer;
