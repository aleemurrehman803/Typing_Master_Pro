# Battle Arena 2.0: Professional Enhancement Plan

## Overview
This plan outlines the roadmap for transforming the current Battle Arena into a "Professional" grade e-sports platform, implementing the highest-impact features from the suggestion list.

## Phase 1: Visual Immersion & "Juice" (The Wow Factor)
*Focus: Making the act of typing feel powerful and responsive.*
- [ ] **Cinematic Match Intro**: Create a "VS" screen overlay that flashes before the countdown (Player Avatar vs Opponent Avatar).
- [ ] **Dynamic Caret & Particles**:
    - Add a "trail" effect to the cursor (e.g., sparks or ghosting).
    - Add particle explosions on perfect word completions.
- [ ] **Screen Shake**: Subtle camera shake on high-speed bursts or combos (toggleable).
- [ ] **Combo Counter**: A visual "streak" counter that grows hot/flames when accuracy is 100% for 10+ words.

## Phase 2: Advanced Gameplay Mechanics
*Focus: Deepening the skill gap and variety.*
- [ ] **AI Personalities**:
    - **"The Rusher"**: fast start, prone to errors later.
    - **"The Sniper"**: Slow, but 100% accurate (never backspaces).
    - **"The Choke"**: Fast but freezes at 95% progress.
- [ ] **Sudden Death Mode**: A toggle in Novice Dojo. One mistake = Instant Game Over.
- [ ] **Accuracy Multiplier**: Visual indicator showing speed boost (1.2x) when maintaining 100% accuracy.

## Phase 3: Economy & Progression Loop
*Focus: Giving "Coins" real value.*
- [ ] **The Armory (Shop)**: A new tab in Arena.
    - Buy "Cursor Trails" with coins.
    - Buy "Name Colors" with coins.
- [ ] **Daily Contracts**:
    - "Win 3 Matches" (+50 Coins)
    - "Maintain 98% Accuracy" (+20 Coins)
- [ ] **Post-Match Analysis**:
    - A simple graph showing WPM over time for both player and opponent.

## Phase 4: Social & Spectacle
*Focus: Community and competition.*
- [ ] **Live Ticker**: A scrolling text at the bottom showing fake/real global events ("User X just won 1000 coins!").
- [ ] **Badges & Titles**: Display "Gladiator" or "Speed Demon" next to player names in the Arena.

---

## Immediate Next Steps (Sprint 1)
1.  **Implement AI Personalities**: Refine `useBattleLogic` to support different opponent archetypes.
2.  **Visual Polish**: Add the "Combo Streak" visual and "VS Screen" intro.
