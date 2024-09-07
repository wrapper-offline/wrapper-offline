class ThemeSelector extends HTMLElement {
	/**
	 * called when the element is added to the page
	 */
	connectedCallback() {
		this.popup = document.createElement("div");
		this.popup.classList.add("popup");
			const popupHeading = document.createElement("h2");
			popupHeading.classList.add("popup_heading");
			popupHeading.innerText = "Select a theme";
			this.popup.appendChild(popupHeading);
			const closeBtn = document.createElement("button");
			closeBtn.classList.add("close_btn");
			closeBtn.innerText = "\u00D7";
			this.popup.appendChild(closeBtn);
		this.appendChild(this.popup);

		/**
		 * @param {Event} e 
		 */
		const opinionHandler = (e) => {
			if (e.target != this) {
				return;
			}
			this.remove();
		}
		this.onclick = opinionHandler;
		const handler2 = () => this.remove();
		closeBtn.onclick = handler2;

		this.loadThemeList();
	}

	/**
	 * requests a themelist object from the api server
	 */
	loadThemeList() {
		const ccFilter = this.getAttribute("data-filter") == "cc" || false;
		const xhttp = new XMLHttpRequest();
		const self = this;
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			const themes = JSON.parse(this.responseText);
			for (const theme of themes) {
				if (ccFilter && !theme.cc_theme_id) {
					continue;
				}
				self.insertTheme(theme);
			}
		};
		xhttp.open("GET", "/api/theme/list", true);
		xhttp.send();
	}

	/**
	 * inserts a theme into the popup
	 * @param {object} themeData 
	 */
	insertTheme(themeData) {
		const button = document.createElement("div");
		button.classList.add("theme");
		button.style.backgroundImage = `url(/pages/img/themes/banners/${themeData.id}.webp)`;
			const icon = document.createElement("img");
			icon.src = `/pages/img/themes/icons/${themeData.id}.webp`;
			icon.alt = themeData.name;
			button.appendChild(icon);
			button.innerHTML += themeData.name;
		this.popup.appendChild(button);
	}
}

customElements.define("theme-selector", ThemeSelector);
