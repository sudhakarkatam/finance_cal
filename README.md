# Financial Calculators PWA

A comprehensive mobile-first financial calculator application built with React, Vite, and Capacitor. Calculate Simple Interest, Compound Interest, SIP, Mutual Fund returns, and SWP with beautiful, intuitive interfaces.

## Features

✨ **Multiple Calculators:**
- Simple Interest Calculator
- Compound Interest Calculator
- SIP (Systematic Investment Plan) Calculator
- Mutual Fund Returns Calculator
- SWP (Systematic Withdrawal Plan) Calculator

📱 **Mobile-First Design:**
- Native Android/iOS app experience via Capacitor
- Progressive Web App (PWA) support
- Responsive, touch-optimized UI
- Material Design inspired interface

💾 **Offline Storage:**
- Save calculations with notes
- View calculation history
- All data stored locally (no internet required)

📊 **Visual Results:**
- Interactive donut charts
- Real-time calculations
- Clear breakdowns of results

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Mobile:** Capacitor
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Charts:** Recharts
- **Storage:** LocalStorage API

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### Building for Mobile

#### Initial Setup
```bash
# Initialize Capacitor (already configured)
# Add platforms
npx cap add android
npx cap add ios
```

#### Build and Sync
```bash
# Build the web app
npm run build

# Sync with native platforms
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode (macOS only)
npx cap open ios
```

### Running on Device/Emulator

```bash
# For Android
npx cap run android

# For iOS (macOS only)
npx cap run ios
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI components
│   ├── CalculatorLayout.tsx
│   ├── CalculatorInput.tsx
│   ├── ResultChart.tsx
│   └── SaveDialog.tsx
├── pages/
│   ├── SimpleInterest.tsx
│   ├── CompoundInterest.tsx
│   ├── SIPCalculator.tsx
│   ├── MutualFund.tsx
│   ├── SWPCalculator.tsx
│   └── History.tsx
├── lib/
│   ├── calculations.ts  # Calculation logic
│   └── storage.ts       # Local storage utilities
└── App.tsx
```

## Capacitor Configuration

The app is configured with:
- **App ID:** `app.lovable.b646d752928b462a9fbfb1e70f10f4f3`
- **App Name:** Financial Calculators
- **Web Dir:** dist

For production deployment, update the server URL in `capacitor.config.ts`.

## PWA Features

- Offline functionality
- Add to home screen
- App-like experience on mobile browsers
- Service worker for caching

## License

MIT

## Credits

Built with ❤️ using Lovable
