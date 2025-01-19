import ComponentBase from "./componentBase";
import { customElement } from "lit/decorators/custom-element.js";
import { html } from "lit";
import logoIcon from "../media/img/logo_icon.svg";
import { state } from "lit/decorators/state.js";
import "./popup.css";
import "./initial_setup.css";
// import ThemelistEditor from "./themelist_editor";
import "./themelist_editor";

@customElement("initial-setup")
export default class InitialSetup extends ComponentBase {
	private static STEP_HEADINGS = [
		"Welcome!",
		"Edit themelist"
	];
	@state() private currentStep = 0;

	render() {
		// /**
		//  * @param {Event} e 
		//  */
		// const opinionHandler = (e) => {
		// 	if (e.target != this) {
		// 		return;
		// 	}
		// 	this.remove();
		// }
		// this.onclick = opinionHandler;
		// const handler2 = () => this.remove();
		// closeBtn.onclick = handler2;

		// this.insertContents(contentCntnr);
		this.classList.add("popup_container");
		this.classList.add(`step_${this.currentStep + 1}`);
		this.classList.remove(`step_${this.currentStep}`)
		return html`
			<div class="popup">
				<h2 class="popup_heading">
					<div class="head_left">
						<span class="topic">Initial setup</span>
					</div>
					<div class="head_center">
						<span class="small">Step ${this.currentStep + 1} of 3</span>
						<span class="main">${InitialSetup.STEP_HEADINGS[this.currentStep]}</span>
					</div>
					<div class="head_right"></div>
				</h2>
				<div class="contents step_1_contents">
					<img src="${logoIcon}" class="icon_img" alt="Candy"/>
					<h3>Thanks for downloading Wrapper: Offline!</h3>
					<!-- <p>Before you begin making videos, you must complete the setup process.
						This involves downloading the theme assets, which may take a little bit
						depending on your selections. <br/>You can also forego the process entirely, and
						upload your themes instead.</p> -->
				</div>
				<div class="contents step_2_contents">
					<!-- <p>Before you begin making videos, you must complete the setup process.
						This involves downloading the theme assets, which may take a little bit
						depending on your selections. <br/>You can also forego the process entirely, and
						upload your themes instead.</p> -->
					<themelist-editor @update="${() => null}"></themelist-editor>
					<!-- <div class="or_upload">
						<button class="btn" @click="${() => this.openThemeFolder()}">Open theme directory</button>
						<button class="btn" @click="${() => this.openThemeFolder()}">Refresh list</button>
					</div> -->
				</div>
				<div class="bottom">
					<button class="btn" @click="${() => this.closeWrapper()}">Exit</button>
					<button class="btn btn_primary" @click="${() => this.progressStep()}">Continue</button>
				</div>
			</div>
		`;
	}

	private progressStep() {
		this.currentStep++;
	}

	private closeWrapper() {
		(window as any).appWindow.closeWrapper();
	}

	private openThemeFolder() {
		(window as any).appWindow.openThemeFolder();
	}
}
