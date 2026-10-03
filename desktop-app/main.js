const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const http = require('http');

let mainWindow;

function checkDevServer(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve(res.statusCode === 200);
    }).on('error', () => {
      resolve(false);
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 880,
    minWidth: 960,
    minHeight: 650,
    title: "Hyperlocal Emergency Response Platform - Desktop Console",
    backgroundColor: "#0b0f19",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    }
  });

  const devUrl = 'http://127.0.0.1:5173';
  const isDevRunning = await checkDevServer(devUrl);

  if (isDevRunning) {
    console.log("Loading live Vite development server at", devUrl);
    mainWindow.loadURL(devUrl);
  } else {
    const distIndex = path.join(__dirname, '../frontend/dist/index.html');
    console.log("Loading standalone built HTML from", distIndex);
    mainWindow.loadFile(distIndex).catch((err) => {
      console.error("Failed to load local build, please run 'npm run build' in frontend folder.", err);
    });
  }

  // Set application menu
  const menuTemplate = [
    {
      label: 'Emergency Console',
      submenu: [
        { label: 'Reload Application', accelerator: 'CmdOrCtrl+R', click: () => mainWindow.reload() },
        { label: 'Toggle Fullscreen', accelerator: 'F11', click: () => mainWindow.setFullScreen(!mainWindow.isFullScreen()) },
        { type: 'separator' },
        { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() }
      ]
    },
    {
      label: 'Developer',
      submenu: [
        { label: 'Toggle Developer Tools', accelerator: 'F12', click: () => mainWindow.webContents.toggleDevTools() }
      ]
    }
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
