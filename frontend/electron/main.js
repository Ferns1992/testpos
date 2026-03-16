const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow;
let backendProcess;

function startBackend() {
  const backendPath = isDev 
    ? path.join(__dirname, '../backend')
    : path.join(process.resourcesPath, 'backend');

  const backendExe = process.platform === 'win32' 
    ? path.join(backendPath, 'node_modules/.bin/node.cmd')
    : path.join(backendPath, 'node_modules/.bin/node');

  if (process.platform === 'win32') {
    backendProcess = spawn(backendExe, ['server.js'], {
      cwd: backendPath,
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, PORT: '3001', DB_PATH: path.join(app.getPath('userData'), 'quickmart.db') }
    });
  } else {
    backendProcess = spawn('node', ['server.js'], {
      cwd: backendPath,
      stdio: 'inherit',
      env: { ...process.env, PORT: '3001', DB_PATH: path.join(app.getPath('userData'), 'quickmart.db') }
    });
  }

  console.log('Backend starting...');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.setMenuBarVisibility(false);
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:4070');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackend();
  
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
