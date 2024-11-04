import { css, html, LitElement, render } from "../../media/js/lit-all.min.js";

class TabbedNavigation extends LitElement {
	static styles = css`
		:host {
			margin: auto;
		}
		:host .nav_buttons {
			display: flex;
			margin: 0 auto;
		}
		:host .nav_buttons {
			border-bottom: 10px solid #fff;
			box-shadow: 0 4px 3px -2px #0002;
		}
		:host .nav_buttons .tab {
			background: #e3e7ed;
			border-right: 1px solid #cfcfcf;
			box-shadow:
				inset 0 1px #cfcfcf,
				inset 0 -1px #c1c1c1,
				inset 0 -6px 6px -5px #0002;
			color: #505e73;
			padding: 7px;
			text-align: center;
			text-decoration: none;
			text-transform: uppercase;
			font-weight: bold;
			font-size: 13px;
			width: 100%;
		}
		:host .nav_buttons .tab:last-of-type {
			border: none;
		}
		:host .nav_buttons .tab.selected {
			background: #fff;
			color: #dd6522;
			box-shadow: 0 -5px #dd6522;
		}
		@media (prefers-color-scheme: dark) {
			:host .nav_buttons {
				border-color: #282828;
			}
			:host .nav_buttons .tab:not(.selected) {
				background: #242424;
				border-color: #2a2a2a;
				box-shadow: inset 0 1px #2a2a2a, inset 0 -1px #222, inset 0 -6px 6px -5px #0002;
				color: #ddd;
			}
			:host .nav_buttons .tab.selected {
				background: #282828;
				border-color: #222;
			}
		}
		
		.tab:hover {
			color: #dd6522;
		}
		/* pages */
		::slotted(.tab_page) {
			display: none;
		}
	`;
	constructor() {
		super();
		this.tabs = [];
		this.selected = 0;
	}

	render() {
		try {
			this._slottedChildren;
			return html`
				<div class="nav_buttons">
					${this.tabs.map(v => 
						html`<a href="javascript:;" class="tab" @click=${() => this._switchTab(v)}>${v}</a>`)}
				</div>
				<slot></slot>
			`;
		} catch (e) {
			return html`<slot></slot>`;
		}
	}

	firstUpdated() {
		for (const child of this._slottedChildren) {
			const name = child.getAttribute("name");
			if (
				child.tagName != "NAV" ||
				!child.classList.contains("tab_page") ||
				!name
			) {
				throw "invalid child";
			}
			this.tabs.push(name);
		}
		this._switchTab(this.tabs[0]);
	}

	_switchTab(setTo) {
		// const setTo = e.currentTarget.innerText;
		for (const index in this._slottedChildren) {
			const child = this._slottedChildren[index];
			const name = child.getAttribute("name");
			if (setTo != name) {
				child.style.display = "none";
				continue;
			}
			child.style.display = "block";
		}
		this.requestUpdate();
	}

	/**
	 * @returns {Element[]}
	 */
	get _slottedChildren() {
		const slot = this.shadowRoot.querySelector("slot");
		const childNodes = slot.assignedNodes({flatten: true});
		return Array.prototype.filter.call(childNodes, (node) => node.nodeType == Node.ELEMENT_NODE);
	}

	// addTab(name, contents) {
	// 	const tabButton = render(html`
	// 		<a href="javascript:;" class="tab">Behavior</a>
	// 	`);

	// 	const tab = document.createElement("nav");
	// 	tab.classList.add("tab_page")
	// 	this.tabs.push(tab);
	// 	this.appendChild(tab);
	// }
}

customElements.define("tabbed-navigation", TabbedNavigation)
