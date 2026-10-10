// preload.js
// Runs in renderer context but has access to Node APIs
// Use contextBridge to safely expose any Node/Electron APIs to React if needed

const { contextBridge, ipcRenderer } = require("electron");

// Expose a safe API to the renderer (React app)
contextBridge.exposeInMainWorld("electronAPI", {
  // App version
  getVersion: () => ipcRenderer.invoke("get-version"),

  // Platform info
  platform: process.platform,

  // You can expand this to add file system access, notifications, etc.
  // Example: notify: (title, body) => ipcRenderer.invoke("notify", { title, body })
});
