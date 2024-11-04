import { html, render } from "../../media/js/lit-core.min.js";

export default class PageBase {
    title = "Page Title";
    constructor() {
       
    }

    render(parent) {
        return render(html`
            <p>Try inserting some content!</p>
        `, parent);
    }
};
