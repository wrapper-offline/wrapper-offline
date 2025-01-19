class SettingsController {
	private settings:{};
	private settingsLoaded:boolean = false;

	private static _instance:SettingsController;

	constructor() {

	}

	static get instance() {
		if (!this._instance) {
			this._instance = new SettingsController();
		}
		return this._instance;
	}

	public async loadSettings(host) {
		if (!this.settingsLoaded) {
			const res = await fetch(`${host}/api/settings/list`);
			const json = await res.json();
			return json;
		}
		return this.settings;
	}

	set(id:string, value:string) {
		const form = new FormData();
		form.append("setting", id);
		form.append("value", value);
		fetch("/api/settings/update", {
			method: "POST",
			body: form
		});
	}

	get(id:string) {
		return this.settings[id];
	}
}
export default SettingsController.instance;
