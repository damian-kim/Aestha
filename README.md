# rubato

A quiet, fullscreen-friendly stopwatch, countdown timer, Pomodoro, alarm, and clock. Detailed photographic-style landscapes, a borderless movable and resizable time display, and settings revealed near a subtle gear icon. No accounts, backend, analytics, or sounds.

## Run locally

Use Node.js 22 or newer.

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173. Production build: `npm run build`.

## Deploy on Vercel

Import this GitHub repository into Vercel. The included `vercel.json` sets `npm run build` as the build command and `dist` as the output directory. No environment variables or database are needed.

## Interaction

- First visit: enter fullscreen or choose **Stay here**. Fullscreen remains available in settings.
- Click the mode label to select and configure a mode. Applying a configuration resets the current session; an alarm is armed immediately.
- Hover the display to reveal start, pause, reset, and subtle corner resize marks. Drag the time display to move it. There is no visible enclosing frame, even while resizing.
- Hover anywhere in the bottom 100 pixels to reveal settings; the gear marks the region. On touch screens, tap the gear or the bottom 84 pixels. The first-visit invitation uses a smaller region to keep its buttons clear. Settings are also reachable through normal keyboard focus.
- Themes change only the background. Font size and Ink/Ivory text tone are independent preferences, so text can suit any position on a photograph. Font size adapts down when needed to fit the display.
- Reset settings restores defaults; the temporary **Undo** action restores the previous configuration and session.

## Local data and timing

Preferences are stored under `rubato.preferences.v1` in `localStorage`; the current session is stored under `rubato.session.v1`. The app migrates preferences and sessions saved under the previous Aestha name when first opened after the rename. Storage is per browser profile and site origin, not per identity. Different devices, browsers, preview URLs, and domains have separate settings. Clearing site data removes them. If storage is unavailable, the app still works for the current visit. Preferences and sessions synchronize between tabs of the same origin.

Timers use timestamps rather than counting interval ticks, so elapsed time is recovered after tab throttling, refreshes, or device sleep. System clock adjustments can affect active timers. Pomodoro automatic transitions reconcile missed phases. Alarms are silent visual reminders for the next occurrence of a local time: the page must be open, and a sleeping device cannot display a reminder until it wakes. No background notifications or service worker are used.

Alpine, Forest, Dunes, and Stars use original AI-generated photographic-style images, served as optimized WebP files with separate thumbnails. Paper remains an SVG. See [background assets and generation prompts](assets/BACKGROUNDS.md) for provenance and native resolution. Fonts are bundled locally with their SIL Open Font Licenses, with system fallbacks. The page makes no third-party requests.

## Verification

```sh
npm test
npx playwright install chromium
npm run test:browser
```

Timing tests cover pause/resume, refresh recovery, late callbacks, Pomodoro transitions, alarm scheduling, and storage validation. Browser tests cover interaction, preference persistence, fullscreen, moving/resizing, mobile layout, and storage failure.
