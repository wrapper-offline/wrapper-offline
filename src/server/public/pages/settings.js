import PageBase from "./pageBase.js";
import { html, render } from "../../media/js/lit-core.min.js";

import "../../components/tabbed-navigation/index.js";

export default class SettingsPage extends PageBase {
    constructor() {
        super();
        this.title = "Settings";
    }

    render(parent) {
        return render(html`
            <tabbed-navigation>
                <nav class="tab_page" name="Behavior">
                    <h2>Behavior</h2>

                    <h3>Truncated themelist</h3>
                    <p>Cuts down the amount of themes that clog up the themelist in the videomaker.<br/>
                        Keeping this off is highly suggested.<br/>
                        However, if you want to see everything the program has to offer, turn this on.</p>
                    <input class="setting" type="checkbox" id="truncatedThemeList"></input>

                    <h3>Show waveforms</h3>
                    <p>By default, waveforms for audio are generated in the video editor.<br/>
                        While useful, the editor freezes while it generates, which could be too annoying or slow for some.<br/>
                        Turning this off will simply add a repeating pre-made pattern in place of true waveforms.</p>
                    <input class="setting" type="checkbox" id="showWaveforms"></input>

                    <h3>Save log files</h3>
                    <p>Saves everything in the console to the _LOGS folder. This may take up a lot of space if left on.<br/>
                        <i>Applies on next restart.</i></p>
                    <input class="setting" type="checkbox" id="saveLogFiles"></input>
                </nav>
            </tabbed-navigation>
        `, parent);
    }
};