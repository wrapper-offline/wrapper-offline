import AppSetting from "../components/app_setting";
import type { ReactiveController } from "lit";
import { ReactiveControllerHost } from "lit";

class SettingsController {
	private hosts:ReactiveControllerHost[];
	private settings:{};
	private settingsLoaded:boolean;

	private static _instance:SettingsController;

	constructor() {
		this.hosts = [];
		this.settingsLoaded = false;
		this.loadSettings().then(settings => {
			this.settings = settings;
			this.settingsLoaded = true;
			this.hosts.forEach(host => {
				if (host instanceof AppSetting) {
					host.value = this.settings[host.id];
				}
			});
		});
	}

	static get instance() {
		if (!this._instance) {
			this._instance = new SettingsController();
		}
		return this._instance;
	}

	connect(element:ReactiveControllerHost) {
		return new Promise<void>((res, rej) => {
			this.hosts.push(element);
			element.addController(this as ReactiveController);
			if (this.settingsLoaded) {
				// console.log("alreadyloaded..", element.id);
				return res();
			}
			if (!this.settings) {
				let interval:number;
				const intervalCb = () => {
					if (this.settings) {
						clearTimeout(interval);
						return res();
					}
				};
				interval = setInterval(intervalCb, 500) as any as number;
			}
		});
	}

	private async loadSettings() {
		const host = process.env.API_SERVER_HOST;
		const port = process.env.API_SERVER_PORT;
		const res = await fetch(`${host}:${port}/api/settings/list`);
		const json = await res.json();
		return json;
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
