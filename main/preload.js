const { contextBridge, webFrame } = require('electron');

contextBridge.exposeInMainWorld('keebApi', {
  platform: process.platform,
  zoomReset: () => webFrame.setZoomFactor(1)
});
