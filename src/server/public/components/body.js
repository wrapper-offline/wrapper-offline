import ComponentBase from "./componentBase.js";
import { html } from "../media/js/lit-core.min.js";
import Sidebar from "./sidebar/index.js";

class AppBody extends ComponentBase {
	constructor() {
		super();
		this.appName = "Wrapper: Offline";
		this.DEFAULT_PATH = "/characters";
		this.vars = {};

		this.routeToPageMap = {
			"/characters": {
				page: "characters"
			}
		};
		this.refreshDarkMode();
		window.body = this;
	}

	render() {
		this.sidebar = new Sidebar();
		this.pageContainer = document.createElement("section");
		this.pageContainer.id = "wo_page_container";
			const header = document.createElement("header");
			this.pageContainer.appendChild(header);
		return html`
			${this.sidebar}
			${this.pageContainer}
		`;
	}

	firstUpdated() {
		let route = window.location.pathname;
		if (route.length < 1) {
			route = this.DEFAULT_PATH;
		}
		this.switchTo(route);
	}

	/**
	 * returns a boolean for whether or not dark mode is enabled@
	 * @returns {boolean}
	 */
	get useDarkMode() {
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
	 * @param {string} title page name
	 */
	setTitle(title) {
		document.title = title + " - " + this.appName;
	}

	/**
	 * switches the page
	 * @param {string} loc
	 */
	switchTo(loc) {
		//main.innerHTML = "<marquee>Loading...</marquee>";
		//this.sidebar.highlightLink(loc);

		import(`../pages/${loc}.js?t=${new Date().getUTCMilliseconds()}`).then(pageDef => {
			const page = new (pageDef.default)();
			this.setTitle(page.title);
			page.render(this.pageContainer);
			// this.pageContainer.appendChild();
		});

		// const xhttp = new XMLHttpRequest();
		// const self = this;
		// xhttp.onreadystatechange = function () {
		// 	if (this.readyState != 4) {
		// 		return;
		// 	}
		// 	if (this.status !== 200) {
		// 		document.body.main.innerText = "An error has occured trying to load this page.";
		// 		return;
		// 	}
		// 	const parser = new DOMParser();
		// 	const pageXml = parser.parseFromString(this.responseText, "application/xml");
		// 	const error = pageXml.querySelector("parsererror");
		// 	if (error) {
		// 		console.log("eww");
		// 		return;
		// 	}
			
		// 	self.main.innerHTML = "";
		// 	console.log(pageXml.documentElement.firstElementChild)
		// 	self.parsePageDocument(pageXml.documentElement)
		// };
		// xhttp.open("GET", `/routes/${loc}.xml`, true);
		// xhttp.send();
	}

	/**
	 * parses a child
	 * @param {Element} doc 
	 */
	parsePageDocument(doc) {
		this.setTitle(doc.getAttribute("title"));
		for (const childDef of doc.children) {
			const child = this.parseElemDef(childDef);
			this.main.appendChild(child);
		}
	}

	/**
	 * parses a child
	 * @param {Element} def 
	 */
	parseElemDef(def) {
		const elem = document.createElement(def.nodeName);
		elem.sendParams(JSON.parse(elem.innerText));
		for (const childDef of def.children) {
			const child = this.parseElemDef(childDef, parent);
			elem.appendChild(child);
		}
		return elem;
	}
}

customElements.define("app-body", AppBody);
