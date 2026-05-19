# AGENTS.md

## Project overview

Expo 54 React Native app (iOS, Android, web) using expo-router file-based routing, Tamagui v2 (rc) for UI, Supabase for backend/auth, and Zod for validation.

## Commands

| Task | Command |
|---|---|
| Start dev server | `npm start` or `npx expo start` |
| Run on iOS | `npm run ios` |
| Run on Android | `npm run android` |
| Run on web | `npm run web` |
| Lint | `npm run lint` (runs `expo lint`) |
| Reset project scaffold | `npm run reset-project` |

There is no dedicated test or typecheck script. TypeScript is enforced via `tsconfig.json` (`strict: true`). Run `npx tsc --noEmit` to typecheck manually.

## Architecture

- **Entry point**: `expo-router/entry` (set in `package.json` `"main"`)
- **Root layout**: `app/_layout.tsx` — wraps everything in `TamaguiProvider` (default theme `groenevingers`) and `OnboardingProvider`. All stack screens have `headerShown: false`.
- **Routing**: expo-router. `app/` contains flat route files and subdirectories (`app/garden/[id].tsx` for dynamic routes, `app/onboarding/` for the multi-step flow).
- **Path alias**: `@/*` maps to project root (e.g. `@/tamagui.config`, `@/context/OnboardingContext`).
- **UI components**: `components/ui/` — shared Tamagui-based components (BottomNav, Button, GardenCard, LogCard, Onboarding, etc.).
- **State**: `context/OnboardingContext.tsx` — React context for the onboarding wizard (role, name, email, description, password, profileImage).
- **Backend**: `utils/supabase.ts` — Supabase client with cross-platform storage (localStorage on web, AsyncStorage on native, in-memory fallback).
- **Validation**: Zod schemas defined inline in route files (`app/onboarding/info.tsx`, `app/onboarding/security.tsx`, `app/garden/[id]/request.tsx`).

## Route structure

Root layout:
- `app/_layout.tsx` — Root layout with TamaguiProvider, OnboardingProvider, font loading. Registers both `personal-details` and `personal_details` screens (see quirk below).

Flat screens:
- `app/index.tsx` — **Debug gate / temporary entry point**. Offers "Start Onboarding Flow" or "Skip to Dashboard" buttons. TODO: remove and rename `dashboard.tsx` to `index.tsx` when development is complete.
- `app/dashboard.tsx` — Main dashboard. Fetches gardens, logs, and user profile from Supabase. Shows Pro upgrade banner, horizontal GardenCards, location card, LogCards. Pull-to-refresh enabled.
- `app/login.tsx` — Login screen with email/password inputs and social login (Google, Facebook) placeholders. No actual Supabase auth call yet.
- `app/explore.tsx` — Explore/discovery screen with hero card and placeholder content.
- `app/logbook.tsx` — Garden logbook with swipeable cards (react-native-gesture-handler + reanimated). Swipe right to complete, swipe left to delete. Uses hardcoded mock data.
- `app/pro.tsx` — Pro subscription upsell screen (EUR 7/month, benefits list).
- `app/profile.tsx` — User profile screen with avatar, name, role, bio, saved gardens. Reads from `OnboardingContext`.
- `app/settings.tsx` — Settings screen (Account + Meer sections). Links to `/personal_details`, `/pro`.
- `app/search.tsx` — Live search with debounced (300ms) Supabase `gardens` table query using `.or()` filtering on name/location/description. Displays full-width result cards.
- `app/personal-details.tsx` — Personal details edit form (first name, last name, email, bio). Reads/writes `OnboardingContext`. **Active version** (navigated to from settings).
- `app/personal_details.tsx` — **DUPLICATE** of `personal-details.tsx` (underscore variant). Registered in `_layout.tsx` but never navigated to. Dead code.

Dynamic routes:
- `app/garden/[id].tsx` — Garden detail screen. Fetches from Supabase by ID, falls back to hardcoded data for IDs "1", "2", "3". Shows image, name, rating, location, description, "Verstuur aanvraag" CTA.
- `app/garden/[id]/request.tsx` — Garden request form. Collects motivation (max 300 chars), collaboration type, available days (day-of-week picker), start date. Validates with Zod schema. Inserts into Supabase `garden_requests` table.
- `app/messages.tsx` — Conversation list screen. Fetches conversations with Supabase real-time subscription for new messages. Shows partner profile pic, name, last message, relative timestamp, online status.
- `app/messages/[id].tsx` — Chat detail screen. Real-time message subscription + presence tracking. Shows ChatBubbles (own/right, other/left), ChatInput for sending. KeyboardAvoidingView for iOS.

Sub-routes (onboarding wizard):
- `app/onboarding/index.tsx` — Landing page rendering the `Onboarding` carousel component.
- `app/onboarding/accountSelect.tsx` — Account selection: "Login" or "Account aanmaken" + social login.
- `app/onboarding/role.tsx` — Role selection: "Tuineigenaar" or "Tuinzoeker". Saves to context, navigates to `/onboarding/info`.
- `app/onboarding/info.tsx` — Personal info form (first name, last name, email, description). Zod validation (email format, no "ongepast" word). Step 1 of 4.
- `app/onboarding/security.tsx` — Password setup (password + confirm). Zod validation (min 8 chars, 1 special char, matching). Step 2 of 4.
- `app/onboarding/photo.tsx` — Profile photo picker + account creation. Uses `expo-image-picker`, uploads to Supabase Storage (`profile-images` bucket), creates auth user, inserts profile row, navigates to `/dashboard`. Step 3 of 4.

## UI components (`components/ui/`)

- `BottomNav.tsx` — Floating bottom navigation with blur background. Three icon buttons: Home, Messages, Profile. Active/inactive color states. Supports `onHomePress`, `onMessagePress`, `onProfilePress` callbacks.
- `Button.tsx` — Reusable Tamagui button wrapper with rounded corners (borderRadius 100). Accepts `label` prop.
- `ChatBubble.tsx` — Pill-shaped message bubble (borderRadius 5000px). Incoming: `#F0F3EC`, outgoing: `#EAF0D8`, border `#D4E1AE`. Shows content and optional timestamp.
- `ChatInput.tsx` — Chat input bar (height 46px, borderRadius 64px) with camera icon, text input ("Typ een chatbericht..."), and mic icon. Background `rgba(217,217,217,0.05)`, border `#A9A99E`.
- `Divider.tsx` — Horizontal divider line. Optionally renders centered label (default "of") between two lines.
- `GardenCard.tsx` — Horizontal card (260px wide) with garden image, name, star rating, location, "Details" button, heart/favorite button.
- `Info.tsx` — Simple info display (image/SVG + H1 title + description text, center-aligned). Used by onboarding carousel.
- `LogCard.tsx` — Compact card (220x140px) showing garden log entry title with checkmark icon and status dots (completed/pending). Exports `GardenLog` type.
- `MessageItem.tsx` — Conversation list item. Profile pic (50x50) with green online status ball, name (bold 20px), last message preview, time label, chevron right. Background `#F9F9F9`.
- `Onboarding.tsx` — 3-step onboarding carousel (journal, location, trust features) with SVG images. Internal state, navigates to `/onboarding/accountSelect`.
- `ProgressDots.tsx` — Step progress indicator. Active dot is wider (24px) with primary color; inactive dots are 8px circles.
- `ThemedSafeArea.tsx` — `SafeAreaView` wrapper styled with Tamagui theme background. Used on nearly every screen.
- `TopNav.tsx` — **UNUSED** older top nav variant (location + search bar baked in). No screen file imports it.
- `TopNavPill.tsx` — Glassmorphic pill-shaped top nav with optional back button, title, optional right element. Supports children rendered below it (used for search bar in dashboard/search screens).

## Supabase schema

### `profiles` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, FK to `auth.users` |
| `first_name` | text | |
| `last_name` | text | |
| `email` | text | |
| `description` | text | |
| `role` | text | |
| `profile_image` | text | Public URL |
| `created_at` | timestamp | |

RLS: SELECT public; UPDATE own user.
Used in: `app/onboarding/photo.tsx` (INSERT), `app/dashboard.tsx` (SELECT), `app/search.tsx` (SELECT).

### `gardens` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `owner_id` | uuid | FK to `profiles` |
| `name` | text | |
| `location` | text | |
| `rating` | float | default 5.0 |
| `image_url` | text | |
| `description` | text | |
| `created_at` | timestamp | |

RLS: SELECT public; INSERT own owner_id.
Used in: `app/dashboard.tsx` (SELECT), `app/search.tsx` (SELECT with `.or()` filter), `app/garden/[id].tsx` (SELECT `.single()`).

### `garden_logs` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `garden_id` | uuid | FK to `gardens` |
| `user_id` | uuid | FK to `profiles` |
| `title` | text | |
| `status` | jsonb | default `'[]'` |
| `created_at` | timestamp | |

RLS: SELECT public; INSERT own user_id.
Used in: `app/dashboard.tsx` (SELECT).

### `garden_requests` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `garden_id` | uuid | FK to `gardens` |
| `user_id` | uuid | FK to `profiles` |
| `motivation` | text | max 300 chars |
| `collaboration_type` | text | |
| `days` | text[] | array of day names |
| `start_date` | date | |
| `status` | text | default `'pending'`, IN (`'pending'`,`'approved'`,`'rejected'`) |
| `created_at` | timestamp | |

RLS: SELECT owner or requester; INSERT own user_id; UPDATE own user_id.
Used in: `app/garden/[id]/request.tsx` (INSERT).

### `conversations` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user1_id` | uuid | FK to `profiles` |
| `user2_id` | uuid | FK to `profiles` |
| `created_at` | timestamp | |
| `updated_at` | timestamp | Auto-updated via trigger on new messages |

RLS: SELECT participants only; INSERT either participant.
Unique constraint on `(user1_id, user2_id)` — 1-on-1 chats only.
Used in: `app/messages.tsx` (SELECT), `app/messages/[id].tsx` (SELECT).

### `messages` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `conversation_id` | uuid | FK to `conversations` |
| `sender_id` | uuid | FK to `profiles` |
| `content` | text | |
| `created_at` | timestamp | |

RLS: SELECT conversation participants; INSERT own sender_id.
Used in: `app/messages.tsx` (SELECT last message), `app/messages/[id].tsx` (SELECT + INSERT + real-time).

### Storage bucket
- `profile-images` — user profile photos (`{userId}_profile_{timestamp}.jpg`)

### Schema files
- `supabase_schema.sql` — full schema DDL with RLS policies
- `supabase_seeder.sql` — sample seed data for profiles, gardens, garden_logs
- `supabase_chat.sql` — conversations and messages tables with RLS policies, trigger for auto-updating `updated_at`

## Environment variables (`.env.local`)

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` — Supabase anon key

## Key conventions and quirks

- **Custom fonts**: Satoshi font family (Light, Regular, Medium, Bold, Black) is loaded via `useFonts` in `_layout.tsx` from `assets/fonts/`. These files are **gitignored** — if fonts are missing, `npm start` will fail to load them.
- **SVG imports**: Metro is configured with `react-native-svg-transformer` — SVGs are imported as React components, not as image assets.
- **Tamagui theme**: Uses a custom theme `groenevingers` with green/earth-tone palette. Set as `defaultTheme` in the root provider.
- **Native directories**: `/android` and `/ios` are generated by Expo and gitignored. Do not manually edit them; use `npx expo prebuild` to regenerate.
- **`.env.local`**: Contains real Supabase credentials (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`). Do not commit.
- **Duplicate route files**: Both `app/personal-details.tsx` (hyphen) and `app/personal_details.tsx` (underscore) exist. Both registered in `_layout.tsx`, but only the hyphen version is navigated to (from `settings.tsx`). The underscore version is dead code.
- **Duplicate Garden types**: `Garden` type is defined inline in 3 files (`dashboard.tsx`, `search.tsx`, `garden/[id].tsx`) with slightly different nullability. No shared database types or Supabase-generated types file exists.
- **newArchEnabled**: true in `app.json` — the app uses React Native's new architecture.
- **No UPDATE/DELETE operations**: Only INSERT and SELECT operations are implemented in the codebase.
- **Hardcoded fallback data**: `app/garden/[id].tsx` has 3 hardcoded gardens as Supabase fallback. `app/logbook.tsx` uses hardcoded mock logs.
- **Schema mismatch**: `app/garden/[id].tsx` reads `city` and `country` fields from the DB response, but the actual column is `location` (text).

## Git Workflow

This project follows **conventional branch naming** and **conventional commits**. The agent must adhere to this workflow on every task.

### Branch naming

| Work type | Branch pattern |
|---|---|
| Feature | `feat/<kebab-description>` |
| Bug fix | `fix/<kebab-description>` |
| Refactor | `refactor/<kebab-description>` |
| Chore | `chore/<kebab-description>` |
| Docs | `docs/<kebab-description>` |
| Style | `style/<kebab-description>` |
| Test | `test/<kebab-description>` |

### Commit format

```
<type>: <imperative message>
```

Examples: `feat: add garden request form`, `fix: correct email validation regex`, `refactor: extract GardenCard into shared component`.

### Workflow steps

1. **Determine type** — From the user's request, classify the work as one of the types above. If unclear, ask.
2. **Create/switch branch** — Infer a short kebab-case branch name and run:
   ```
   git checkout -b <type>/<description>
   ```
   If the branch already exists, switch to it with `git checkout <branch>`.
3. **Commit frequently** — After completing each logical unit of work (a single file change, a component, a fix), commit immediately:
   ```
   git add <files>
   git commit -m "<type>: <description of this unit>"
   ```
   Do not batch unrelated changes into one commit. Each commit should be atomic and self-contained.
4. **Push** — When the task is complete or at natural breakpoints:
   ```
   git push -u origin <branch>
   ```
