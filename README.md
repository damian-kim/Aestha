# rubato

A quiet, fullscreen-friendly stopwatch, countdown timer, Pomodoro, alarm, and clock. Detailed photographic-style landscapes, a borderless movable and resizable time display, and settings revealed near a subtle gear icon. No accounts, backend, or analytics.

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
- Timer, Pomodoro, and alarm share a selectable alert sound: Chime, Bell, Gentle notes, Digital beep, or Off. Preview a sound while configuring a mode. The alert repeats until dismissed or the next action is started.
- Pomodoro stops at the end of each focus and break phase. Press **Start break**, **Start long break**, or **Start study** when ready; phases never switch automatically.
- Hover the display to reveal start, pause, reset, and subtle corner resize marks. Drag the time display to move it. There is no visible enclosing frame, even while resizing.
- Click or tap the gear to toggle settings. Close them with the gear, close button, Escape, or a click outside the panel. Keyboard users can focus the gear and press Enter or Space. The subtle fullscreen icon beside it follows the selected text tone.
- Browse 53 backgrounds, including three NYC views over Central Park, using search and six categories: Nature, Space, Interiors, Illustrated, Places, and Abstract. The gallery scrolls inside settings. Small thumbnails load as needed; full backgrounds load only when selected.
- Themes change only the background. Font size and Ink/Ivory text tone are independent preferences, so text can suit any position on a photograph. Font size adapts down when needed to fit the display. Ivory works well with the darker space and interior scenes.
- Reset settings restores defaults; the temporary **Undo** action restores the previous configuration and session.

## Local data and timing

Preferences are stored under `rubato.preferences.v1` in `localStorage`; the current session is stored under `rubato.session.v1`. The app migrates preferences and sessions saved under the previous Aestha name when first opened after the rename. Storage is per browser profile and site origin, not per identity. Different devices, browsers, preview URLs, and domains have separate settings. Clearing site data removes them. If storage is unavailable, the app still works for the current visit. Preferences and sessions synchronize between tabs of the same origin.

Timers use timestamps rather than counting interval ticks, so elapsed time is recovered after tab throttling, refreshes, or device sleep. System clock adjustments can affect active timers. Pomodoro phases wait for a button press. Alarms sound at the next occurrence of a local time when the page is open and the device is awake. Browser audio may require an interaction after reloading the page. No background notifications or service worker are used.

The collection contains 52 AI-generated photographic-style and illustrated images, served as optimized WebP files with separate thumbnails, plus the Paper SVG. See [background assets and generation prompts](assets/BACKGROUNDS.md) for provenance and native resolution, and [the contact sheet](design/background-contact-sheet.webp) to see all 53 at once. Fonts are bundled locally with their SIL Open Font Licenses, with system fallbacks. The page makes no third-party requests.

## Verification

```sh
npm test
npx playwright install chromium
npm run test:browser
```

Timing tests cover pause/resume, refresh recovery, late callbacks, Pomodoro transitions, alarm scheduling, and storage validation. Browser tests cover interaction, preference persistence, fullscreen, moving/resizing, mobile layout, and storage failure.
