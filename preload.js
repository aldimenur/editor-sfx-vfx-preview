const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFileLocation: (fileName) =>
    ipcRenderer.invoke("open-file-location", fileName),
  openVFXLocation: (fileName) =>
    ipcRenderer.invoke("open-vfx-location", fileName),
  openMusicLocation: (fileName) =>
    ipcRenderer.invoke("open-music-location", fileName),
  getFullFilePath: (fileName, category) =>
    ipcRenderer.invoke("get-full-file-path", { fileName, category }),
  startDrag: (fileName, category) =>
    ipcRenderer.send("ondragstart", { fileName, category }),
});
