# Map-Based Appointment Scheduler

A React + TypeScript application for cold callers to visually schedule and manage in-person appointments on a map. This helps optimize routes by clustering appointments geographically.

## Features

✅ **Interactive Map** - Google Maps integration with color-coded markers
- Blue: Selected appointment
- Orange: Scheduled appointments  
- Green: Completed appointments
- Red: Cancelled appointments

✅ **Time Labels on Markers** - Each marker displays the appointment time directly on the map

✅ **Date Selector** - 7-day sliding window to filter appointments by date

✅ **Click-to-Add** - Click anywhere on the map to create an appointment at that location

✅ **Google Places Autocomplete** - Smart address search with autocomplete suggestions

✅ **Smart Time Suggestions** - Automatically suggests optimal time slots based on existing appointments

✅ **Nearby Detection** - Shows appointments within 2km when creating new ones

✅ **Status Tracking** - Mark appointments as scheduled, completed, or cancelled

✅ **Route Optimization** - Visual clustering helps plan efficient travel routes

## Setup

1. Install dependencies:
```bash
npm install --legacy-peer-deps
```

2. Create `.env.local` file with your Google Maps API key:
```
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

3. Start the dev server:
```bash
npm run dev
```

## Tech Stack

- React 19.2.0
- TypeScript
- Vite 7.3.1
- Google Maps JavaScript API
- date-fns 3.x
- lucide-react (icons)

## Usage

1. **View Appointments**: Select a date from the top bar to see appointments for that day
2. **Add Appointment**: Click the "New" button or click directly on the map
3. **Enter Details**: Use Google Places autocomplete for addresses
4. **Smart Scheduling**: The app suggests optimal times based on nearby appointments
5. **Track Status**: Update appointment status from scheduled → completed/cancelled
6. **Delete**: Click the trash icon to remove appointments

## API Configuration

The app uses:
- Google Maps JavaScript API (for map display)
- Google Places API (for address autocomplete)
- Nominatim API (for geocoding addresses to coordinates)

Make sure your Google Maps API key has these APIs enabled.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
