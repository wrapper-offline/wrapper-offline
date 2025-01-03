import ComponentBase from "./componentBase";
import { customElement } from 'lit/decorators/custom-element.js';
import { html } from "lit";
import PageBase from "../pages/pageBase.js";
import Sidebar from "./sidebar";
import "../media/css/global.css";

import Error404Page from "../pages/404";
import CharactersPage from "../pages/characters";
import SettingsPage from "../pages/settings";

@customElement("app-body")
export class AppBody extends ComponentBase {
	static DEFAULT_PATH = "/characters";
	appName = "Wrapper: Offline";
	routes = [
		{
			path: /^\/404$/,
			class: Error404Page
		},
		{
			path: /^\/characters$/,
			class: CharactersPage
		},
		{
			path: /^\/settings$/,
			class: SettingsPage
		}
	];
	sidebar: ComponentBase;
	pageContainer: HTMLElement;

	constructor() {
		super();
		this.refreshDarkMode();
		new EventSource('/esbuild').addEventListener('change', () => location.reload())
		//window.body = this;
	}

	render() {
		this.sidebar = new Sidebar();
		this.pageContainer = document.createElement("section");
		this.pageContainer.id = "page_container";
		return html`
			${this.sidebar}
			<div id="app_right">
				<header></header>
				${this.pageContainer}
			</div>
		`;
	}

	firstUpdated() {
		let route = window.location.pathname;
		if (route.length < 1) {
			route = AppBody.DEFAULT_PATH;
		}
		this.switchTo(route);
	}

	/**
	 * returns a boolean for whether or not dark mode is enabled
	 */
	get useDarkMode(): boolean {
		return localStorage.getItem("DARK_MODE") !== "false";
	}

	refreshDarkMode() {
		const html = document.documentElement;
		if (this.useDarkMode) {
			html.classList.add("dark");
		} else {
			html.classList.remove("dark");
		}
	}

	/**
	 * sets the page title to `<page name> - <app name>`
	 * @param title page name
	 */
	setTitle(title:string) {
		document.title = title + " - " + this.appName;
	}

	/**
	 * switches the page
	 */
	switchTo(loc:string) {
		//main.innerHTML = "<marquee>Loading...</marquee>";
		//this.sidebar.highlightLink(loc);

		const page = this.routes.find(v => v.path.test(loc));
		if (!page) {
			console.error(`Page '${loc}' does not exist!`);
			this.switchTo("/404");
			return;
		}

		const pageClass = new (page.class)();

		this.setTitle(pageClass.title);
		pageClass.render(this.pageContainer);
	}
};
