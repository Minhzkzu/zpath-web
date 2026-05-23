# ZPATH Matching Engine — study notes (Engine v2 prep)

## Current pipeline (before v2)

1. **Input**: `DiscoverFormData` → `saveCurrentUserProfile()` in `lib/profile.ts` → Supabase `user_profiles`.
2. **Read**: `getCurrentUserProfile()` maps row → `UserProfile` (email, personality, scores).
3. **Match**: `buildCareerMatches(profile)` in `lib/matching-engine.ts` maps each `CareerRule` → `CareerMatch`, sorts by `matchScore`.

## How score is computed (legacy)

- Weighted sum: `math*10*wM + physics*10*wP + third*10*wT`.
- Personality bonus: `18` if `preferredPersonalities.includes(personality)` else `4`.
- Total bonus: `(total/30)*12` clamped.
- Final: `clamp(weighted + personalityBonus + totalBonus, 45, 98)`.

## Known bug

- Form options use **Vietnamese with diacritics** (e.g. `Kỹ thuật - Logic`).
- `CAREER_RULES.preferredPersonalities` use **ASCII** (e.g. `Ky thuat - Logic`).
- `includes()` never matches → personality bonus is always the low branch.

## v2 direction

- Normalize scores to 0–1; Jaccard on tag sets; align personality strings with form constants.
- Split data (`career-rules.ts`) from logic (`matching-engine.ts`); add `breakdown` for UI.
