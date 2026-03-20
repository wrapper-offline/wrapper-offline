import DirUtil from "./directories";
import fs from "fs";
import { join } from "path";

type SettingListener = (newValue:any) => any;

class Settings {
	private path = join(DirUtil.saved, "settings.json");
	private json = {
		TRUNCATED_THEMELIST: false,
		SHOW_WAVEFORMS: true,
		IS_WIDE: "1",
		SAVE_LOG_FILES: false,
		HIDE_NAVBAR: true,
		DEFAULT_WATERMARK: "none",
		POLLY_SERVICE: "both",
	};
	private listeners:Record<string, SettingListener[]> = {};
	private static _instance:Settings;

	constructor() {
		const defaultVals = this.json;
		// create the file if it doesn't exist
		if (!fs.existsSync(this.path)) {
			console.error("Settings doesn't exist! Creating...");
			this.save(defaultVals);

			try {
				this.refresh();
			} catch (e) {
				throw new Error("Something is extremely awfully horribly terribly preposterously crazily insanely madly wrong. You may be in a read-only system/admin folder.");
			}
		}
		this.refresh();
		// files were likely transferred over to a newer version so we'll set the default values back
		// note that the settings json won't be fixed if you add a setting and remove one 
		// hmm i could just implement a better way to check if the settings are from an old version
		// i mean i *could*, but am i? no
		if (Object.keys(this.json).length !== Object.keys(defaultVals).length) {
			// replace all valid values
			for (let key in this.json) {
				if (defaultVals[key] != null) {
					defaultVals[key] = this.json[key];
				}
			}
			this.save(defaultVals);
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
		} catch (err) {
			console.error("Error saving DB:", err);
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
			showWaveforms: this.showWaveforms,
			isWide: this.isWide,
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
	get showWaveforms() {
		return this.json["SHOW_WAVEFORMS"];
	}
	set showWaveforms(newValue:boolean) {
		this.json["SHOW_WAVEFORMS"] = newValue;
		this.save(this.json);
		this.callListeners("showWaveforms");
	}

	/**
	 * Sets the video player to 16:9 if true or 14:9 if false.
	 */
	get isWide() {
		return this.json["IS_WIDE"] == "1";
	}
	set isWide(newValue:boolean) {
		const whythefuckdididothis_sob = newValue == true ? "1" : "0";
		this.json["IS_WIDE"] = whythefuckdididothis_sob;
		this.save(this.json);
		this.callListeners("isWide");
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
}
export default Settings.instance;
