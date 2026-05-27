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
| Web static export | `bash scripts/download-fonts.sh && npx expo export --platform web` |

There is no dedicated test or typecheck script. TypeScript is enforced via `tsconfig.json` (`strict: true`). Run `npx tsc --noEmit` to typecheck manually.

## Build & Deployment (Coolify)

### Build command
```bash
bash scripts/download-fonts.sh && npx expo export --platform web
```

### Prerequisites

- **Node.js**: >=22. No `.nvmrc` or `engines` field — the VPS must run a compatible Node version.
- **Fonts**: `assets/fonts/` is **gitignored**. The build script downloads Satoshi fonts from a Supabase storage bucket. If that bucket is unavailable or the network fails, the build WILL fail. Consider committing fonts to the repo or using a CDN fallback.
- **`.env.local`**: Contains `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_KEY`. Must be present on the build server (not committed to git). These are inlined at build time by Expo.
- **Tamagui babel plugin**: `@tamagui/babel-plugin` is configured in `babel.config.js` and must be installed. Without it, Tamagui CSS extraction fails on static web export.
- **Web output**: Configured as `"output": "static"` in `app.json`. The export outputs to `dist/` by default.
- **Start command (production)**: Coolify defaults to `npm run start` which runs `expo start` (dev server). For production, set the Coolify start command to: `npx serve dist --single --listen $PORT`
- **Supabase client is lazy**: `utils/supabase.ts` exports a Proxy that lazily initializes the client on first use. This prevents `Metro error: supabaseUrl is required.` during static export if env vars are not inlined at module evaluation time.

### CRITICAL: Must-have checklist before export

| Requirement | Status | Notes |
|---|---|---|
| `@tamagui/babel-plugin` in deps + babel config | Required | CSS extraction for web |
| Fonts downloaded to `assets/fonts/` | Required | Run `scripts/download-fonts.sh` first |
| Coolify env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY` | Required | Set in Coolify dashboard → Service → Environment Variables |
| Node.js >=22 | Required | No version file exists, must match VPS |
| All registered `<Stack.Screen>` routes have matching files | Required | Missing files = unresolved module errors |
| `react-native-maps` stubbed for web in metro config | Done | Already configured in `metro.config.js` |
| Coolify start command set to `npx serve dist --single --listen $PORT` | Required | Default `npm run start` runs dev server |

### Known web platform limitations

These don't fail the build but cause missing functionality on web:

- **`@react-native-community/datetimepicker`** (`app/garden/[id]/request.tsx:12`): iOS/Android only. Renders nothing on web. Date selection non-functional on web.
- **`expo-image-picker`** (`app/onboarding/photo.tsx:7`): Limited web support. `allowsEditing` and `aspect` not supported. `requestMediaLibraryPermissionsAsync` is a no-op.
- **`experimentalBlurMethod="dimezisBlurView"`**: Used in 5 files (TopNavPill, BottomNav, pro, garden/[id], garden/[id]/request). iOS-only API. Works on web via CSS fallback but logs warnings.
- **`suppressHighlighting` prop**: React Native Web-specific prop on `Ionicons`. May cause TypeScript errors in `npx tsc --noEmit`. Used in `dashboard.tsx:131`, `owner/dashboard.tsx:147`, `search.tsx:134`.

### SVG rules (CRITICAL)

Metro is configured with `react-native-svg-transformer` in `metro.config.js`. This means:
- **ALL `.svg` imports return React components** (not image URIs)
- Use SVGs as `<MySvg width={100} height={100} />` — NEVER as `<Image source={require("./icon.svg")} />`
- SVGs are removed from `assetExts` and added to `sourceExts`
- This applies to all platforms (iOS, Android, web)

## Architecture

- **Entry point**: `expo-router/entry` (set in `package.json` `"main"`)
- **Root layout**: `app/_layout.tsx` — wraps everything in `TamaguiProvider` (default theme `groenevingers`) and `OnboardingProvider`. All stack screens have `headerShown: false`.
- **Routing**: expo-router. `app/` contains flat route files and subdirectories (`app/garden/[id].tsx` for dynamic routes, `app/onboarding/` for the multi-step flow).
- **Path alias**: `@/*` maps to project root (e.g. `@/tamagui.config`, `@/context/OnboardingContext`).
- **UI components**: `components/ui/` — shared Tamagui-based components (BottomNav, Button, GardenCard, LogCard, Onboarding, etc.).
- **State**: `context/OnboardingContext.tsx` — React context for the onboarding wizard (role, name, email, description, password, profileImage).
- **Backend**: `utils/supabase.ts` — Supabase client with cross-platform storage (localStorage on web, AsyncStorage on native, in-memory fallback). Uses a Proxy for lazy initialization (prevents Metro crash at build time if `EXPO_PUBLIC_*` env vars aren't inlined).
- **Validation**: Zod schemas defined inline in route files (`app/onboarding/info.tsx`, `app/onboarding/security.tsx`, `app/garden/[id]/request.tsx`).

## Route structure

Root layout:
- `app/_layout.tsx` — Root layout with TamaguiProvider, OnboardingProvider, font loading. All stack screens have `headerShown: false`.

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

### `notifications` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid | FK to `profiles` |
| `type` | text | e.g. `'request_status_change'`, `'new_message'` |
| `title` | text | |
| `body` | text | |
| `read` | boolean | default false |
| `created_at` | timestamp | |

RLS: SELECT own user_id; UPDATE own user_id (for marking read).
Schema file: `supabase_notifications.sql`.
Used in: `app/notifications.tsx` (SELECT).

### Schema files
- `supabase_schema.sql` — full schema DDL with RLS policies
- `supabase_seeder.sql` — sample seed data for profiles, gardens, garden_logs
- `supabase_chat.sql` — conversations and messages tables with RLS policies, trigger for auto-updating `updated_at`
- `supabase_notifications.sql` — notifications table with RLS policies

## Environment variables (`.env.local`)

- `EXPO_PUBLIC_SUPABASE_URL` — Supabase project URL
- `EXPO_PUBLIC_SUPABASE_KEY` — Supabase anon key

## Key conventions and quirks

- **Custom fonts**: Satoshi font family (Light, Regular, Medium, Bold, Black) is loaded via `useFonts` in `_layout.tsx` from `assets/fonts/`. These files are **gitignored** — if fonts are missing, `npm start` will fail to load them.
- **SVG imports**: Metro is configured with `react-native-svg-transformer` — SVGs are imported as React components, not as image assets.
- **Tamagui theme**: Uses a custom theme `groenevingers` with green/earth-tone palette. Set as `defaultTheme` in the root provider.
- **Native directories**: `/android` and `/ios` are generated by Expo and gitignored. Do not manually edit them; use `npx expo prebuild` to regenerate.
- **`.env.local`**: Contains real Supabase credentials (`EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`). Do not commit.
- **Duplicate Garden types**: Shared types are defined in `types/garden.ts`. Avoid defining inline types for gardens, reviews, or collaborations.
- **newArchEnabled**: true in `app.json` — the app uses React Native's new architecture.
- **React Compiler**: Enabled via `"reactCompiler": true` in `app.json`. Works with Tamagui babel plugin.
- **Route registration**: All `<Stack.Screen name="...">` entries in `_layout.tsx` MUST have a corresponding file in `app/`. Missing files cause unresolved module errors.
- **No UPDATE/DELETE operations**: Only INSERT and SELECT operations are implemented in the codebase.
- **Hardcoded fallback data**: `app/garden/[id].tsx` has 3 hardcoded gardens as Supabase fallback. `app/logbook.tsx` uses hardcoded mock logs.
- **Component naming**: `app/splash.tsx` exports a component named `SplashScreen`, which shadows the `SplashScreen` import from `expo-router` in `_layout.tsx`. Not a build error but confusing.
- **Zod v4**: Uses `"zod": "^4.4.2"` (major version 4). Breaking changes from v3 exist in `z.custom` and `z.object().refine()` APIs. Verify compatibility if upgrading/downgrading.
- **No Node version constraint**: No `.nvmrc` or `engines` field in `package.json`. Requires Node >=22.
- **`react-native-web@~0.21.0`**: Must be compatible with `react-native@0.81.5`. Managed by Expo, do not manually bump without Expo upgrade.

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
4. **Merge into staging (ASK)** — Before merging into `staging`, ask the user explicitly:
   > "Can I merge `<branch-name>` into `staging`?"
   Do NOT merge without an affirmative answer.
5. **Push** — When the task is complete or at natural breakpoints:
   ```
   git push -u origin <branch>
   ```
