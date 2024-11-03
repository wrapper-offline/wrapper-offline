export default class CharList extends HTMLElement {
	constructor() {
		super();
		this.MAX_CHARS_PER_PAGE = 30;
		this.DEFAULT_THEME_ID = "family";
		this.DEFAULT_STUDIO_ID = "custom";
		this.chars = [];
		this.searchTerm = "";
		this.themeSelBtn;
		this.listContainer;
	}

	/**
	 * called when the `char-list` element is added to the page
	 * initializes stuff
	 */
	connectedCallback() {
		console.log("haiiii")
		const header = document.createElement("div");
		header.classList.add("list_header");
			this.themeSelBtn = document.createElement("div");
			this.themeSelBtn.title = "Filter by theme";
			this.themeSelBtn.classList.add("theme_sel_btn");
			this.themeSelBtn.addEventListener("click", (e) => this.themeSelBtn_onclick(e));
			header.appendChild(this.themeSelBtn);
			const searchBar = document.createElement("div");
			searchBar.classList.add("search_container");
				const searchInput = document.createElement("input");
				searchInput.classList.add("search_bar");
				searchInput.type = "text";
				searchInput.placeholder = "Search characters";
				searchInput.addEventListener("input", (e) => this.searchInput_oninput(e));
				searchBar.appendChild(searchInput);
			header.appendChild(searchBar);
		this.appendChild(header);
		this.listContainer = document.createElement("div");
		this.listContainer.id = "char_list";
		this.appendChild(this.listContainer);
		this.switchTheme(this.DEFAULT_THEME_ID, this.DEFAULT_STUDIO_ID);
		return this;
	}

	/**
	 * called when the theme selector button is clicked
	 * @param {Event} e
	 */
	themeSelBtn_onclick(e) {
		const themeSelector = document.createElement("theme-selector");
		themeSelector.classList.add("popup_container");
		themeSelector.setAttribute("data-filter", "cc");
		document.body.appendChild(themeSelector);
	}

	/**
	 * called when the dearch bar is typed into
	 * @param {InputEvent} e 
	 */
	searchInput_oninput(e) {
		this.searchTerm = e.currentTarget.value;
		this.killChildren()
		this.switchPage(0);
	}

	/**
	 * removes all child elements
	 * @returns {CharList}
	 */
	killChildren() {
		this.listContainer.innerHTML = "";
		return this;
	}

	/**
	 * displays an error message
	 * @param {string} text
	 * @returns {CharList}
	 */
	displayError(text) {
		this.listContainer.innerText = text;
		return this;
	}

	/**
	 * switches the currently displayed theme
	 * @param {string} themeId 
	 */
	switchTheme(themeId, studioId) {
		this.themeSelBtn.innerHTML = "";
			const icon = document.createElement("i");
			icon.classList.add("ico", "blist");
			this.themeSelBtn.appendChild(icon);
			const image = document.createElement("img");
			image.src = `/media/img/themes/icons/${studioId}.webp`;
			this.themeSelBtn.appendChild(image);
		const xhttp = new XMLHttpRequest();
		const self = this;
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4) {
				return;
			}
			if (this.status !== 200) {
				console.error(this.response);
				self.displayError("An error has occured trying to load the character list.");
				return;
			}
			self.chars = JSON.parse(this.responseText);
			self.killChildren();
			self.switchPage(0);
		};
		xhttp.open("GET", `/api/char/list?themeId=${themeId}`, true);
		xhttp.send();
	}

	switchPage(num) {
		this.killChildren();
		const beg = num * this.MAX_CHARS_PER_PAGE;
		const section = this.chars.slice(beg, Math.min(
			beg + this.MAX_CHARS_PER_PAGE,
			this.chars.length
		));
		for (let c = 0; c < section.length; c++) {
			const char = this.chars[c];

			if (
				this.searchTerm.length > 0 &&
				char.title.toLowerCase().indexOf(this.searchTerm.toLowerCase()) < 0
			) {
				continue;
			}

			// escape the title
			const title = char.title.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

			this.listContainer.innerHTML += 
				`<div class="char" data-id=${char.id}>
					<ul>
						<li><img src="/assets/${char.id}.png" alt="thumbnail"/></li>
						<li class="title" title="${char.id}">${title}</li>
						<li class="hov_actions">
							<a href="javascript:;" onclick="popup('${char.id}')" title="Play"><i class="ico play"></i></a>
							<a href="/cc?original_asset_id=${char.id}" title="Edit"><i class="ico brush"></i></a>
							<a href="/assets/${char.id}.xml" download="${title.replace('"', "_")}.zip" title="Download XML"><i class="ico download"></i></a>
							<a href="javascript:;" onclick="destructive('${char.id}', 'delete')" title="Delete"><i class="ico trash"></i></a>
						</li>
					</ul>
				</div>`.replace(/\t\n/g, "").trim();
		}
	}

	destructive(mId, act) {
		const yesno = confirm(`Are you sure you want to ${act} movie #${mId}?`);

		if (yesno)
			$.get(`/api/movie/${act}/${mId}`)
				.done((data) => {
					if (data.status == "ok") {
						switch (act) {
							case "clone":
								window.location = `/go_full?movieId=${data.mId}`;
								break;
							case "delete":
								const $elem = $("#" + mId);
								$elem.fadeOut(() => $elem.remove());
								break;
						}
					} else alert("Guess you're stuck with your movie.");
				});
	}
};

customElements.define("char-list", CharList);

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
