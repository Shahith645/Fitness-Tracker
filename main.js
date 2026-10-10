const { app, BrowserWindow, shell, Menu } = require("electron");
const path = require("path");
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "FitTrack",
    backgroundColor: "#0a0a0f",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
    // Frameless custom titlebar (optional, gives premium look)
    titleBarStyle: "hiddenInset",
    show: false, // wait until ready
  });

  // Load React dev server in dev, built files in production
  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "build", "index.html"));
  }

  // Show window when fully loaded (avoids white flash)
  win.once("ready-to-show", () => win.show());

  // Open external links in browser, not in app
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

// Custom app menu
const menuTemplate = [
  {
    label: "FitTrack",
    submenu: [
      { label: "About FitTrack", role: "about" },
      { type: "separator" },
      { label: "Quit", accelerator: "Ctrl+Q", click: () => app.quit() },
    ],
  },
  {
    label: "Edit",
    submenu: [
      { role: "undo" }, { role: "redo" }, { type: "separator" },
      { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" },
    ],
  },
  {
    label: "View",
    submenu: [
      { role: "reload" },
      { role: "forceReload" },
      { type: "separator" },
      { role: "resetZoom" },
      { role: "zoomIn", accelerator: "Ctrl+=" },
      { role: "zoomOut" },
      { type: "separator" },
      { role: "togglefullscreen" },
      ...(isDev ? [{ type: "separator" }, { role: "toggleDevTools" }] : []),
    ],
  },
  {
    label: "Window",
    submenu: [{ role: "minimize" }, { role: "zoom" }, { role: "close" }],
  },
];

app.whenReady().then(() => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
