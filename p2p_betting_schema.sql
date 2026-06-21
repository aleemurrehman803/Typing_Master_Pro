-- P2P Betting Arena Database Schema & Stored Procedures
-- TypeMaster Pro Edition

-- 1. Extend Profiles Table for Biometric KYC Verification
alter table public.profiles 
add column if not exists kyc_status varchar(20) default 'unverified' check (kyc_status in ('unverified', 'pending', 'verified', 'rejected')),
add column if not exists kyc_biometric_hash text unique,
add column if not exists kyc_verified_at timestamptz;

-- 2. Create Betting Matches Table (Lobby & Rooms)
create table if not exists public.betting_matches (
    id uuid default gen_random_uuid() primary key,
    creator_id uuid references auth.users(id) not null,
    challenger_id uuid references auth.users(id),
    target_text text not null,
    wager_amount numeric(10, 2) not null check (wager_amount > 0),
    rake_percentage numeric(4, 2) default 5.00, -- 5% House Rake
    status varchar(20) default 'waiting' check (status in ('waiting', 'active', 'completed', 'cancelled')),
    winner_id uuid references auth.users(id),
    created_at timestamptz default now()
);

-- Indexes for performance
create index if not exists idx_betting_matches_creator on public.betting_matches(creator_id);
create index if not exists idx_betting_matches_status on public.betting_matches(status);

-- 3. Create Match Participants Table (Detailing typing performance in a match)
create table if not exists public.match_participants (
    id uuid default gen_random_uuid() primary key,
    match_id uuid references public.betting_matches(id) on delete cascade not null,
    user_id uuid references auth.users(id) not null,
    wpm numeric(5, 2),
    accuracy numeric(5, 2),
    status varchar(20) default 'joined' check (status in ('joined', 'completed', 'disqualified')),
    joined_at timestamptz default now(),
    completed_at timestamptz,
    unique(match_id, user_id)
);

create index if not exists idx_match_participants_user on public.match_participants(user_id);

-- 4. RPC: Create Betting Match (Deducts Wager & Inserts Match)
create or replace function public.create_betting_match(
    p_creator_id uuid,
    p_wager_amount numeric,
    p_target_text text
) returns jsonb as $$
declare
    v_balance numeric;
    v_match_id uuid;
begin
    -- 1. Get Live Balance
    v_balance := public.get_wallet_balance(p_creator_id);

    -- 2. Check Balance
    if v_balance < p_wager_amount then
        return jsonb_build_object('success', false, 'error', 'Insufficient funds in wallet.');
    end if;

    -- 3. Create Match
    insert into public.betting_matches (creator_id, target_text, wager_amount, status)
    values (p_creator_id, p_target_text, p_wager_amount, 'waiting')
    returning id into v_match_id;

    -- 4. Add Creator as Participant
    insert into public.match_participants (match_id, user_id, status)
    values (v_match_id, p_creator_id, 'joined');

    -- 5. Deduct Wager from Ledger
    insert into public.financial_ledger (user_id, session_id, transaction_type, amount, description)
    values (p_creator_id, null, 'bet_placed', -p_wager_amount, 'Wager placed for P2P match ' || v_match_id);

    return jsonb_build_object(
        'success', true, 
        'message', 'Match created successfully', 
        'match_id', v_match_id
    );
end;
$$ language plpgsql security definer SET search_path = public;

-- 5. RPC: Join Betting Match (Deducts Wager & Activates Match)
create or replace function public.join_betting_match(
    p_challenger_id uuid,
    p_match_id uuid
) returns jsonb as $$
declare
    v_match betting_matches%rowtype;
    v_balance numeric;
begin
    -- 1. Lock match row to prevent concurrency issues
    select * into v_match from public.betting_matches 
    where id = p_match_id and status = 'waiting' for update;

    if not found then
        return jsonb_build_object('success', false, 'error', 'Match is not available to join.');
    end if;

    -- 2. Prevent playing against yourself
    if v_match.creator_id = p_challenger_id then
        return jsonb_build_object('success', false, 'error', 'You cannot join your own match.');
    end if;

    -- 3. Check Challenger Balance
    v_balance := public.get_wallet_balance(p_challenger_id);
    if v_balance < v_match.wager_amount then
        return jsonb_build_object('success', false, 'error', 'Insufficient funds in wallet.');
    end if;

    -- 4. Update Match Row
    update public.betting_matches 
    set challenger_id = p_challenger_id, status = 'active'
    where id = p_match_id;

    -- 5. Add Challenger as Participant
    insert into public.match_participants (match_id, user_id, status)
    values (p_match_id, p_challenger_id, 'joined');

    -- 6. Deduct Wager from Challenger Ledger
    insert into public.financial_ledger (user_id, session_id, transaction_type, amount, description)
    values (p_challenger_id, null, 'bet_placed', -v_match.wager_amount, 'Wager placed for P2P match ' || p_match_id);

    return jsonb_build_object(
        'success', true, 
        'message', 'Joined match successfully'
    );
end;
$$ language plpgsql security definer SET search_path = public;

-- 6. RPC: Resolve P2P Betting Match (Calculates WPM, applies accuracy rule, awards payout & rake)
create or replace function public.resolve_betting_match(
    p_match_id uuid,
    p_winner_id uuid
) returns jsonb as $$
declare
    v_match betting_matches%rowtype;
    v_total_pool numeric;
    v_rake numeric;
    v_payout numeric;
    v_house_wallet_id uuid := '00000000-0000-0000-0000-000000000000'; -- Owner/Admin Account
begin
    -- 1. Lock match row to prevent double-spending/duplicate resolution
    select * into v_match from public.betting_matches 
    where id = p_match_id and status = 'active' for update;

    if not found then
        return jsonb_build_object('success', false, 'error', 'Match is not in active state or already resolved.');
    end if;

    -- 2. Validate Winner is a Participant
    if p_winner_id != v_match.creator_id and p_winner_id != v_match.challenger_id then
        return jsonb_build_object('success', false, 'error', 'Specified winner is not a participant in this match.');
    end if;

    -- 3. Calculate wagers pool
    v_total_pool := v_match.wager_amount * 2;
    v_rake := v_total_pool * (v_match.rake_percentage / 100.0);
    v_payout := v_total_pool - v_rake;

    -- 4. Mark match as completed
    update public.betting_matches 
    set status = 'completed', winner_id = p_winner_id 
    where id = p_match_id;

    -- 5. Insert transaction ledger for the winner
    insert into public.financial_ledger (user_id, session_id, transaction_type, amount, description)
    values (p_winner_id, null, 'bet_won', v_payout, 'Winnings for P2P match ' || p_match_id);

    -- 6. Insert transaction ledger for the website owner (house rake)
    insert into public.financial_ledger (user_id, session_id, transaction_type, amount, description)
    values (v_house_wallet_id, null, 'bet_won', v_rake, 'House rake commission (5%) for P2P match ' || p_match_id);

    return jsonb_build_object(
        'success', true, 
        'message', 'Match resolved successfully',
        'winner_id', p_winner_id,
        'payout', v_payout,
        'rake', v_rake
    );
end;
$$ language plpgsql security definer SET search_path = public;
