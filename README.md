# ⚡ FitTrack — Electron Desktop App

Personal fitness tracker built with React + Electron for Windows.

## 📁 Project Structure

```
fittrack-electron/
├── main.js          ← Electron main process (window, menu)
├── preload.js       ← Secure bridge between Electron & React
├── package.json     ← Dependencies & build config
├── public/
│   └── index.html   ← HTML shell
└── src/
    ├── index.js     ← React entry point
    └── App.jsx      ← Full FitTrack app (all features)
```

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node)

### 2. Install dependencies
```bash
npm install
```

### 3. Run in development mode
```bash
npm run dev
```
This starts the React dev server on port 3000, then launches Electron pointing at it.

### 4. Build a Windows installer (.exe)
```bash
npm run dist
```
Output will be in the `dist/` folder as a `.exe` NSIS installer.

---

## 🤖 AI Coach Setup
The AI Coach tab uses the Anthropic Claude API.

The API call is made directly from the renderer (React). For a production app, you should proxy this through a backend to keep your key secure. For personal use, you can add the key to the fetch call in `src/App.jsx`:

```js
headers: {
  "Content-Type": "application/json",
  "x-api-key": "YOUR_KEY_HERE",        // add this line
  "anthropic-version": "2023-06-01",   // add this line
},
```

---

## 🔧 Customization Tips

| What | Where |
|------|-------|
| App colors / theme | Top of `src/App.jsx` (ACCENT, BG, CARD etc.) |
| Window size | `main.js` → `width`, `height` |
| Preset exercises | `PRESET_EXERCISES` in `src/App.jsx` |
| Achievements | `ACHIEVEMENTS` array in `src/App.jsx` |
| App icon | Replace `public/icon.ico` (256×256 .ico file) |

---

## 📦 Tech Stack
- **Electron 28** — Desktop shell
- **React 18** — UI framework  
- **Recharts** — Progress graphs
- **localStorage** — Data persistence
- **Anthropic Claude API** — AI Coach
- **electron-builder** — Windows packaging

## 🪟 Windows Build Output
`dist/FitTrack Setup 1.0.0.exe` — NSIS installer with:
- Custom install directory choice
- Start menu shortcut
- Uninstaller included
