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

const emit = defineEmits<{
	/** emitted when the object switches to the cc */
	ccEnter: [],
	charSaved: [string],
}>();

const showObject = ref(false);
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
	movie: ""
};

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
			copyCharacter(params.flashvars.themeId, assetId);
		}, 55);
	};
	/**
	 * character is saved, wait on parent to either begin new cc session or exit
	 * @param id new character id
	 */
	//@ts-expect-error
	window.characterSaved = function characterSaved(id:string) {
		reset();
		setTimeout(() => {
			emit("charSaved", id);
		}, 55);
	};
});

/**
 * shows the cc browser
 * @param themeId cc theme id
 */
function displayBrowser(themeId:string) {
	swfUrl = swfUrlBase + "/cc_browser.swf";
	params.flashvars.themeId = themeId;
	params.movie = swfUrl;
	showObject.value = true;
}

/**
 * displays the character creator, new character
 * @param themeId cc theme id
 * @param bs bodyshape id
 */
function createCharacter(themeId:string, bs:string) {
	params.flashvars.themeId = themeId;
	params.flashvars.bs = bs;
	displayCreator();
}

/**
 * displays the character creator, copy character
 * @param themeId cc theme id
 * @param assetId character id
 */
function copyCharacter(themeId:string, assetId:string) {
	params.flashvars.themeId = themeId;
	params.flashvars.original_asset_id = assetId;
	displayCreator();
}

function displayCreator() {
	emit("ccEnter");
	swfUrl = swfUrlBase + "/cc.swf";
	params.movie = swfUrl;
	showObject.value = true;
}

/**
 * clears all flashvars and hides the cc <object>
 */
function reset() {
	delete params.flashvars.themeId;
	delete params.flashvars.bs;
	delete params.flashvars.original_asset_id;
	delete params.movie;
	showObject.value = false;
	swfUrl = "";
}

defineExpose({ displayBrowser, createCharacter, copyCharacter, reset });

</script>

<template>
	<object v-if="showObject" id="cc_object" :src="swfUrl" type="application/x-shockwave-flash" width="980" height="600">
		<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
	</object>
</template>
