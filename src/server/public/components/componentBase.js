import { LitElement } from "../../media/js/lit-core.min.js";

export default class ComponentBase extends LitElement {
    // disable shadow dom
    createRenderRoot() {
		return this;
	}
}
