import ComponentBase from "./componentBase";
import { customElement } from "lit/decorators/custom-element.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import SettingsController from "../controllers/settings";
import "./themelist_editor.css";
import "./controls/select-menu";

type ThemeDef = {
	/** theme id */
	studio: string,
	/** cc theme id */
	cc: string | void,
	/** theme name */
	name: string,
};

/** array of columns that contain the theme ids */
type ThemePreset = string[][];

@customElement("themelist-editor")
export default class ThemelistEditor extends ComponentBase {
	private themes:ThemeDef[] = [];
	private presets:Record<string, ThemePreset> = {};
	private locallyAvailable = [];
	private inactivityCounter = 0;
	@state() private selection:ThemePreset = [];
	@state() private showHelpText = false;

	constructor() {
		super();
		this.fetchRepoThemelist().then(async list => {
			this.themes = list.list;
			this.presets = list.presets;
			this.locallyAvailable = await this.fetchLocalThemes();
			this.switchPreset(Object.keys(this.presets)[1]);
		});
	}

	render() {
		let menuText = "Custom";
		for (const [key, value] of Object.entries(this.presets)) {
			if (JSON.stringify(value) == JSON.stringify(this.selection)) {
				menuText = key;
			}
		}
		if (this.inactivityCounter == 0) {
			setInterval(() => this.inactivityCounter++, 1000);
			setTimeout(() => {
				console.log(this.inactivityCounter);
				if (this.inactivityCounter > 5) {
					this.showHelpText = true;
				}
			}, 5002);
		}
		const unusedThemes = this.themes.filter(theme => !this.isSelected(theme.studio));
		return html`
			<div class="theme_preset">
				<strong>Select a preset:</strong>
				<select-menu
					.selected=${menuText}
					.options=${Object.keys(this.presets).map(v => ({value:v, label:v}))}
					@selected=${this.selectMenu_click}>
				</select-menu>
				<button class="btn" onclick="window.appWindow.openThemeFolder()">Theme dir</button>
			</div>
			<div class="selected_themes">${
				this.selection.map(col => html`
					<div class="theme_column">
						${col.map(themeId => 
							html`<div class="theme" data-id="${themeId}" @mousedown=${this.themeMouseDown}>${this.themeInfo(themeId).name}</div>`
						)}
					</div>
				`)
			}</div>
			<div class="unused_themes">${
				unusedThemes.map(theme => html`
					<div class="theme unselected">${this.themeInfo(theme.studio).name}</div>
				`)
			}</div>
			<span class="help_text ${this.showHelpText ? "show" : ""}">
				Drag a theme cell to rearrange the themelist. Click one to enable or disable a theme.
			</span>
		`;
	}

	private themeMouseDown(e:MouseEvent) {
		this.inactivityCounter = -1;
		console.log(this.selection, this.presets)
		this.classList.add("edit_mode");

		const themeCell = e.currentTarget as HTMLDivElement;
		const themeId = themeCell.getAttribute("data-id");

		let placeholder = document.createElement("div");
		placeholder.classList.add("move_placeholder");
		const moveHandler = (e3:MouseEvent) => {
			const column:HTMLDivElement = (e3.target as HTMLElement).closest(".theme_column");
			if (!column) { // theme cell is not being hovered over a valid target
				return;
			}
			const themeElements = column.querySelectorAll(".theme");
			let anyCellHit = false;
			for (let i = 0; i < themeElements.length; i++) {
				const themeCell = themeElements[i] as HTMLDivElement;
				const box = themeCell.getBoundingClientRect();
				const cellHit = e3.clientY > (box.top - 5) && e3.clientY < (box.bottom + 2);
				if (cellHit) {
					themeCell.insertAdjacentElement("afterend", placeholder);
					anyCellHit = true;
				}
			}
			if (!anyCellHit) {
				const begin = themeElements[0].getBoundingClientRect().y;
				let position:"afterbegin"|"beforeend";
				console.log(e3.clientY, begin);
				if (e3.clientY < begin) {
					position = "afterbegin";
				} else {
					position = "beforeend";
				}
				column.insertAdjacentElement(position, placeholder);
			}
		};
		const upHandler = (e2:MouseEvent) => {
			window.removeEventListener("mousemove", moveHandler);
			window.removeEventListener("mouseup", upHandler);
			const column = placeholder.parentElement;
			const list = Array.from(column.parentElement.children);
			
			// retrieve the id of the theme that should precede the one being dragged
			const oldThemeCell = placeholder.previousElementSibling;
			if (oldThemeCell) {
				const prevThemeId = oldThemeCell.getAttribute("data-id");
				if (prevThemeId != themeId) { // check if it actually moved
					this.moveTheme(themeId, list.indexOf(column), prevThemeId);
				}
			} else {
				this.moveTheme(themeId, list.indexOf(column));
			}

			placeholder.remove(), placeholder = null;
			this.classList.remove("edit_mode");
			console.log("move finished");
		};
		window.addEventListener("mousemove", moveHandler);
		window.addEventListener("mouseup", upHandler);
	}

	private selectMenu_click(e:CustomEvent) {
		this.switchPreset(e.detail.value);
	}

	private switchPreset(id:string) {
		this.selection = JSON.parse(JSON.stringify(this.presets[id]));
	}

	private moveTheme(themeId:string, columnInd:number, after?:string) {
		for (const column of this.selection) {
			const index = column.indexOf(themeId);
			if (index > -1) {
				column.splice(index, 1);
			}
		}

		let start = 0;
		if (after) {
			start = this.selection[columnInd].indexOf(after) + 1;
		}
		this.selection[columnInd].splice(start, 0, themeId);
		this.requestUpdate();
		console.log(this.selection);
	}

	private async fetchLocalThemes() {
		const host = process.env.API_SERVER_HOST;
		const port = process.env.API_SERVER_PORT;
		const res = await fetch(`${host}:${port}/api/theme/locally_available`);
		const json = await res.json();
		return json;
	}

	private async fetchRepoThemelist(): Promise<{
		list: ThemeDef[],
		presets: Record<string, ThemePreset>,
	}> {
		await SettingsController.connect(this);
		const repo = SettingsController.get("themeRepo");
		const url = `https://api.github.com/repos/${repo}/contents/themelist.json`;
		const res = await fetch(url);
		const fileInfo = await res.json();
		if (fileInfo.status == "404") {
			throw "Invalid source";
		}
		return JSON.parse(atob(fileInfo.content));
	}

	themeInfo(id:string): ThemeDef {
		return this.themes.find(v => v.studio == id);
	}

	/**
	 * checks whether a specified theme is selected
	 * @param themeId theme id
	 */
	isSelected(themeId:string): boolean {
		for (const col of this.selection) {
			if (col.includes(themeId)) {
				return true;
			}
		}
		return false;
	}

};
