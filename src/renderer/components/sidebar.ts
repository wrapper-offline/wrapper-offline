import ComponentBase from "./componentBase";
import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./sidebar.css";

@customElement("app-sidebar")
export default class Sidebar extends ComponentBase {
	@state()
	private _collapsed = false;

	constructor() {
		super();
	}

	render() {
		console.log("ghiii")
		if (this._collapsed) {
			this.classList.add("collapsed");			
		}
		return html`
			<div id="logo_container">
				<img id="logo_icon" src="./media/img/logo_icon.svg" alt="Candy"/>
				<img id="logo_wordmark" src="./media/img/logo_wordmark.svg" alt="Wrapper: Offline"/>
			</div>
			<ul>
				<li class="link" data-toggle @click="${this._toggle}">
					<button>
						<i class="ico arr_r"></i>
						<div class="link_text">Menu</div>
					</button>
				</li>
				<li class="link">
					<a href="/videos" @click="${this.onLinkClick}">
						<i class="ico film"></i>
						<div class="link_text">Videos</div>
					</a>
				</li>
				<li class="link">
					<a href="/starters" @click="${this.onLinkClick}">
						<i class="ico briefcase"></i>
						<div class="link_text">Starters</div>
					</a>
				</li>
				<li class="link">
					<a href="/characters" @click="${this.onLinkClick}">
						<i class="ico person"></i>
						<div class="link_text">Characters</div>
					</a>
				</li>
			</ul>
			<ul class="user_custom">
				<h3>Pinned Links</h3>
				<!-- insert pin button -->
				<li class="link pin_btn" data-toggle @click="${this._pin}">
					<button>
						<i class="ico arr_r"></i>
						<div class="link_text">Pin current page</div>
					</button>
				</li>
			</ul>
			<ul>
				<li class="group">
					<ul>
						<li class="link">
							<a target="_blank" href="https://github.com/Wrapper-Offline/Wrapper-Offline/wiki">
								<i class="ico interr"></i>
								<div class="link_text">FAQ</div>
							</a>
						</li>
						<li class="link">
							<a target="_blank" href="https://discord.gg/yhGAetN">
								<i class="ico speech"></i>
								<div class="link_text">Discord</div>
							</a>
						</li>
					</ul>
				</li>
				<li class="link">
					<a href="/settings" @click="${this.onLinkClick}">
						<i class="ico cog"></i>
						<div class="link_text">Settings</div>
					</a>
				</li>
				<span id="wrapper_ver">v${"6.6.6"}</span>
			</ul>
		`
		//this.addLinks(this.customGroup);
	}

	/**
	 * Adds link elements to the custom section of the sidebar.
	 */
	addLinks(parent) {
		// for (const link of this.mainLinks) {
		// 	const elem = this.createLinkElement(link);
		// 	parent.appendChild(elem);
		// }
	}

	/**
	 * Creates an element from a link object.
	 * @param {object} data 
	 * @returns {HTMLAnchorElement}
	 */
	createLinkElement(data) {
		const elem = document.createElement("li");
		elem.classList.add("link");
			const tog = document.createElement("button");
			tog.innerText = ">";
			elem.appendChild(tog);
			const link = document.createElement("a");
			link.href = data.location;
			link.addEventListener("click", (e) => this.onLinkClick(e));
				const icon = document.createElement("i");
				icon.classList.add("ico", data.icon);
				link.appendChild(icon);
				const text = document.createElement("div");
				text.classList.add("link_text");
				text.innerText = data.name;
				link.appendChild(text);
			elem.appendChild(link);
		return elem;
	}

	/**
	 * Called whenever a sidebar link is clicked.
	 * @param {Event} e 
	 * @param {string} loc
	 */
	onLinkClick(e) {
		e.preventDefault();
		e.stopPropagation();
		history.pushState({}, "", e.currentTarget.href);
		// window.body.switchTo(e.currentTarget.pathname.substring(1));
	}

	/**
	 * Called whenever the collapse button is clicked. 
	 */
	_toggle() {
		this._collapsed = !this._collapsed;
	}

	_pin() {
		console.log("pin")
	}

	/**
	 * highlights a link
	 * @param {string} path
	 */
	highlightLink(path) {
		// const links = this.customGroup.children;
		// for (const link of links) {
		// 	const a = link.getElementsByTagName("a")[0];
		// 	if (!a) continue;
		// 	if (link.classList.contains("sel")) {
		// 		link.classList.remove("sel");
		// 	}
		// 	if (a.href.startsWith("/" + path)) {
		// 		link.classList.add("sel");
		// 	}
		// }
	}
};
