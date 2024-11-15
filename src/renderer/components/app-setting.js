import { html, LitElement, nothing } from "lit";
import SettingsController from "../controllers/settings.js";

export default class AppSetting extends LitElement {
	/** @type {string} */
	id;

	/**
	 * Can be either an object of valid options, with the index
	 * representing the value and the value representing the name,
	 * or a "binary" string.
	 * @type {"binary" | {[key:string]:string}}
	 */
	options;

	/**
	 * Boolean or string. Depends on what options are allowed.
	 * @type {boolean | string}
	 */
	value;

	/**
	 * Whether or not the setting is applied locally.
	 * @type {boolean}
	 */
	local;

	constructor() {
		super();
		this.local = false;
		this.value;
	}

	render() {
		return html`
			<div class="setting_info">
				<h3 part="h3"><slot name="title"></slot></h3>
				<p part="p"><slot name="description"></slot></p>
			</div>
			${this.options == "binary" ? 
				html`<input class="setting" type="checkbox" checked=${this.value == true || nothing}></input>` :
				html`<select class="setting" @change=${this._toggle}>
					${Object.entries(this.options).map(([val, name]) =>
						html`<option value=${val} selected=${this.value && this.value.toString() == val || nothing}>${name}</option>`
					)}
				</select>`}
		`;
	}

	firstUpdated() {
		if (this.options == "binary") {
			this.addEventListener("click", () => this._toggle())
		}

		if (!this.local) {
			SettingsController.instance.connect(this);
		} else {
			this.value = localStorage.getItem(this.id) == "true";
			this.requestUpdate();
		}
	}

	_toggle(e) {
		if (this.options == "binary") {
			this.value = !this.value;
		} else {
			this.value = e.target.value;
		}
		if (this.local) {
			localStorage.setItem(this.id, this.value.toString());
			if (this.id == "DARK_MODE") {
				window.body.refreshDarkMode();
			}
		} else {
			SettingsController.instance.set(this.id, this.value.toString());
		}
		this.requestUpdate();
	}
};

customElements.define("app-setting", AppSetting);
