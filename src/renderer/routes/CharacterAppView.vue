<style lang="css" scoped>
#page_container {
	padding: 0;
}
#cc_object[src*="cc_browser.swf"] {
	display: block;
	margin: auto;
	width: 980px;
	height: 1200px;
}
#cc_object[src*="cc.swf"] {
	display: block;
	margin: auto;
	width: 980px;
	height: 600px;
}
</style>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import ThemeSelector from "../components/ThemeSelector.vue";
import { useRoute } from "vue-router";

interface Params {
	flashvars: Flashvars,
	allowScriptAccess: string,
	movie: string,
	wmode: string,
}
type Flashvars = Record<string, string>;

const apiServer = inject("apiServer") as string;
const staticServer = inject("staticServer") as string;
const staticPaths = inject("staticPaths") as {swfUrl:string,storeUrl:string,clientUrl:string};
const swfUrlBase = staticServer + staticPaths.swfUrl;

const route = useRoute();
const showObject = ref(false);
const showSelector = ref(false);
let swfUrl:string;

/**
 * converts an object to a query string
 * @param table parameter value
 */
function toAttrString(table:Record<string, string> | string) {
	return typeof (table) == "object" ? new URLSearchParams(table).toString() : table.replace(/"/g, "\\\"");
}
let params:Params = {
	flashvars: {
		appCode: "go",
		ctc: "go",
		isEmbed: "1",
		isLogin: "Y",
		m_mode: "school",
		page: "",
		siteId: "go",
		tlang: "en_US",
		ut: "60",
		apiserver: apiServer + "/",
		storePath: staticServer + staticPaths.storeUrl + "/<store>",
		clientThemePath: staticServer + staticPaths.clientUrl + "/<client_theme>"
	},
	allowScriptAccess: "always",
	movie: "",
	wmode: "transparent"
};
if (route.path.startsWith("/characters")) {
	let themeId = route.params.themeId as string | void;
	if (themeId) {
		displayBrowser(themeId);
	} else {
		showSelector.value = true;
	}
}

function displayBrowser(themeId:string) {
	swfUrl = swfUrlBase + "/cc_browser.swf";
	params.flashvars.themeId = themeId;
	params.movie = swfUrl;
	showSelector.value = false;
	showObject.value = true;
}

function createCharacter(themeId:string, bs:string) {
	params.flashvars.themeId = themeId;
	params.flashvars.bs = bs;
	displayCreator();
}

function copyCharacter(assetId:string) {
	params.flashvars.original_asset_id = assetId;
	displayCreator();
}

function displayCreator() {
	swfUrl = swfUrlBase + "/cc.swf";
	params.movie = swfUrl;
	showSelector.value = false;
	showObject.value = true;
}

onMounted(() => {
	function typeSelected(type:string) {
		showObject.value = false;
		setTimeout(() => {
			createCharacter(params.flashvars.themeId, type);
		}, 55);
	}
	function copyClicked(assetId:string) {
		showObject.value = false;
		setTimeout(() => {
			copyCharacter(assetId);
		}, 55);
	}
	function characterSaved() {
		showObject.value = false;
		setTimeout(() => {
			displayBrowser(params.flashvars.themeId);
		}, 55);
	}
	//@ts-expect-error
	window.typeSelected = typeSelected;
	//@ts-expect-error
	window.copyClicked = copyClicked;
	//@ts-expect-error
	window.characterSaved = characterSaved;
});
</script>

<template>
	<div id="page_container">
		<ThemeSelector v-if="showSelector" cc-filter @theme-clicked="(theme) => displayBrowser(theme.cc_theme_id)"/>
		<object v-if="showObject" id="cc_object" :src="swfUrl" type="application/x-shockwave-flash">
			<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
		</object>
	</div>
</template>
