const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("appWindow", {
	closeWrapper: () => ipcRenderer.send("exit"),
	openDiscord: () => ipcRenderer.send("open-discord"),
	openFaq: () => ipcRenderer.send("open-faq"),
	openThemeFolder: () => ipcRenderer.send("theme-folder"),
});
