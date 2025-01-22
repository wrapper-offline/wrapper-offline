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
import {
	apiServer,
	Params,
	staticPaths,
	staticServer,
	swfUrlBase,
	toAttrString
} from "../controllers/AppInit";
import { onMounted, ref } from "vue";
import ThemeSelector from "../components/ThemeSelector.vue";
import { useRoute } from "vue-router";

const route = useRoute();
const showObject = ref(false);
const showSelector = ref(false);
let swfUrl:string;

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
	//@ts-expect-error
	window.typeSelected = function typeSelected(type:string) {
		showObject.value = false;
		setTimeout(() => {
			createCharacter(params.flashvars.themeId, type);
		}, 55);
	};
	//@ts-expect-error
	window.copyClicked = function copyClicked(assetId:string) {
		showObject.value = false;
		setTimeout(() => {
			copyCharacter(assetId);
		}, 55);
	};
	//@ts-expect-error
	window.characterSaved = function characterSaved() {
		showObject.value = false;
		setTimeout(() => {
			displayBrowser(params.flashvars.themeId);
		}, 55);
	};
});
</script>

<template>
	<div id="page_container">
		<ThemeSelector
			heading-for="Characters"
			v-if="showSelector"
			cc-filter
			@theme-clicked="(theme) => displayBrowser(theme.cc_theme_id)"/>
		<object v-if="showObject" id="cc_object" :src="swfUrl" type="application/x-shockwave-flash">
			<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
		</object>
	</div>
</template>
