# KeebTestSuite

A desktop keyboard testing suite for Windows, built with Electron. Test every
key on any keyboard size, measure typing speed, play a typing game, and see a
live heatmap of your press history.

## Features

- **Key Tester** — on-screen keyboards for 100% (full-size), TKL, 96% (1800-compact),
  75%, 65%, 60%, and 40% ANSI layouts. Press a key and it lights up green as
  "tested." Detects simultaneous key rollover (NKRO), chatter/double-actuation,
  and stuck keys, all in real time. Every key is matched by physical
  `KeyboardEvent.code`, so detection works regardless of your OS keyboard
  layout or language.
- **Typing Speed Test** — type a randomly generated passage, see live WPM and
  accuracy, with per-character correctness highlighting.
- **Falling Words** — an arcade-style typing game: words fall from the top of
  the screen and you have to type them before they hit the floor. Difficulty
  ramps up as your score grows.
- **Heatmap & Stats** — a persistent, color-coded heatmap of every key you've
  pressed across all views and sessions, plus a stats dashboard (total
  presses, best WPM, max rollover ever recorded, games played).

## Development

```
npm install
npm start
```

## Building the Windows executable

```
npm install
npm run dist:win          # portable .exe + NSIS installer .exe
npm run dist:win:portable # portable .exe only
```

Output lands in `release/`. Building the Windows target from Linux/macOS
requires Wine (used by electron-builder to inject the app icon/metadata into
the Windows executable).

## Project layout

```
main/            Electron main process + preload script
renderer/        UI (plain HTML/CSS/JS, no framework, no bundler)
  js/layouts.js    Keyboard layout definitions (all sizes)
  js/keyboard.js   Renders a layout into DOM
  js/keytester.js  Key Tester logic (pass/fail, rollover, chatter, stuck keys)
  js/games.js      Speed Test + Falling Words game logic
  js/stats.js      Persistent press-count store (localStorage)
  js/heatmap.js    Heatmap rendering
  js/app.js        View routing + wiring
build/           App icon (icon.png / icon.ico)
scripts/         Icon generator (Pillow)
```
