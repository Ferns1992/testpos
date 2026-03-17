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

  console.log('Backend path:', backendPath);

  const nodeExe = process.platform === 'win32' ? 'node.exe' : 'node';
  const nodePath = process.platform === 'win32'
    ? path.join(process.env['ProgramFiles'] || 'C:\\Program Files', 'nodejs', nodeExe)
    : 'node';

  if (process.platform === 'win32') {
    backendProcess = spawn(nodePath, ['server.js'], {
      cwd: backendPath,
      detached: false,
      stdio: 'pipe',
      env: { ...process.env, PORT: '3001', DB_PATH: path.join(app.getPath('userData'), 'quickmart.db') }
    });
    
    backendProcess.stdout.on('data', (data) => {
      console.log('Backend:', data.toString());
    });
    
    backendProcess.stderr.on('data', (data) => {
      console.log('Backend error:', data.toString());
    });
  } else {
    backendProcess = spawn('node', ['server.js'], {
      cwd: backendPath,
      stdio: 'inherit',
      env: { ...process.env, PORT: '3001', DB_PATH: path.join(app.getPath('userData'), 'quickmart.db') }
    });
  }

  console.log('Backend starting on port 3001...');
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
  }, 4000);

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
