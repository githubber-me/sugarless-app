# Sugarless - Diabetic Foot & Nerve Care App

**Tagline:** *See. Feel. Prevent.*

Sugarless helps people with diabetes protect their legs and feet through two simple, science-backed habits:

1. **Daily photo tracking** — detect visual changes early
2. **Sensation check** — screen for neuropathy using gentle guided touches

## Features

### Core Features

#### 1. Daily Foot Photo
- Guided camera overlay for consistent angle tracking (left/right foot)
- Auto-capture with review and annotation
- Date stamping and foot side tracking
- Optional wound tagging and notes
- Photo history and timeline

#### 2. Leg Sensation Check
- Based on the **Ipswich Touch Test**
- Interactive guided test for 6 touch points (1st, 3rd, 5th toes on each foot)
- Voice-guided instructions from Sugi
- Three response options: Felt / Faint / Not Felt
- Results visualization with per-toe heatmap
- Risk classification:
  - ✅ Normal (5-6/6 touches felt)
  - ⚠️ Borderline (4/6)
  - 🔴 At-Risk (≤3/6)

#### 3. Photo Comparison
- Before/After slider to compare photos over time
- Visual change detection
- Date-based photo selection

#### 4. Sugi - Your Digital Nurse
- Turquoise droplet mascot with gentle animations
- Encouraging messages and guidance
- Gentle bounce and pulse animations

## Tech Stack

- **Framework:** React Native + Expo
- **Language:** TypeScript
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **Storage:** AsyncStorage (local, encrypted)
- **Camera:** Expo Camera
- **UI:** React Native with custom components
- **State:** React Hooks

## Project Structure

```
sugarless-app/
├── src/
│   ├── components/
│   │   ├── Sugi.tsx                 # Animated mascot
│   │   └── SugiMessage.tsx          # Message bubble
│   ├── constants/
│   │   └── colors.ts                # Color palette
│   ├── navigation/
│   │   ├── AppNavigator.tsx         # Stack navigator
│   │   └── TabNavigator.tsx         # Bottom tabs
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Home dashboard
│   │   ├── PhotosScreen.tsx         # Photo gallery
│   │   ├── CheckScreen.tsx          # Sensation check info
│   │   ├── TakePhotoScreen.tsx      # Camera screen
│   │   ├── ComparePhotosScreen.tsx  # Photo comparison
│   │   ├── SensationTestScreen.tsx  # Interactive test
│   │   └── SensationResultsScreen.tsx # Results + heatmap
│   ├── storage/
│   │   └── index.ts                 # AsyncStorage utils
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   └── utils/
│       ├── dateHelpers.ts           # Date formatting
│       └── sensationHelpers.ts      # Test logic
├── App.tsx
├── app.json
└── package.json
```

## Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator

### Setup Steps

1. **Clone the repository:**
   ```bash
   cd sugarless-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npx expo start
   ```

4. **Run on your device:**
   - **iOS:** Press `i` to open iOS Simulator
   - **Android:** Press `a` to open Android Emulator
   - **Physical Device:** Scan the QR code with Expo Go app

## Running the App

### Development

```bash
# Start Metro bundler
npx expo start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

### Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Color Palette

The app uses a calming, healthcare-friendly color scheme:

- **Primary:** Turquoise (`#40E0D0`) - Calming, medical
- **Secondary:** Coral (`#FF6B7A`) - Warm, friendly
- **Success:** Green (`#34D399`) - Positive feedback
- **Warning:** Amber (`#FBBF24`) - Borderline results
- **Danger:** Red (`#EF4444`) - At-risk results
- **Background:** Light Gray (`#F8F9FA`) - Clean, minimal

## Key Screens

### 1. Home Screen
- Personalized greeting based on time of day
- Animated Sugi mascot
- Quick action cards for main features
- Recent activity timeline
- Last session timestamps

### 2. Photos Screen
- Grid view of all foot photos
- Take new photo button
- Compare photos button
- Foot side labels and wound indicators
- Date stamps

### 3. Check Screen
- Sensation check introduction
- Ipswich Touch Test explanation
- Start test button
- Last test result card with classification
- Educational content

### 4. Take Photo Screen
- Camera view with overlay guide
- Capture button
- Review and annotate captured photo
- Foot side selector (Left/Right)
- Optional wound tag
- Notes field

### 5. Compare Photos Screen
- Photo selection carousels (Before/After)
- Side-by-side comparison with slider divider
- Date labels
- Visual change detection

### 6. Sensation Test Screen
- Progress bar (1/6, 2/6, etc.)
- Current toe instruction
- Visual foot diagram with toe highlights
- Three response buttons:
  - Felt (Green)
  - Faint (Amber)
  - Not Felt (Red)

### 7. Results Screen
- Classification badge with emoji
- Score display (X/6)
- Sugi encouragement message
- Detailed heatmap visualization
- Per-toe results grid
- Color legend
- Back to home button

## Data Models

### PhotoSession
```typescript
{
  id: string;
  timestamp: number;
  footSide: 'left' | 'right';
  imagePath: string;
  notes?: string;
  hasWound?: boolean;
}
```

### SensationSession
```typescript
{
  id: string;
  date: number;
  results: SensationSite[];
  totalScore: number;
  classification: 'normal' | 'borderline' | 'at-risk';
}
```

### SensationSite
```typescript
{
  toe: 1 | 3 | 5;
  foot: 'left' | 'right';
  response: 'felt' | 'faint' | 'not-felt' | null;
}
```

## Storage

All data is stored locally using AsyncStorage:

- **Photo Sessions:** `@sugarless_photo_sessions`
- **Sensation Sessions:** `@sugarless_sensation_sessions`
- Encrypted at rest (iOS: NSFileProtectionComplete)
- No cloud sync in v1.0 (local-only for privacy)

## Future Roadmap

### v1.1
- AI color change detection for wounds
- Push notifications for daily reminders
- Export data to PDF for doctor visits

### v1.2
- iCloud sync (optional)
- HealthKit integration
- Multi-user support for caregivers
- Trends and charts

### v1.3
- Apple Watch companion app
- Voice-only mode for accessibility
- Multi-language support

## Permissions Required

### iOS
- Camera (NSCameraUsageDescription)
- Photo Library (NSPhotoLibraryUsageDescription)
- Microphone (optional, for voice guidance)

### Android
- CAMERA
- READ_EXTERNAL_STORAGE
- WRITE_EXTERNAL_STORAGE
- RECORD_AUDIO (optional)

## Design Philosophy

- **Calming:** Soft colors, gentle animations
- **Simple:** 3-tab navigation, clear hierarchy
- **Friendly:** Sugi mascot provides companionship
- **Privacy-First:** All data stays on device
- **Accessible:** Large touch targets, clear labels
- **Medical:** Evidence-based (Ipswich Touch Test)

## Testing

```bash
# Run tests (when added)
npm test

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

## Contributing

This is a healthcare app. All contributions should:
1. Follow evidence-based medical practices
2. Prioritize user privacy and data security
3. Maintain accessibility standards
4. Include proper error handling

## License

Copyright © 2025 Sugarless. All rights reserved.

## Support

For support, please contact: support@sugarless.app

---

**Made with care for people with diabetes** 🩵
