import CharList from "../../components/char-list/index.js";
import { html, render } from "../../media/js/lit-core.min.js";

export default class CharactersPage {
    constructor() {
        this.title = "Characters";
    }

    render(parent) {
        return render(html`
            <char-list></char-list>
        `, parent);
    }
};
