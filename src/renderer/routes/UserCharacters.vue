<style>
#cc_object[src*="cc_browser.swf"] {
	display: block;
	margin: auto;
	width: 980px;
	height: 1200px;
}
#cc_object[src*="cc.swf"] {
	display: block;
	margin: auto;
	margin-top: 15px;
	width: 980px;
	height: 600px;
}

.cc_hotbar {
	background: hsl(252deg 16% 94%);
	border-bottom: 1px solid hsl(240 12% 76% / 1);
	display: flex;
	justify-content: space-between;
	height: 35px;
}
</style>

<script setup lang="ts">
import { Asset } from "../interfaces/Asset";
import Navbar, { NavbarEntry } from "../components/Navbar.vue";
import { onMounted, ref } from "vue";
import { useThemeList } from "../composables/useThemeList";
import { apiServer } from "../utils/AppInit";
import { useSidebar } from "../composables/useSidebar";
import Popup from "../components/Popup.vue";
import ThemeSelector from "../components/ThemeSelector.vue";
import ThemeFilter from "../components/sidebar/ThemeFilter.vue";

const baseNavbarEntry = {
	path: "/characters",
	title: "Characters"
};

const navbarEntries = ref<NavbarEntry[]>([]);
/** list of user assets */
const assetList = ref<Asset[]>();
/** is the asset list currently being loaded */
const isLoading = ref(false);

/**
 * clears the asset list array
 */
function initList() {
	assetList.value = [];
}

/**
 * initializes the list by loading assets
 */
function requestCharList(): Promise<Asset[]> {
	return new Promise((res) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			let responseJson = JSON.parse(this.responseText);
			res(responseJson);
		};
		let url = `${apiServer}/api/char/list`;
		xhttp.open("GET", url, true);
		xhttp.send();
	});
}

/**
 * loads the char list along with the relevant navbar entries
 */
async function loadCharList() {
	isLoading.value = true;
	initList();
	const response = await requestCharList();
	assetList.value = response;
	setTimeout(() => {
		isLoading.value = false;
	}, 80);
}

onMounted(async () => {
	await loadCharList();
});

const sidebar = useSidebar();
sidebar.setRouteState({
	
});
</script>

<template>
	<div>
		<Navbar
			:entries="navbarEntries"
			:supported="{ download:false, save:true }"
			state="cc"/>

		<div class="page_contents">
			<div v-for="char in assetList">
				<img :src="char.thumbnail as any"/>
			</div>
		</div>
	</div>
</template>
