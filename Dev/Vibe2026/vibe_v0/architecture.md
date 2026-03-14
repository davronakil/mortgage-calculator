# Vibe – Architecture

## App Structure (Next.js 14 App Router)

- **Routes:** `app/` – layout, page (home), about, auth/login, auth/callback, event/[...params], user/[...params], eat, chat, favorites, profile, onboarding
- **Layout:** `layout.tsx` – metadata, AuthProvider, UserRelationsProvider, NotificationProvider, Analytics
- **Components:** `components/` – AppShell, EventCard, ProfileCard, CreateEventModal, EventExpenses, EventDiscussion, LocationAutocomplete, MarkdownEditor, RichText, RadiusFilter
- **Page clients:** `components/pages/` – HomePageClient, EatPageClient, EventDetailClient, UserProfileClient, ProfilePageClient, ChatPageClient, FavoritesPageClient, OnboardingPageClient
- **Lib:** AuthProvider (user/profile/session, signOut, getSession retries), UserRelationsProvider, NotificationProvider; supabase client (browser singleton, resetSupabaseClient on signOut), server, middleware
- **Hooks:** useEvents, useCompatibleUsers
- **Utils:** slug (eventUrl, profileUrl), displayName, avatarColor, compatibility, distance (miles)
- **Types:** `types/database.ts` – Profile, VibeEvent, etc. Keep in sync with DB.

## Data & Auth

- **Auth:** Magic link → `/auth/callback` → 200 HTML + Set-Cookie + client redirect (Safari-safe). AuthProvider: getSession (with retries off auth pages), onAuthStateChange; SIGNED_OUT → resetSupabaseClient.
- **Data:** Client-side Supabase in useEffect/hooks; no global store.
- **DB:** profiles, interests, user_interests, events, event_attendees, event_comments, event_expenses, follows, favorites, messages. RLS on all. See supabase-schema.sql.
- **Events:** type (eat|sport|business|hobby|travel|custom), payment_type (on_me|split|they_pay|free|na|pay_self), visibility (public|private).

## Patterns

- **URLs:** Descriptive slugs via eventUrl(id, title), profileUrl(id, displayName); routes use [...params], first segment = id.
- **OG:** generateMetadata in event/user pages; fallback og-default.jpg.
- **Location:** Google Places + device location + reverse geocoding; store lat/lng, city. Distance in miles.
- **Rich text:** Markdown in event descriptions; RichText + MarkdownEditor.
