/*
Wrapper: Offline
License: MIT
*/

const env = Object.assign(process.env, require("../../env.json"), require("../../config.json"));

import { app, BrowserWindow, Menu, shell, ipcMain } from "electron";
import { createWriteStream } from "fs";
import { join } from "path";
import settings from "../shared/storage/settings";
import { fork } from "child_process";

const IS_DEV = app.commandLine.getSwitchValue("dev") != null;

if (!IS_DEV) {
	const serverProc = fork(join(__dirname, "./server.js"), ["--dev"]);
	// serverProc.stdout.on("data", (c) => console.log(c));
	// serverProc.stderr.on("data", (c) => console.error(c));
}

/*
log files
*/
if (settings.saveLogFiles) {
	const filePath = join(env.LOG_FOLDER, new Date().valueOf() + ".txt");
	const writeStream = createWriteStream(filePath);
	console.log = console.error = console.warn = function (c) {
		writeStream.write(c + "\n");
		process.stdout.write(c + "\n");
	};
	process.on("exit", () => {
		console.log("Exiting...");
		writeStream.close();
	});
}

/*
load flash player
*/
let pluginName:string;
switch (process.platform) {
	case "win32": {
		pluginName = "./extensions/pepflashplayer.dll";
		break;
	}
	case "darwin": {
		pluginName = "./extensions/PepperFlashPlayer.plugin";
		break;
	}
	case "linux": {
		pluginName = "./extensions/libpepflashplayer.so";
		app.commandLine.appendSwitch("no-sandbox");
		break;
	}
	default: {
		throw new Error("You are running Wrapper: Offline on an unsupported platform.");
	}
}
app.commandLine.appendSwitch("ppapi-flash-path", join(__dirname, pluginName));
app.commandLine.appendSwitch("ppapi-flash-version", "32.0.0.371");

app.commandLine.appendSwitch("disable-http-cache");

let mainWindow:BrowserWindow;
const createWindow = () => {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 700,
		title: "Wrapper: Offline",
		icon: join(__dirname, "app/favicon.ico"),
		webPreferences: {
			preload: join(__dirname, "preload.js"),
			plugins: true,
			contextIsolation: true
		}
	});
	setMenuBar(mainWindow);

	ipcMain.on("open-discord", openDiscord);
	ipcMain.on("open-github", openGithub);

	if (IS_DEV) {
		const host = app.commandLine.getSwitchValue("host");
		const port = app.commandLine.getSwitchValue("port");
		mainWindow.loadURL(`http://${host}:${port}`);
	} else {
		mainWindow.loadFile(join(__dirname, "index.html"));
	}
	mainWindow.on("closed", () => process.exit(0));
};

async function openDiscord() {
	await shell.openExternal("https://discord.gg/Kf7BzSw");
}
async function openGithub() {
	await shell.openExternal("https://github.com/wrapper-offline/wrapper-offline");
}

app.whenReady().then(() => {
	setTimeout(createWindow, 2000);

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
	
});
app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});

function setMenuBar(mainWindow:BrowserWindow) {
	mainWindow.setAutoHideMenuBar(settings.hideNavbar);
	Menu.setApplicationMenu(Menu.buildFromTemplate([
		{
			label: "Home",
			click: () => {
				mainWindow.loadURL("http://localhost:4343")
			}
		},
		{
			label: "View",
			submenu: [
				{ type: "separator" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ role: "resetZoom" },
				{ type: "separator" },
				{ role: "toggleDevTools" },
				{ role: "reload" },
				{ role: "forceReload" },
				{ type: "separator" },
				{ role: "minimize" },
				// ...(process.platform == "darwin" ? [
				// 	{ role: "front" },
				// 	{ type: "separator" },
				// 	{ role: "window" }
				// ] : [
				// 	{ role: "close" }
				// ]),
			]
		},
		{
			role: "help",
			submenu: [
				{
					label: "Discord Server",
					click: openDiscord
				},
				{
					label: "GitHub",
					click: openGithub
				}
			]
		}
	]));
}
