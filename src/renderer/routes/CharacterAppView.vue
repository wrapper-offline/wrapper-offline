<style lang="css" scoped>
#page_container {
	padding: 0;
}
#browser_object {
	display: block;
	margin: auto;
	width: 980px;
	height: 1200px;
}
</style>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import ThemeSelector from "../components/ThemeSelector.vue";
import { useRoute } from "vue-router";

const apiServer = inject("apiServer") as string;
const staticServer = inject("staticServer") as string;
const staticPaths = inject("staticPaths") as {swfUrl:string,storeUrl:string,clientUrl:string};
let swfUrl = staticServer + staticPaths.swfUrl;

const showSelector = ref(false);
const showObject = ref(false);
const route = useRoute();

let params = {
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
		themeId: "",
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
	swfUrl += "/cc_browser.swf";
	params.flashvars.themeId = themeId;
	params.movie = swfUrl;
	showSelector.value = false;
	showObject.value = true;
}

function createCharacter(themeId:string, bs:string) {
	displayCreator();
}

function displayCreator() {
	swfUrl += "/cc.swf";
	let themeId = route.params.themeId as string | void;
	return {
		bs: "adam",
		// original_asset_id: req.query["id"] || "",
		themeId: themeId as string,
	};
}



onMounted(() => {
	function typeSelected(type:string) {
		console.log(type);
	}
	const script = document.createElement("script");
	script.innerText = typeSelected.toString();
	const pageContainer = document.getElementById("page_container");
	console.log(pageContainer)
	pageContainer.appendChild(script);
});

/**
 * converts an object to a query string
 * @param table parameter value
 */
function toAttrString(table:Record<string, string> | string) {
	return typeof (table) == "object" ? new URLSearchParams(table).toString() : table.replace(/"/g, "\\\"");
}
</script>

<template>
	<div id="page_container">
		<ThemeSelector v-if="showSelector" @theme-clicked="(theme) => displayBrowser(theme.cc_theme_id)"/>
		<object v-if="showObject" id="browser_object" :src="swfUrl" type="application/x-shockwave-flash">
			<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
		</object>
	</div>
</template>
