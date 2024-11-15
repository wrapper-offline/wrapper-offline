import "../components/char-list/index.js";
import { html, render } from "lit";
import PageBase from "./pageBase.js";

export default class CharactersPage extends PageBase {
    constructor() {
        super()
        this.title = "Characters";
    }

    render(parent) {
        return render(html`
            <char-list></char-list>
        `, parent);
    }
};
