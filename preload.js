const { contextBridge, ipcRenderer } = require('electron');
 
contextBridge.exposeInMainWorld('electronAPI', {
  selectVideosFolder: () => ipcRenderer.invoke('select-videos-folder'),
  getVideosFolder: () => ipcRenderer.invoke('get-videos-folder')
}); 