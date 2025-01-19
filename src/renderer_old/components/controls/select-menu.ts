import ComponentBase from "../componentBase";
import { customElement } from "lit/decorators/custom-element.js";
import { html } from "lit";
import { state } from "lit/decorators/state.js";
import "./select-menu.css";

/**
 * `select-menu`: HTML version of a select menu.
 */
@customElement("select-menu")
export default class SelectMenu extends ComponentBase {
	/** option labels indexed by their key */
	@state() public options:{value:string, label:string}[];
	@state() private selected:string;

	constructor() {
		super();
	}

	render() {
		return html`
			<button class="sel_btn" @click=${() => this.open()}>${this.selected}</button>
			<ul class="menu">${
				this.options.map(({value, label}) =>
					html`<li @click="${e => this.linkClick(e, value)}">${label}</li>`)
			}</ul>
		`;
	}

	private linkClick(e:MouseEvent, value:string) {
		const event = new CustomEvent("selected", {detail:{value}});
		this.dispatchEvent(event);
		this.classList.remove("open");
	}

	private open() {
		this.classList.add("open");
		const clickCb = (e2:MouseEvent) => {
			if (e2.target != this) {
				this.close();
				window.removeEventListener("click", clickCb);
			}
		};
		setTimeout(() => window.addEventListener("click", clickCb), 50);
	}

	private close() {
		this.classList.remove("open");
	}

	get slotted() {
		return ;
	}
}
