# 🏗️ TYPEMASTER PRO - SUPABASE BACKEND ARCHITECTURE
**Audit Recommendation**: ✅ APPROVED (Replaces Node.js Custom Backend)
**Status**: � READY FOR INTEGRATION

---

## � OVERVIEW
This architecture leverages Supabase (PostgreSQL + Auth + Edge Functions) to replace `localStorage` and provide production-grade security without managing a dedicated server.

---

## 📁 PROJECT STRUCTURE (UPDATED)

```
typemaster-frontend/
├── supabase/
│   ├── migrations/          # Database schema changes
│   ├── seed.sql             # Default data (tests, configs)
│   └── functions/           # Edge Functions (Server-side logic)
│       ├── rate-limiter/    # DDoS protection
│       ├── test-verify/     # Anti-cheat verification
│       └── send-email/      # Transactional emails
├── src/
│   ├── lib/
│   │   └── supabase.js      # Singleton client instance
│   ├── services/
│   │   ├── auth.service.js  # Replaces useAuthStore logic
│   │   ├── db.service.js    # Database interactions
│   │   └── api.service.js   # Edge function calls
│   └── hooks/
│       ├── useSupabaseAuth.js
│       └── useRealtime.js   # Multiplayer updates
└── .env.production          # Security keys
```

---

## �️ DATABASE SCHEMA (PostgreSQL)

### 1. Users & Profiles
Replaces: `localStorage.getItem('user')` + `user_profiles`
- **users** (Managed by Supabase Auth)
- **public.profiles**
  - Links to `auth.users` via UUID
  - stores: `father_name`, `address`, `stats` jsonb
  - RLS: `auth.uid() = id`

### 2. Typing Tests
Replaces: `localStorage.getItem('tests')`
- **public.test_results**
  - `id`: UUID
  - `wpm`: Integer
  - `accuracy`: Float
  - `integrity_score`: Integer (Server verified)
  - `is_verified`: Boolean
  - RLS: Users can insert their own, Read own

### 3. Certificates
Replaces: `localStorage.getItem('issued_certificates')`
- **public.certificates**
  - `certificate_id`: Unique String
  - `test_id`: UUID FK
  - `issued_at`: Timestamp
  - RLS: Read-only (Insert via Edge Function only)

---

## � SECURITY POLICIES (RLS)

| Table | Operation | Policy | Description |
|-------|-----------|--------|-------------|
| `profiles` | SELECT | `auth.uid() = id` | Users access own profile |
| `profiles` | UPDATE | `auth.uid() = id` | Users update own profile |
| `test_results` | INSERT | `auth.uid() = user_id` | Users submit tests |
| `test_results` | SELECT | `auth.uid() = user_id` | Users view history |
| `certificates` | INSERT | **DENY ALL** | Only server-side admin/function can issue |

---

## ⚡ EDGE FUNCTIONS (Server-Side Logic)

### 1. `verify-test-result`
**Trigger**: HTTP POST /api/submit-test
**Logic**:
1. Recalculate WPM/Accuracy from keystroke log
2. Check `integrity_hash` matches
3. Verify timestamps (anti-speedhack)
4. Insert into `test_results` with `verified: true`

### 2. `admin-issue-certificate`
**Trigger**: Database Trigger (ON INSERT test_results)
**Logic**:
1. Check if `test_result.wpm > 30` AND `accuracy > 90`
2. Generate Certificate ID
3. Insert into `certificates` table

---

## � MIGRATION PLAN (Client-Side)

### Phase 1: Authentication (Week 1)
- Install `@supabase/supabase-js`
- Create `src/lib/supabase.js`
- Replace `useAuthStore.login` with `supabase.auth.signInWithPassword`
- Replace `useAuthStore.register` with `supabase.auth.signUp`

### Phase 2: Data Persistence (Week 2)
- Create `DbService` class
- Sync `localStorage` data to Supabase (one-time migration)
- Update `Dashboard.jsx` to fetch from DB instead of Store

### Phase 3: Security Hardening (Week 3)
- Enable **Row Level Security (RLS)**
- Deploy Edge Functions for anti-cheat
- Disable Client-side score manipulation

---

## 📝 NEXT STEPS
1. Run `migrations/001_initial_schema.sql` (I will generate this)
2. Add Supabase keys to `.env`
3. Refactor `useAuthStore` to use Supabase Client
