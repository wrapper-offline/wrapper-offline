class TabbedNavigation extends HTMLDivElement {
	constructor() {
		this.tabs = [];
	}

	connectedCallback() {
		const tabList = document.createElement("div");
		tabList.classList.add("tab_navigation");
		this.appendChild(tabList);
	}

	addTab(name, contents) {
		const tab = document.createElement("nav");
		tab.classList.add("tab_page")
		this.tabs.push(tab);
		this.appendChild(tab);
	}

	switchTab(index) {
		
	}
}

customElements.define("tabbed-navigation", TabbedNavigation)
