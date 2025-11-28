const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("appWindow", {
	openDiscord: () => ipcRenderer.send("open-discord"),
	openFAQ: () => ipcRenderer.send("open-faq"),
	openGitHub: () => ipcRenderer.send("open-github"),
	openDataFolder: () => ipcRenderer.send("open-data-folder"),
});
