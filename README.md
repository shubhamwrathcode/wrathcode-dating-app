# DilSe — Premium Dating App (Wrathcode demo)

Static, fully interactive React Native demo of **DilSe**, the white-label "intentional dating" app from the Wrathcode PRD.
No backend yet: every flow runs locally on seeded data through a repository layer that mirrors the future Node.js / Socket.IO API.

- React Native **0.88** (CLI, New Architecture, Hermes) + TypeScript
- **MVVM**: `data` (models, mock, repositories) → `domain` (use cases) → `store` (zustand, persisted) → `viewmodels` (hooks) → `screens` (views)
- Reanimated 4 + Gesture Handler for 60fps UI-thread animation; react-native-svg for icons, gradients, rings and charts
- Light + dark theme, English + Hindi, every animation respects the OS *Reduce motion* setting

## Setup

```bash
npm run setup          # installs navigation, reanimated, worklets, gesture-handler, svg, zustand, async-storage
npm run fonts          # links Poppins + Lora (assets/fonts) into iOS & Android
npm run pods           # iOS only
npm start -- --reset-cache
npm run android        # or: npm run ios
```

`npm run setup` installs the latest compatible versions. If you install `react-native-reanimated@3` instead of 4,
change the last Babel plugin in `babel.config.js` to `'react-native-reanimated/plugin'` and drop `react-native-worklets`.

## Demo logins

| Persona | Phone | OTP |
|---|---|---|
| Aarav (man, looking for women) | 99999 00001 | 123456 |
| Sara (woman, looking for men) | 99999 00002 | 123456 |

Both have pre-made matches and chats. Any other 10-digit number (or Google / Apple) starts a new account and runs full onboarding.
Seeded chats demo each story beat: an active chat with unread messages, a **48h reply reminder**, a **5-day close-chat** suggestion, a Super Like match and a fresh match with **AI icebreakers**.

## 5-minute sales demo

1. **Splash → Welcome**: heart draws and fills, parallax carousel.
2. **Onboarding** (new number): intent selection, photos with drag-to-reorder, selfie verification → blue tick.
3. **Picks** tab: compatibility rings count up, tap a pick for *Why you match*.
4. **Discover**: swipe right / left / up (super like), tap the photo to flip, tap the info area for the full profile. Likes on people who already liked you trigger **It's a Match**.
5. **Chat**: icebreakers, voice note (mic → send), `+` → *Plan a date*, long-press a bubble to react or reply, double-tap for ❤️, `⋯` → demo screenshot alert / close chat kindly / report.
6. **Profile → Safety centre**: verified-only, trusted contact, date check-in with hold-to-SOS.
7. **Likes** tab: blurred grid → *Unlock* → paywall → purchase → success → likes unlocked.

## Folder structure

```
src/
  app/                 App root, providers, store hydration
  core/
    constants/         Plans, intents, interests, prompts, limits
    theme/             Design tokens from the PRD (colours, gradients, type, spacing, shadows, motion)
    i18n/              English / Hindi strings
    hooks/             Voice recorder, playback, ticking clock
    services/          Haptics, moderation (profanity / NSFW / scam), icebreakers, realtime transport, storage
    utils/             Dates, formatting, seeded RNG, compatibility scoring
  data/
    models/            Typed domain models
    mock/              70 seeded profiles, photos, demo personas + chats
    repositories/      auth / profile / chat / premium — swap internals for real APIs
  domain/              Use cases: swipe & match, send message, sign-in / delete account
  store/               zustand stores (session, settings, discovery, chat, premium, notifications, toast)
  navigation/          Root stack (auth → onboarding → app), custom animated tab bar
  components/          Design-system components (buttons, chips, sheets, rings, photo grid, waveform…)
  features/
    auth/              Splash, Welcome, Login, OTP
    onboarding/        Name+DOB, Gender, Intent, Photos, Interests, Prompts, Lifestyle, Voice, Location, Verify, All set
    discover/          Swipe deck, Filters sheet, Profile detail, It's a Match
    picks/             Daily Picks, Likes you
    chat/              Chats list, Chat room, Date planner, Audio/video call
    profile/           My profile, Edit, Preview, Settings, Notifications
    safety/            Safety centre, Report flow
    premium/           Paywall, Boost, Purchase success
```

Each feature follows the same pattern: `screens/` render, `viewmodels/use*ViewModel.ts` own state and logic, `components/` are feature-local UI.

## Where the backend plugs in

| Today (static) | Production |
|---|---|
| `authRepository` (OTP 123456) | Firebase Auth / MSG91 + JWT |
| `profileRepository` + `data/mock` | REST + MongoDB 2dsphere |
| `core/services/realtime.ts` + `chatRepository` | `socket.io-client` (same events: `message`, `status`, `typing`) |
| `premiumRepository` | RevenueCat (Play Billing / StoreKit), Razorpay on web |
| `icebreakers.ts` | LLM endpoint with both profiles as input |
| `moderation.ts` | Rekognition / Vision NSFW, profanity library |
| `haptics.ts` (Vibration API) | `react-native-haptic-feedback` |
| Demo gallery pickers, simulated recorder & liveness | image picker + crop, audio recorder, liveness SDK, Agora/WebRTC |

Fonts: **Poppins** (Regular / Medium / Bold) for the UI and **Lora SemiBold Italic** for romantic moments (splash, It's a Match), both OFL-licensed, in `assets/fonts`. Change them in `src/core/theme/tokens.ts`.
