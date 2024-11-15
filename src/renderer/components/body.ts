import ComponentBase from "./componentBase";
import { customElement } from 'lit/decorators/custom-element.js';
import { html } from "lit";
import PageBase from "../pages/pageBase.js";
import Sidebar from "./sidebar";
import "../media/css/global.css";

@customElement("app-body")
export class AppBody extends ComponentBase {
	static DEFAULT_PATH = "/characters";
	appName = "Wrapper: Offline";
	routes = [
		{
			path: /^\/404$/,
			import: "404.js"
		},
		{
			path: /^\/characters$/,
			import: "characters.js"
		},
		{
			path: /^\/settings$/,
			import: "settings.js"
		}
	];
	sidebar: ComponentBase;
	pageContainer: HTMLElement;

	constructor() {
		super();
		this.refreshDarkMode();
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

		const page = this.routes.find(v => v.path.test(window.location.pathname));
		if (!page) {
			console.error(`Page '${loc}' does not exist!`);
			this.switchTo("404");
			return;
		}
		//import(`../pages/${page.import}.js?t=${new Date().getUTCMilliseconds()}`).then(
		import(`../pages/${page.import}.js`).then(
			/**
			 * 
			 * @param {{default: () => any)}} pageDef 
			 * @returns 
			 */
			(pageDef) => {
				if (!pageDef.default ||
					typeof pageDef.default != "function") {
					throw "Received invalid response!";
				}
				const page = new (pageDef.default)();
				if (!(page instanceof PageBase)) {
					throw "Received invalid response!";
				}
				this.setTitle(page.title);
				page.render(this.pageContainer);
				// this.pageContainer.appendChild();
			}
		);
	}
};
