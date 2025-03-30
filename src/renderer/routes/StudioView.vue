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
import AssetImporter from "../components/importer/AssetImporter.vue";
import type { AssetStatus } from "../components/importer/ImporterFile.vue";
import CCModal from "../components/CCModal.vue";
import { onMounted, ref, toValue, useTemplateRef } from "vue";
import PreviewPlayer from "../components/PreviewPlayer.vue";
import SettingsController from "../controllers/SettingsController";
import ThemeSelector from "../components/ThemeSelector.vue";
import { useRoute, useRouter } from "vue-router";


/*
==== BEGIN STUDIO CALLBACKS ====
*/

type CCModalType = InstanceType<typeof CCModal>;
type PreviewPlayerType = InstanceType<typeof PreviewPlayer>;

const ccModal = useTemplateRef<CCModalType>("ccModal");
const previewPlayer = useTemplateRef<PreviewPlayerType>("previewPlayer");
const router = useRouter();
const studio = useTemplateRef<HTMLObjectElement>("studio-object");
const showCCModal = ref(false);
const showImporter = ref(false);
const showPreviewer = ref(false);

/* cc callbacks */

function exitCCModal() {
	showCCModal.value = false;
}
function charSaved(id:string) {
	//@ts-ignore
	studio.value.loadCharacterById(id);
}

/* importer callbacks */

function exitImporter() {
	showImporter.value = false;
}

/**
 * called when a file in the queue has progressed a step
 * this would update the cloud icon in the LVM
 */
function onImportStatusUpdate(status:AssetStatus) {
	switch (status) {
		case "uploading": {
			// @ts-ignore
			studio.value.importerStatus("processing");
			break;
		}
		case "error":
		case "finished": {
			// @ts-ignore
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
	// @ts-ignore
	studio.value.importerUploadComplete(assetType, assetId, lvmObject);
}

/**
 * called when a user clicks the 'add to scene' button on an uploaded asset
 */
function onImportAddToScene(assetType:string, assetId:string) {
	// @ts-ignore
	studio.value.importerAddAsset(assetType, assetId);
}

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
	window.quitStudio = function () {
		const shouldQuit = confirm("Are you sure you want to exit the studio? You may have unsaved changes.");
		if (shouldQuit) {
			router.push("/");
		}
	};
	//@ts-ignore
	window.initPreviewPlayer = function (movieXml:string, startFrame:number) {
		showPreviewer.value = true;
		showImporter.value = false;
		previewPlayer.value.displayPlayer(movieXml, startFrame);
	};
	//@ts-ignore
	window.showCCWindow = function (themeId:string) {
		showCCModal.value = true;
		showImporter.value = false;
		ccModal.value.display(themeId);
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
		<CCModal :show="showCCModal == true" ref="ccModal" @exit="exitCCModal" @char-saved="charSaved"/>
		<PreviewPlayer :show="showPreviewer == true" ref="previewPlayer" @exit-clicked="exitPreviewer" @save-video="showSavePopup"/>
	</div>
</template>
