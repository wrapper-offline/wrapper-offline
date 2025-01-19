import type AppBody from "./app_body";
import ComponentBase from "./componentBase";
import { customElement } from 'lit/decorators/custom-element.js';
import { html } from "lit";
import "./char_list.css";

@customElement("char-list")
export default class CharList extends ComponentBase {
	private static MAX_CHARS_PER_PAGE = 30;
	private static DEFAULT_THEME_ID = "family";
	private static DEFAULT_STUDIO_ID = "custom";
	chars = [];
	pageNum = 0;
	searchTerm = "";
	themeId = [CharList.DEFAULT_THEME_ID, CharList.DEFAULT_STUDIO_ID];
	themeSelBtn:HTMLElement;
	listContainer:HTMLElement;

	constructor() {
		super();
	}

	render() {
		const beg = this.pageNum * CharList.MAX_CHARS_PER_PAGE;
		const end = Math.min(
			beg + CharList.MAX_CHARS_PER_PAGE,
			this.chars.length
		);

		let charList = this.chars;
		if (this.searchTerm.length > 0) {
			charList = this.chars.filter((v) => v.title.toLowerCase().includes(this.searchTerm));
		}
		charList = charList.slice(beg, end);

		return html`
			<div class="list_header">
				<div title="Filter by theme" class="theme_sel_btn" @click=${(e) => this.themeSelBtn_onclick(e)}>
					<i class="ico blist"></i>
					<img src="/media/img/themes/icons/${this.themeId[1]}.webp"/>
				</div>
				<div class="search_container">
					<input class="search_bar" type="text" placeholder="Search characters" @input=${(e) => this.searchInput_oninput(e)}/>
				</div>
			</div>
			<div id="char_list">
				${charList.map(char => html`<div class="char" data-id=${char.id}>
					<ul>
						<li><img src="/assets/${char.id}.png" alt="thumbnail"/></li>
						<li class="title" title="${char.id}">${char.title}</li>
						<li class="hov_actions">
							<a href="javascript:;" onclick="popup('${char.id}')" title="Play"><i class="ico play"></i></a>
							<a href="/cc?original_asset_id=${char.id}" title="Edit"><i class="ico brush"></i></a>
							<a href="/assets/${char.id}.xml" download="${char.title.replace('"', "_")}.zip" title="Download XML"><i class="ico download"></i></a>
							<a href="javascript:;" onclick="destructive('${char.id}', 'delete')" title="Delete"><i class="ico trash"></i></a>
						</li>
					</ul>
				</div>`)}
			</div>
		`;
	}

	firstUpdated() {
		this.switchTheme(CharList.DEFAULT_THEME_ID, CharList.DEFAULT_STUDIO_ID);
		this.requestUpdate();
	}

	/**
	 * called when the theme selector button is clicked
	 * @param e
	 */
	themeSelBtn_onclick(e:MouseEvent) {
		const themeSelector = document.createElement("theme-selector");
		themeSelector.classList.add("popup_container");
		themeSelector.setAttribute("data-filter", "cc");
		document.body.appendChild(themeSelector);
	}

	/**
	 * called when the dearch bar is typed into
	 * @param e 
	 */
	searchInput_oninput(e:InputEvent) {
		const target = e.currentTarget as HTMLInputElement;
		this.searchTerm = target.value;
		this.pageNum = 0;
	}

	// /**
	//  * displays an error message
	//  * @param {string} text
	//  * @returns {CharList}
	//  */
	// displayError(text) {
	// 	this.listContainer.innerText = text;
	// 	return this;
	// }

	/**
	 * switches the currently displayed theme
	 * @param themeId 
	 * @param studioId 
	 */
	switchTheme(themeId:string, studioId:string) {
		this.themeId = [themeId, studioId];
		const body:AppBody = document.querySelector("app-body");
		const server = body.apiServer;

		const xhttp = new XMLHttpRequest();
		const self = this;
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4) {
				return;
			}
			if (this.status !== 200) {
				console.error(this.response);
				// self.displayError("An error has occured trying to load the character list.");
				return;
			}
			self.chars = JSON.parse(this.responseText);
			self.pageNum = 0;
		};
		xhttp.open("GET", `${server}/api/char/list?themeId=${themeId}`, true);
		xhttp.send();
	}

	destructive(mId, act) {
		const yesno = confirm(`Are you sure you want to ${act} movie #${mId}?`);

		// if (yesno)
			// $.get(`/api/movie/${act}/${mId}`)
			// 	.done((data) => {
			// 		if (data.status == "ok") {
			// 			switch (act) {
			// 				case "clone":
			// 					// window.location = `/go_full?movieId=${data.mId}`;
			// 					break;
			// 				case "delete":
			// 					const $elem = $("#" + mId);
			// 					$elem.fadeOut(() => $elem.remove());
			// 					break;
			// 			}
			// 		} else alert("Guess you're stuck with your movie.");
			// 	});
	}
};

// switch (localStorage.getItem("LIST_LAYOUT")) {
// 	case "grid": {
// 		charList.classList.add("grid_view");
// 		document.querySelector("#table_view_header>.video>:nth-child(3)").style.display = "none";
// 		break;
// 	}
// 	case "list":
// 	default: {
// 		charList.classList.add("list_view");
// 	}
// }
