export default class SettingsController {
	hosts;
	settings;

	static _instance;

	/**
	 * 
	 * @param {*} host 
	 * @param {?number} timeout 
	 */
	constructor() {
		this.hosts = [];
		this.loadSettings().then(settings => {
			this.settings = settings;
			this.hosts.forEach(host => {
				host.value = this.settings[host.id];
				host.requestUpdate();
			});
		});
	}

	static get instance() {
		if (!this._instance) {
			this._instance = new SettingsController();
		}
		return this._instance;
	}

	connect(element) {
		this.hosts.push(element);
		element.addController(this);
		if (this.settingsLoaded) {
			console.log("alreadyloaded..", element.id);
		}
	}

	async loadSettings() {
		const res = await fetch("/api/settings/list");
		const json = await res.json();
		return json;
	}

	set(id, value) {
		const form = new FormData();
		form.append("setting", id);
		form.append("value", value);
		fetch("/api/settings/update", {
			method: "POST",
			body: form
		});
	}
};
