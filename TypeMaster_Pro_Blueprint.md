# TypeMaster Pro: The Ultimate AI Typing Architect | System Blueprint

## 1. Executive Summary
**TypeMaster Pro** is a next-generation typing tutor application designed for professionals, competitive typists, and learners. Unlike traditional tutors, it leverages **Off-Main-Thread Architecture** (Web Workers), **AI-driven Pedagogy** (Spaced Repetition Systems), and **Cryptographic Security** to ensure sub-millisecond latency, personalized learning, and cheating-proof certification.

---

## 2. Technology Stack & Key Libraries

### Core Framework
*   **Runtime**: React 18+ (Vite)
*   **Language**: JavaScript (ESModule architecture)
*   **Styling**: Tailwind CSS v4 + PostCSS (Custom Design System)
*   **State Management**: Zustand (Auth, Settings, Game State)
*   **Routing**: React Router DOM v6

### Advanced Capabilities
*   **Performance**: Web Workers API (Offloads engine logic), OffscreenCanvas
*   **Networking**: WebRTC (P2P Multiplayer), Edge Functions (Leaderboards)
*   **Hardware**: WebHID API (Keyboard Polling Rate Detection), Vibration API (Haptics)
*   **Security**: CryptoJS / Web Crypto API (AES-256 Storage, HMAC Signatures)
*   **Visuals**: Framer Motion (Animations), Lucide React (Icons), Recharts (Analytics)

---

## 3. Core Features & Implementation Details

### A. The "Expert" Typing Engine (`src/hooks/useTypingEngine.js` + `src/workers/typingWorker.js`)
*   **Zero-Latency Input**: Typing logic runs in a separate thread. Even if the UI freezes, keystrokes are captured.
*   **Haptic Feedback**: Simulates mechanical tactility using the Vibration API based on success/error events.
*   **N-Gram Analysis**: Tracks the speed of every 2-character combination (bigram) to identify weak transitions.
*   **Sudden Death Mode**: A "hardcore" variant where a single error ends the test immediately.

### B. AI & Personalized Learning (`src/utils/tutor.js`)
*   **SM-2 Algorithm**: Implements a modified SuperMemo-2 Spaced Repetition algorithm.
*   **Dynamic Drills**: Automatically schedules practice for "weak keys" based on previous failure rates and latency.
*   **Procedural Content**: Generates lessons focusing specifically on the user's slowed bigrams (e.g., "th", "ng").

### C. Competitive Multiplayer (`src/pages/games/TypingDuel.jsx`)
*   **P2P Architecture**: Users connect directly via WebRTC for < 50ms latency.
*   **Visualized Combat**: Typing speed translates to "damage". Faster WPM = Higher DSP (Damage Per Second).
*   **NTP Synchronization**: Custom network utility ensuring both players start at the exact same millisecond.

### D. Security & Anti-Cheat (`src/utils/security.js`)
*   **Behavioral Biometrics**: Analyzes "Inter-Key Interval" (IKI) variance. Robotic inputs (perfect timing) are flagged.
*   **Encrypted State**: LocalStorage scores are AES-256 encrypted to prevent `Edit Cookie` hacks.
*   **Hardware Fingerprinting**: Detects input device polling rates to distinguish between high-end mech keyboards and software macros.

### E. Gamification & Economy
*   **Badges System**: Achievement engine tracking WPM milestones, accuracy streaks, and social shares.
*   **Virtual Economy**: Users earn "Coins" for tests and referrals.
*   **Referral System**: Multi-tiered reward system for inviting users via social platforms.

---

## 4. File Structure & Architecture Map

```
src/
├── components/
│   ├── features/       # Specialized UI (TypingArea, StatsDisplay)
│   ├── layout/         # Layout.jsx (Command Palette, Sidebar, Navbar)
│   └── ui/             # Reusable atomic molecules (Buttons, Cards)
├── hooks/
│   └── useTypingEngine.js  # The bridge between UI and Web Worker
├── pages/
│   ├── Dashboard.jsx   # Analytics hub, charts, profile management
│   ├── Test.jsx        # The main typing interface (Core Product)
│   ├── Profile.jsx     # User settings, avatar, public stats
│   ├── Leaderboard.jsx # Global rankings
│   └── games/          # Multiplayer arenas
├── store/
│   └── useAuthStore.js # Global state (User session, settings, coins)
├── utils/
│   ├── hardware.js     # WebHID & Vibration logic
│   ├── security.js     # Crypto & Anti-cheat logic
│   ├── tutor.js        # AI Spaced Repetition logic
│   └── network.js      # WebRTC & NTP Sync
└── workers/
    └── typingWorker.js # The Brain: Text processing, WPM calc, Integrity check
```

---

## 5. Security Protocol (Anti-Cheat)
The platform employs a **Three-Layer Defense**:
1.  **Client-Side Heuristics**: The Worker calculates Standard Deviation of keystrokes. Low variance (< 5ms) = Bot.
2.  **Cryptographic Signing**: All submitted scores are signed with a private HMAC key.
3.  **Hardware Verification**: The app queries the USB descriptor to verify a physical keyboard is present (Chrome only).

---

## 6. Future Roadmap (Planned Phases)
*   **Phase 6 (Voice)**: Voice-dictation typing modes.
*   **Phase 7 (Enterprise)**: SSO Integration & Team Leaderboards.
*   **WASM Migration**: Porting the `typingWorker.js` logic to Rust/WASM for even faster processing.

---

*Verified & Generated by Antigravity Agent*
