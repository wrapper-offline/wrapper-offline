import DirUtil from "./directories";
import fs from "fs";
import { join } from "path";

type SettingListener = (newValue:any) => any;

class Settings {
	private path = join(DirUtil.saved, "settings.json");
	private json = {
		TRUNCATED_THEMELIST: false,
		SAVE_LOG_FILES: false,
		HIDE_NAVBAR: true,
		POLLY_SERVICE: "both",
		DEFAULT_WATERMARK: "none",
		VF_EMAIL: ""
	};
	private listeners:Record<string, SettingListener[]> = {};
	private static _instance:Settings;

	constructor() {
		const defaultVals:Record<string, string | boolean> = this.json;
		if (fs.existsSync(this.path)) {
			try {
				this.refresh();
			} catch (e) {
				throw new Error("Unable to read settings file.");
			}

			for (const [key, value] of Object.entries(this.json)) {
				if (typeof defaultVals[key] == "undefined") {
					continue;
				}
				defaultVals[key] = value;
			}
			this.save(defaultVals as typeof this.json);
		} else {
			console.error("Settings file does not exist. Attempting to save...");
			this.save(defaultVals as typeof this.json);

			try {
				this.refresh();
			} catch (e) {
				throw new Error("Something is extremely awfully horribly terribly preposterously crazily insanely madly wrong. You may be in a read-only system/admin folder.");
			}
		}	
	}

	static get instance() {
		if (!Settings._instance) {
			Settings._instance = new Settings();
		}
		return Settings._instance;
	}

	/**
	 * refreshes this.json using the this.json in its current state
	 */
	private refresh() { // refresh the database vars
		const data = fs.readFileSync(this.path);
		this.json = JSON.parse(data.toString());
	}

	/**
	 * saves this.json into the settings.json file
	 */
	private save(newData:typeof Settings.prototype.json) {
		try {
			fs.writeFileSync(this.path, JSON.stringify(newData, null, "\t"));
			console.log("Settings file saved successfully.")
		} catch (err) {
			console.error("Error occurred while saving settings file:", err);
		}
	}

	/**
	 * calls every listener for a setting update
	 * @param setting setting name
	 */
	private callListeners(setting:keyof Settings) {
		for (const listener of this.listeners[setting] || []) {
			listener(this[setting]);
		}
	}

	/**
	 * queues a callback to be called whenever a setting is changed
	 * @param setting setting to listen for changes to
	 * @param callback callback when the setting is updated
	 */
	addListener(setting:keyof Settings, callback:SettingListener) {
		if (!this.listeners[setting]) {
			this.listeners[setting] = [];
		}
		this.listeners[setting].push(callback);
	}

	/**
	 * returns all the stored settings in an object
	 */
	getAllSettings() {
		return {
			truncatedThemeList: this.truncatedThemeList,
			saveLogFiles: this.saveLogFiles,
			enableMenuBar: this.enableMenuBar,
			defaultWatermark: this.defaultWatermark,
			pollyService: this.pollyService,
		};
	}

	/**
	 * Cuts down the amount of themes that clog up the themelist in the videomaker.
	 */
	get truncatedThemeList() {
		return this.json["TRUNCATED_THEMELIST"];
	}
	set truncatedThemeList(newValue:boolean) {
		this.json["TRUNCATED_THEMELIST"] = newValue;
		this.save(this.json);
		this.callListeners("truncatedThemeList");
	}

	/**
	 * Forces waveforms to be off in the videomaker.
	 */
	get saveLogFiles() {
		return this.json["SAVE_LOG_FILES"];
	}
	set saveLogFiles(newValue:boolean) {
		this.json["SAVE_LOG_FILES"] = newValue;
		this.save(this.json);
		this.callListeners("saveLogFiles");
	}

	/**
	 * Automatically hides the navbar instead of keeping it always visible.
	 */
	get enableMenuBar() {
		return this.json["HIDE_NAVBAR"];
	}
	set enableMenuBar(newValue:boolean) {
		this.json["HIDE_NAVBAR"] = newValue;
		this.save(this.json);
		this.callListeners("enableMenuBar");
	}

	/**
	 * watermark id to use when saving movies
	 */
	get defaultWatermark() {
		return this.json["DEFAULT_WATERMARK"];
	}
	set defaultWatermark(newValue) {
		this.json["DEFAULT_WATERMARK"] = newValue;
		this.save(this.json);
		this.callListeners("defaultWatermark");
	}

	/**
	 * preferred service use when listing polly voices
	 */
	get pollyService() {
		return this.json["POLLY_SERVICE"];
	}
	set pollyService(newValue) {
		this.json["POLLY_SERVICE"] = newValue;
		this.save(this.json);
		this.callListeners("pollyService");
	}

	/**
	 * email to use when logging into voiceforge
	 */
	get voiceforgeEmail() {
		return this.json["VF_EMAIL"];
	}
	set voiceforgeEmail(newValue) {
		this.json["VF_EMAIL"] = newValue;
		this.save(this.json);
		this.callListeners("voiceforgeEmail");
	}
}
export default Settings.instance;
