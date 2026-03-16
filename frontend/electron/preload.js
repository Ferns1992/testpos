const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openExternal: (url) => require('electron').shell.openExternal(url),
  platform: process.platform
});
