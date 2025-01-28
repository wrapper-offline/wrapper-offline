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

/**
previewer is open
**/
#page_container.preview_mode {
	background: radial-gradient(#333, #111);
}
#page_container.preview_mode #studio_object {
	height: 1px;
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
import { onMounted, ref, useTemplateRef } from "vue";
import PreviewPlayer from "../components/PreviewPlayer.vue";
import SettingsController from "../controllers/SettingsController";
import ThemeSelector from "../components/ThemeSelector.vue";
import { useRoute, useRouter } from "vue-router";


/*
==== BEGIN STUDIO CALLBACKS ====
*/

type PreviewPlayerType = InstanceType<typeof PreviewPlayer>;

const previewPlayer = useTemplateRef<PreviewPlayerType>("previewPlayer");
const router = useRouter();
const studio = useTemplateRef<HTMLObjectElement>("studio-object");
const showPreviewer = ref(false);

/* preview callbacks */
function exitPreviewer() {
	showPreviewer.value = false;
}
function showSavePopup() {
	//@ts-ignore
	studio.value.onExternalPreviewPlayerPublish();
}

onMounted(() => {
	const tutorialReload = (new URLSearchParams(window.location.search)).get("tutorial");
	//@ts-ignore
	window.interactiveTutorial = {
		neverDisplay: function() {
			return tutorialReload ? false : true;
		}
	};
	//@ts-ignore
	window.quitStudio = function () {
		const shouldQuit = confirm("Are you sure you want to exit the studio? You may have unsaved changes.");
		if (shouldQuit) {
			router.push("/");
		}
		//TODO: add some sort of delay to the exit
		//it feels weird when it instantly snaps to the default page
	};
	//@ts-ignore
	window.initPreviewPlayer = function (movieXml:string, startFrame:number) {
		showPreviewer.value = true;
		previewPlayer.value.displayPlayer(movieXml, startFrame);
	};
});

/*
==== END STUDIO CALLBACKS ====
*/


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
		isWide: SettingsController.get("isWide") ? "1" : "0",
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

/**
 * called when a theme has been selected by the user
 * @param themeId theme id
 */
function themeSelected(themeId:string) {
	swfUrl = swfUrlBase + "/go_full.swf";
	params.flashvars.tray = themeId;
	params.movie = swfUrl;
	showSelector.value = false;
	showObject.value = true;
}

/* get flashvars */
const route = useRoute();
let movieId = route.params.movieId as string | void;
if (movieId) {
	params.flashvars.movieId = movieId;
	themeSelected("MovieLibrary");
} else {
	let themeId = route.query.themeId as string | void;
	if (themeId) {
		themeSelected(themeId);
	} else {
		showSelector.value = true;
	}
}
</script>

<template>
	<div id="page_container" :class="{ preview_mode:showPreviewer }">
		<ThemeSelector heading-for="Create a video" v-if="showSelector" @theme-clicked="(theme) => themeSelected(theme.id)"/>
			<object v-if="showObject" id="studio_object" :src="swfUrl" type="application/x-shockwave-flash" ref="studio-object">
				<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
			</object>
			<PreviewPlayer v-show="showPreviewer" ref="previewPlayer" @exit-clicked="exitPreviewer" @save-video="showSavePopup"/>
		</div>
</template>
