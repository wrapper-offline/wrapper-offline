import { LitElement } from "lit";

export default class ComponentBase extends LitElement {
    // disable shadow dom
    createRenderRoot() {
		return this;
	}
};
