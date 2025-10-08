<style lang="css" scoped>
#full_page_container {
	padding: 0;
	width: 100%;
	height: 100%;
}
main {
	display: flex;
	width: 100%;
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
#full_page_container.popup_mode {
	background: var(--popup-gradient-bg);
}
#full_page_container.popup_mode #studio_object {
	margin: 0;
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
import AssetImporter from "../components/studio/importer/AssetImporter.vue";
import type { AssetStatus } from "../components/studio/importer/ImporterFile.vue";
import CCModal from "../components/studio/CCModal.vue";
import { onMounted, onUnmounted, ref, toValue, useTemplateRef } from "vue";
import MoviePreviewModal from "../components/studio/MoviePreviewModal.vue";
import SettingsController from "../controllers/SettingsController";
import StudioObject from "../interfaces/StudioObject";
import ThemeSelector from "../components/ThemeSelector.vue";
import { useRoute, useRouter } from "vue-router";

type CCModalType = InstanceType<typeof CCModal>;
type MoviePreviewModalType = InstanceType<typeof MoviePreviewModal>;

const ccModal = useTemplateRef<CCModalType>("ccModal");
const previewModal = useTemplateRef<MoviePreviewModalType>("previewModal");
const router = useRouter();
const studio = useTemplateRef<StudioObject>("studio-object");
const showCCModal = ref(false);
const showImporter = ref(false);
const showPreviewer = ref(false);
/** show studio object */
const showObject = ref(false);
/** show theme selector */
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

/* cc callbacks */

function exitCCModal() {
	showCCModal.value = false;
}
function charSaved(id:string) {
	studio.value.loadCharacterById(id);
}

/* importer callbacks */

function exitImporter() {
	showImporter.value = false;
	studio.value.importerStatus("clear");
}

/**
 * called when a file in the queue has progressed a step
 * this would update the cloud icon in the LVM
 */
function onImportStatusUpdate(status:AssetStatus) {
	switch (status) {
		case "uploading": {
			studio.value.importerStatus("processing");
			break;
		}
		case "error": {
			studio.value.importerStatus("clear");
			break;
		}
		case "finished": {
			studio.value.importerStatus("done");
		}
	}
}

/**
 * called when a in the importer queue has finished uploading
 */
function onImporterUploadSuccess(
	assetType: string,
	assetId: string,
	lvmObject: Record<string, string>
) {
	studio.value.importerUploadComplete(assetType, assetId, lvmObject);
}

/**
 * called when a user clicks the 'add to scene' button on an uploaded asset
 */
function onImportAddToScene(assetType:string, assetId:string) {
	studio.value.importerAddAsset(assetType, assetId);
}

/* preview callbacks */

function exitPreviewer() {
	showPreviewer.value = false;
}
function showSavePopup() {
	studio.value.onExternalPreviewPlayerPublish();
}

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

onMounted(() => {
	const tutorialReload = (new URLSearchParams(window.location.search)).get("tutorial");
	// @ts-ignore
	window.studioLoaded = function (arg) {
		console.log(arg)
	}
	//@ts-ignore
	window.interactiveTutorial = {
		neverDisplay: function() {
			return tutorialReload ? false : true;
		}
	};
	//@ts-ignore
	window.quitStudio = function (skipAsk:boolean) {
		const shouldQuit = skipAsk || confirm("Are you sure you want to exit the studio? You may have unsaved changes.");
		if (shouldQuit) {
			router.push("/");
		}
	};
	//@ts-ignore
	window.initPreviewPlayer = function (movieXml:string, startFrame:number) {
		showPreviewer.value = true;
		showImporter.value = false;
		setTimeout(() => {
			previewModal.value.displayPlayer(movieXml, startFrame);
		}, 55);
	};
	//@ts-ignore
	window.createCharacter = function (themeId:string) {
		showCCModal.value = true;
		showImporter.value = false;
		ccModal.value.displayBrowser(themeId);
	}
	//@ts-ignore
	window.copyCharacter = function (themeId:string, assetId:string) {
		showCCModal.value = true;
		showImporter.value = false;
		ccModal.value.copyCharacter(themeId, assetId);
	}
	//@ts-ignore
	window.showImporter = function () {
		if (toValue(showImporter) == false) {
			showImporter.value = true;
		} else {
			showImporter.value = false;
		}
	};
});
onUnmounted(() => {
	// @ts-ignore
	delete window.studioLoaded;
	//@ts-ignore
	delete window.interactiveTutorial;
	//@ts-ignore
	delete window.quitStudio;
	//@ts-ignore
	delete window.initPreviewPlayer;
	//@ts-ignore
	delete window.createCharacter;
	//@ts-ignore
	delete window.copyCharacter;
	//@ts-ignore
	delete window.showImporter;
});

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
	<div id="full_page_container" :class="{ popup_mode: showPreviewer || showCCModal }">
		<ThemeSelector heading-for="Create a video" v-if="showSelector" @theme-clicked="(theme) => themeSelected(theme.id)"/>
		<main>
			<AssetImporter
				v-show="showImporter"
				@add-to-scene="onImportAddToScene"
				@exit-clicked="exitImporter"
				@status-updated="onImportStatusUpdate"
				@upload-success="onImporterUploadSuccess"/>
			<object v-if="showObject" id="studio_object" :src="swfUrl" type="application/x-shockwave-flash" ref="studio-object">
				<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
			</object>
		</main>
		<CCModal :show="showCCModal == true" ref="ccModal" @char-saved="charSaved" @user-close="exitCCModal"/>
		<MoviePreviewModal :show="showPreviewer == true" ref="previewModal" @save-video="showSavePopup" @user-close="exitPreviewer"/>
	</div>
</template>
