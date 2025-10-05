class LocalSettings {
	private static _instance:LocalSettings;
	private settings:{
		DARK_MODE: boolean,
		ON_MOVIE_DCLICK: "edit" | "play" | "none"
	} = {
		DARK_MODE: false,
		ON_MOVIE_DCLICK: "play"
	};

	constructor() {
		for (const setting in this.settings) {
			const value = localStorage.getItem(setting);
			if (value == null) {
				continue;
			}
			const isBool = typeof this.settings[setting] == "boolean";
			this.settings[setting] = isBool ? value == "true" : value;
		}
	}

	static get instance() {
		if (!this._instance) {
			this._instance = new LocalSettings();
		}
		return this._instance;
	}

	/**
	 * sets a setting in localStorage to its current value
	 */
	private saveSetting(id:keyof typeof LocalSettings.instance.settings) {
		localStorage.setItem(id, this.settings[id].toString());
	}

	get darkMode() {
		return this.settings["DARK_MODE"];
	}
	set darkMode(newValue) {
		this.settings["DARK_MODE"] = newValue;
		this.saveSetting("DARK_MODE");
	}

	get onMovieDclick() {
		return this.settings["ON_MOVIE_DCLICK"];
	}
	set onMovieDclick(newValue) {
		this.settings["ON_MOVIE_DCLICK"] = newValue;
		this.saveSetting("ON_MOVIE_DCLICK");
	}
}
export default LocalSettings.instance;
