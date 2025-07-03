const { contextBridge, ipcRenderer } = require('electron');
 
contextBridge.exposeInMainWorld('electronAPI', {
  selectVideosFolder: () => ipcRenderer.invoke('select-videos-folder'),
  getVideosFolder: () => ipcRenderer.invoke('get-videos-folder'),
  openControlsWindow: () => ipcRenderer.send('open-controls-window'),
  closeControlsWindow: () => ipcRenderer.send('close-controls-window')
}); 