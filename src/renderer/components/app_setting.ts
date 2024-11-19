import { customElement, state } from "lit/decorators.js";
import { html, LitElement } from "lit";
import SettingsController from "../controllers/settings";
import "./app_setting.css";

@customElement("app-setting")
export default class AppSetting extends LitElement {
	id: string;

	/**
	 * Can be either an object of valid options, with the index
	 * representing the value and the value representing the name,
	 * or a "binary" string.
	 */
	options: "binary" | {[key:string]:string};

	/**
	 * Boolean or string. Depends on what options are allowed.
	 */
	@state()
	value: boolean | string;

	/**
	 * Whether or not the setting is applied locally.
	 */
	local = false;

	render() {
		return html`
			<div class="setting_info">
				<h3 part="h3"><slot name="title"></slot></h3>
				<p part="p"><slot name="description"></slot></p>
			</div>
			${this.options == "binary" ? 
				html`<input class="setting" type="checkbox" ?checked=${this.value == true}></input>` :
				html`<select class="setting" @change=${this._update}>
					${Object.entries(this.options).map(([val, name]) =>
						html`<option value=${val} ?selected=${this.value.toString() == val}>${name}</option>`
					)}
				</select>`}
		`;
	}

	firstUpdated() {
		if (this.options == "binary") {
			this.addEventListener("click", () => this._update())
		}

		if (!this.local) {
			SettingsController.instance.connect(this);
		} else {
			this.value = localStorage.getItem(this.id) == "true";
			this.requestUpdate();
		}
	}

	_update() {
		if (this.options == "binary") {
			this.value = !this.value;
		} else {
			const toggle:HTMLSelectElement | HTMLInputElement =
				this.querySelector(".setting");
			this.value = toggle.value;
		}
		if (this.local) {
			localStorage.setItem(this.id, this.value.toString());
			if (this.id == "DARK_MODE") {
				// window.body.refreshDarkMode();
			}
		} else {
			SettingsController.instance.set(this.id, this.value.toString());
		}
	}
};
