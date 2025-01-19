class ThemeSelector extends Popup {
	/**
	 * inserts the theme buttons
	 * @param {Element} parent 
	 */
	async insertContents(parent) {
		const ccFilter = this.getAttribute("data-filter") == "cc" || false;
		const themeList = await this.loadThemeList(ccFilter);
		for (const theme of themeList) {
			const button = this.createThemeElement(theme);
			parent.appendChild(button);
		}
	}

	/**
	 * requests a themelist object from the api server
	 */
	loadThemeList(ccFilter = false) {
		return new Promise((res, rej) => {
			const xhttp = new XMLHttpRequest();
			xhttp.onreadystatechange = function () {
				if (this.readyState != 4 || this.status != 200) {
					return;
				}
				const themes = JSON.parse(this.responseText);
				let returnArray = [];
				for (const theme of themes) {
					if (ccFilter && !theme.cc_theme_id) {
						continue;
					}
					returnArray.push(theme);
				}
				res(returnArray);
			};
			xhttp.open("GET", "/api/theme/list", true);
			xhttp.send();
		});
	}

	/**
	 * creates a theme button
	 * @param {object} themeData 
	 */
	createThemeElement(themeData) {
		const button = document.createElement("div");
		button.classList.add("theme");
		button.style.backgroundImage = `url(/media/img/themes/banners/${themeData.id}.webp)`;
			const icon = document.createElement("img");
			icon.src = `/media/img/themes/icons/${themeData.id}.webp`;
			icon.alt = themeData.name;
			button.appendChild(icon);
			button.innerHTML += themeData.name;
		return button;
	}
}

customElements.define("theme-selector", ThemeSelector);
