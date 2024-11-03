class Popup extends HTMLElement {
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
			const contentCntnr = document.createElement("div");
			contentCntnr.classList.add("contents");
			this.popup.appendChild(contentCntnr);
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

		this.insertContents(contentCntnr);
	}

	/**
	 * inserts the contents of the popup
	 * this is supposed to be overridden
	 * @param {Element} parent 
	 */
	insertContents(parent) {
		return;
	}
}

customElements.define("app-popup", Popup);
