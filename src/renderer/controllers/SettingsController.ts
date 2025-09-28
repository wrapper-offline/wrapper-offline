import { apiServer } from "./AppInit";

class SettingsController {
	private static _instance:SettingsController;
	private settings:{};
	private settingsLoaded:boolean = false;

	constructor() {

	}

	static get instance() {
		if (!this._instance) {
			this._instance = new SettingsController();
		}
		return this._instance;
	}

	public async loadSettings() {
		if (!this.settingsLoaded) {
			const res = await fetch(`${apiServer}/api/settings/list`);
			this.settings = await res.json();
		}
		return this.settings;
	}

	set(id:string, value:boolean|string) {
		const form = new FormData();
		form.append("setting", id);
		form.append("value", value.toString());
		fetch(`${apiServer}/api/settings/update`, {
			method: "POST",
			body: form
		});
	}

	/**
	 * returns a setting value from id
	 * @param id setting id
	 * @returns setting value
	 */
	get(id:string): boolean | string {
		return this.settings[id];
	}
}
export default SettingsController.instance;
