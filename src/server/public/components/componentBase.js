import { LitElement } from "../../media/js/lit-all.min.js";

export default class ComponentBase extends LitElement {
    // disable shadow dom
    createRenderRoot() {
		return this;
	}
}
