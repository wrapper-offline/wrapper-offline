import { html, render } from "lit";
import PageBase from "./pageBase.js";
import "../components/char_list";

export default class CharactersPage extends PageBase {
	title = "Characters";

	constructor() {
		super()
	}

	render(parent:HTMLElement) {
		return render(html`
			<char-list></char-list>
		`, parent);
	}
};
