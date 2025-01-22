<style lang="css" scoped>
#page_container {
	padding: 0;
	height: 100%;
}
#studio_object {
	display: block;
	margin: auto;
	width: 100%;
	height: 100%;
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
		collab: "0",
		ctc: "go",
		goteam_draft_only: "1",
		isLogin: "Y",
		// TODO: ISWIDE CHECK
		// isWide: isWide ? "1" : "0",
		isWide: "0",
		lid: "0",
		nextUrl: "/",
		page: "",
		retut: "1",
		siteId: "go",
		tlang: "en_US",
		ut: "60",
		apiserver: apiServer + "/",
		storePath: staticServer + staticPaths.storeUrl + "/<store>",
		clientThemePath: staticServer + staticPaths.clientUrl + "/<client_theme>"
	},
	allowScriptAccess: "always"
};

let movieId = route.query.themeId as string | void;
if (movieId) {
	params.flashvars.movieId = movieId;
	displayStudio("MovieLibrary");
} else {
	let themeId = route.query.themeId as string | void;
	if (themeId) {
		displayStudio(themeId);
	} else {
		showSelector.value = true;
	}
}

function displayStudio(themeId:string) {
	swfUrl = swfUrlBase + "/go_full.swf";
	params.flashvars.tray = themeId;
	params.movie = swfUrl;
	showSelector.value = false;
	showObject.value = true;
}

function displayPlayer() {
	swfUrl = swfUrlBase + "/cc.swf";
	params.movie = swfUrl;
	showSelector.value = false;
	showObject.value = true;
}

onMounted(() => {
	const tutorialReload = (new URLSearchParams(window.location.search)).get("tutorial");
	const interactiveTutorial = {
		neverDisplay: function() {
			return tutorialReload ? false : true;
		}
	};
	function quitStudio() { window.location.href = "/" }
	//@ts-ignore
	window.interactiveTutorial = interactiveTutorial;
	//@ts-ignore
	window.quitStudio = quitStudio;
});
</script>

<template>
	<div id="page_container">
		<ThemeSelector heading-for="Create a video" v-if="showSelector" @theme-clicked="(theme) => displayStudio(theme.id)"/>
		<object v-if="showObject" id="studio_object" :src="swfUrl" type="application/x-shockwave-flash">
			<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
		</object>
	</div>
</template>
