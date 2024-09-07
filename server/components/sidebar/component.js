class Sidebar extends HTMLElement {
	constructor() {
		super();
		this.collapsed = false;
		this.mainLinks = [
			{
				location: "/videos",
				name: "Videos",
				icon: "film",
				default: true
			},
			{
				location: "/starters",
				name: "Starters",
				icon: "briefcase"
			},
			{
				location: "/characters",
				name: "Characters",
				icon: "person"
			}
		];
	}

	/**
	 * called when the element is added to the page
	 */
	connectedCallback() {
		const logoContainer = document.createElement("div");
		logoContainer.id = "logo_container";
			const iconImg = document.createElement("img");
			iconImg.id = "logo_icon";
			iconImg.src = "/pages/img/logo_icon.svg";
			iconImg.alt = "Candy Wrappers";
			logoContainer.appendChild(iconImg);
			const imgWordmark = document.createElement("img");
			imgWordmark.id = "logo_wordmark";
			imgWordmark.src = "/pages/img/logo_wordmark.svg";
			imgWordmark.alt = "Wrapper: Offline";
			logoContainer.appendChild(imgWordmark);
		this.appendChild(logoContainer);
		const topGroup = document.createElement("ul");
			const togLink = document.createElement("li");
			togLink.classList.add("link");
			togLink.setAttribute("data-toggle", null);
			togLink.addEventListener("click", () => this.togLink_click());
				const togBtn = document.createElement("button");
					const togBtnIcon = document.createElement("i");
					togBtnIcon.classList.add("ico", "arr_r")
					togBtn.appendChild(togBtnIcon);
					const togBtnText = document.createElement("div");
					togBtnText.classList.add("link_text");
					togBtnText.innerText = "Menu";
					togBtn.appendChild(togBtnText);
				togLink.appendChild(togBtn);
			topGroup.appendChild(togLink);
		this.appendChild(topGroup);
		this.customGroup = document.createElement("ul");
		this.customGroup.classList.add("user_custom");
		this.addLinks(this.customGroup);
		this.appendChild(this.customGroup);
		const bottomGroup = document.createElement("ul");
			const helpGroup = document.createElement("li");
			helpGroup.classList.add("group");
				const helpGroupList = document.createElement("ul");
					const faqLink = document.createElement("li");
					faqLink.classList.add("link");
						const faqA = document.createElement("a");
						faqA.target = "_blank";
						faqA.href = "https://github.com/Wrapper-Offline/Wrapper-Offline/wiki";
							const faqIcon = document.createElement("i");
							faqIcon.classList.add("ico", "interr");
							faqA.appendChild(faqIcon);
							const faqText = document.createElement("div");
							faqText.classList.add("link_text");
							faqText.innerText = "FAQ";
							faqA.appendChild(faqText);
						faqLink.appendChild(faqA);
					helpGroupList.appendChild(faqLink);
					const discordLink = document.createElement("li");
					discordLink.classList.add("link");
						const discordA = document.createElement("a");
						discordA.target = "_blank";
						discordA.href = "https://discord.gg/yhGAetN";
							const discordIcon = document.createElement("i");
							discordIcon.classList.add("ico", "speech");
							discordA.appendChild(discordIcon);
							const discordText = document.createElement("div");
							discordText.classList.add("link_text");
							discordText.innerText = "Discord";
							discordA.appendChild(discordText);
						discordLink.appendChild(discordA);
					helpGroupList.appendChild(discordLink);
				helpGroup.appendChild(helpGroupList);
			bottomGroup.appendChild(helpGroup);
			const settingsLink = document.createElement("li");
			settingsLink.classList.add("link");
				const settingsA = document.createElement("a");
				settingsA.href = "/settings";
					const settingsIcon = document.createElement("i");
					settingsIcon.classList.add("ico", "cog");
					settingsA.appendChild(settingsIcon);
					const settingsText = document.createElement("div");
					settingsText.classList.add("link_text");
					settingsText.innerText = "Settings";
					settingsA.appendChild(settingsText);
				settingsLink.appendChild(settingsA);
			bottomGroup.appendChild(settingsLink);
			const wrapperVer = document.createElement("span");
			wrapperVer.id = "wrapper_ver";
			wrapperVer.innerText = "vX.X.X";
			bottomGroup.appendChild(wrapperVer);
		this.appendChild(bottomGroup);
	}

	/**
	 * Adds link elements to the custom section of the sidebar.
	 */
	addLinks(parent) {
		for (const link of this.mainLinks) {
			const elem = this.createLinkElement(link);
			parent.appendChild(elem);
		}
	}

	/**
	 * Creates an element from a link object.
	 * @param {object} data 
	 * @returns {HTMLAnchorElement}
	 */
	createLinkElement(data) {
		const elem = document.createElement("li");
		elem.classList.add("link");
		elem.addEventListener("click", (e) => this.onLinkClick(e));
			const tog = document.createElement("button");
			tog.innerText = ">";
			elem.appendChild(tog);
			const link = document.createElement("a");
			link.href = data.location;
				const icon = document.createElement("i");
				icon.classList.add("ico", data.icon);
				link.appendChild(icon);
				const text = document.createElement("div");
				text.classList.add("link_text");
				text.innerText = data.name;
				link.appendChild(text);
			elem.appendChild(link);
		return elem;
	}

	/**
	 * Called whenever a sidebar link is clicked.
	 * @param {Event} e 
	 * @param {string} loc
	 */
	onLinkClick(e) {
		e.preventDefault();
		e.stopPropagation();
		const link = e.currentTarget.getElementsByTagName("a")[0];
		history.pushState({}, "", link.href);
		Page.switchTo(link.href);
	}

	/**
	 * Called whenever the collapse button is clicked. 
	 */
	togLink_click() {
		this.classList.toggle("collapsed");
	}
}

customElements.define("app-sidebar", Sidebar);
