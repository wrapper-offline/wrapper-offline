import PageBase from "./pageBase.js";
import { html, render } from "../../media/js/lit-all.min.js";

import "../../components/tabbed-navigation/index.js";
import "../../components/app-setting.js";

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

					<!-- todo: theme downloading, rearranging -->
					<app-setting .id=${"truncatedThemeList"} .options=${"binary"}>
						<span slot="title">Truncated themelist</span>
						<span slot="description">Cuts down the amount of themes that clog up the themelist in the videomaker.<br/>
							Keeping this off is highly suggested.<br/>
							However, if you want to see everything the program has to offer, turn this on.</span>
					</app-setting>

					<app-setting .id=${"showWaveforms"} .options=${"binary"}>
						<span slot="title">Show waveforms</span>
						<span slot="description">By default, waveforms for audio are generated in the video editor.<br/>
							While useful, the editor freezes while it generates, which could be too annoying or slow for some.<br/>
							Turning this off will simply add a repeating pre-made pattern in place of true waveforms.</span>
					</app-setting>

					<app-setting .id=${"saveLogFiles"} .options=${"binary"}>
						<span slot="title">Save log files</span>
						<span slot="description">Saves everything in the console to the _LOGS folder. This may take up a lot of space if left on.<br/>
							<i>Applies on next restart.</i></span>
					</app-setting>
				</nav>
				<nav class="tab_page" name="Appearance">
					<h2>Appearance</h2>

					<app-setting .id=${"DARK_MODE"} .options=${"binary"} .local=${true}>
						<span slot="title">Dark mode</span>
						<span slot="description"><i>Does not apply in the Video Maker or Character Creator.</i></span>
					</app-setting>

					<app-setting .id=${"LIST_LAYOUT"} .options=${{
						list: "List",
						grid: "Grid"
					}} .local=${true}>
						<span slot="title">Video list layout</span>
						<span slot="description">Switches the layout of the video list.</span>
					</app-setting>

					<app-setting .id=${"goWatermark"} .options=${{
						default: "GoAnimate",
						twoLines: "Go Make Your Own",
						g4s: "GoAnimate For Schools",
						freeTrial: "Free Trial",
						wix: "GoAnimate Wix"
					}}>
						<span slot="title">GoAnimate watermark</span>
						<span slot="description">The Video Maker has five watermarks available for the "GoAnimate"<br/>
						option. This setting specifies which one to use.</span>
					</app-setting>

					<app-setting .id=${"isWide"} .options=${{
						false: "14:9",
						true: "16:9"
					}}>
						<span slot="title">Aspect ratio</span>
						<span slot="description">The Video Maker has 2 choices for aspect ratios, 14:9 and 16:9.<br/>
						By default it's set to 16:9, however you can choose to use 14:9 instead.</span>
					</app-setting>

					<app-setting .id=${"hideNavbar"} .options=${"binary"}>
						<span slot="title">Auto-hide navbar</span>
						<span slot="description"><i>You must restart the program for this change to take effect.</i></span>
					</app-setting>
				</nav>
			</tabbed-navigation>
		`, parent);
	}
};
