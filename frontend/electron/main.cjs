const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 650,
    title: "Hyperlocal Emergency Response Platform - Desktop App",
    backgroundColor: "#0b0f19",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // In development, load from Vite dev server URL
  const devUrl = 'http://localhost:5173';
  win.loadURL(devUrl).catch(() => {
    // If dev server not found, load built index.html
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
