import type AppBody from "./app_body";
import ComponentBase from "./componentBase";
import { customElement, state, property } from "lit/decorators.js";
import { html, PropertyValues } from "lit";

import logoIcon from "../media/img/logo_icon.svg";
import logoWordmark from "../media/img/logo_wordmark.svg";
import "./sidebar.css";

@customElement("app-sidebar")
export default class Sidebar extends ComponentBase {
	@state()
	private _collapsed = false;
	@state()
	private _logoCollapsed = false;
	@property()
	private width = 250;

	constructor() {
		super();
	}

	render() {
		if (this._collapsed) {
			this.classList.add("collapsed");
		} else {
			this.classList.remove("collapsed");
		}
		if (this._logoCollapsed) {
			this.classList.add("logo_collapsed");
		} else {
			this.classList.remove("logo_collapsed");
		}
		this.style.width = this.width.toString() + "px";
		return html`
			<div id="logo_container" style="width:${this.width}px">
				<div class="toggle_btn" @click="${() => this.openInfo()}" title="About Wrapper: Offline">
					<img id="logo_icon" src="${logoIcon}" alt="Candy"/>
					<img id="logo_wordmark" src="${logoWordmark}" alt="Wrapper: Offline"/>
				</div>
			</div>
			<ul>
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
							<a href="javascript:window.appWindow.openFaq();">
								<i class="ico interr"></i>
								<div class="link_text">FAQ</div>
							</a>
						</li>
						<li class="link">
							<a href="javascript:window.appWindow.openDiscord();">
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
				<!-- <span id="wrapper_ver">v${process.env.WRAPPER_VER}</span> -->
			</ul>
			<div class="dragger" style="left:${this.width - 3}px" @mousedown=${this.draggerDown}></div>
		`
	}

	private draggerDown(e:MouseEvent) {
		this.classList.add("resize");
		document.body.classList.add("col_resize");
		const startX = e.clientX;
		const startWidth = this.width;
		const moveCb = (moveE2:MouseEvent) => {
			const newWidth = startWidth - startX + moveE2.clientX;
			if (newWidth < 200) {
				this._logoCollapsed = true;
			} else if (this._logoCollapsed) {
				this._logoCollapsed = false;
			}
			if (newWidth < 93) {
				if (newWidth < 56) {
					this._collapsed = true;
					this.width = 56;
				} else {
					if (this._collapsed) {
						this._collapsed = false;
					}
					this.width = 93;
				}
				return;
			}
			if (newWidth > 590) {
				this.width = 590;
				return;
			}
			this.width = newWidth;
		};
		window.addEventListener("mousemove", moveCb);
		window.addEventListener("mouseup", () => {
			window.removeEventListener("mousemove", moveCb);
			if (this.width > 56) {
				this._collapsed = false;
			}
			this.classList.remove("resize");
			document.body.classList.remove("col_resize");
		});
	}

	private openInfo() {
		// open info popup
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
	 * @param e
	 */
	onLinkClick(e:MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		const target = e.currentTarget as HTMLAnchorElement;
		if (target.tagName != "A") {
			return;
		}
		const appBody:AppBody = document.querySelector("app-body");
		appBody.switchTo(target.pathname);
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
