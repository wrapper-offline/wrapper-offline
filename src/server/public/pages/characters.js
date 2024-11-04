import CharList from "../../components/char-list/index.js";
import { html, render } from "../../media/js/lit-all.min.js";
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
