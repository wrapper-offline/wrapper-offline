<script setup lang="ts">
import {
	apiServer,
	Params,
	staticPaths,
	staticServer,
	swfUrlBase,
	toAttrString
} from "../utils/AppInit";
import extractCharThemeId from "../utils/extractCharThemeId";
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import Button from "./controls/Button.vue";

const emit = defineEmits<{
	/** emitted when the object switches to the cc */
	ccEnter: [],
	charSaved: [string],
}>();
const props = defineProps<{
	strictThemeUpload?: boolean
}>();

const ccObject = useTemplateRef("cc-object");
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
onUnmounted(() => {
	//@ts-ignore
	delete window.characterSaved;
});

/**
 * called when a file is dropped into the cc
 * @param e drag event
 */
function fileDropped(e:DragEvent) {
	const reader = new FileReader();
	reader.onload = (e2) => {
		const xml = e2.target.result.toString();
		const themeId = extractCharThemeId(xml);
		if (props.strictThemeUpload && themeId != params.flashvars.themeId) {
			return;
		}
		reset();
		setTimeout(() => {
			uploadCharacter(themeId, xml);
		}, 55);
	};
	reader.readAsText(e.dataTransfer.files[0]);
}

/**
 * returns current character xml
 */
function getXml(): string {
	//@ts-ignore
	return swfUrl.endsWith("cc.swf") ? ccObject.value.getXml() : "";
}

/**
 * shows the character creator
 */
function displayCreator() {
	emit("ccEnter");
	swfUrl = swfUrlBase + "/cc.swf";
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

/**
 * displays the character creator, uses existing xml
 * @param themeId cc theme id
 * @param xmlData character id
 */
function uploadCharacter(themeId:string, xmlData:string) {
	params.flashvars.themeId = themeId;
	params.flashvars.xml_data = xmlData;
	displayCreator();
}

/**
 * clears all flashvars and hides the cc <object>
 */
function reset() {
	delete params.flashvars.bs;
	delete params.flashvars.themeId;
	delete params.flashvars.original_asset_id;
	delete params.flashvars.xml_data;
	delete params.movie;
	showObject.value = false;
	swfUrl = "";
}

function undoBtn_click() {
	//@ts-ignore
	ccObject.value.undo();
}

function redoBtn_click() {
	//@ts-ignore
	ccObject.value.redo();
}

defineExpose({
	createCharacter,
	copyCharacter,
	getXml,
	uploadCharacter,
	reset
});
</script>

<template>
	<div class="cc_hotbar">
		<div class="hb_left">
			upload asset, preview bg color
		</div>
		<div class="hb_left">
			<Button @click="undoBtn_click">Undo</Button>
			<Button @click="redoBtn_click">Redo</Button>
			(reset, random, bodytype)
		</div>
		<div class="hb_left">
			preview zoom, fit, flip
		</div>
	</div>
	<object v-if="showObject"
		id="cc_object"
		:src="swfUrl"
		type="application/x-shockwave-flash"
		width="980"
		height="600"
		ref="cc-object"
		@dragover.prevent.stop=""
		@drop.prevent.stop="fileDropped">
		<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
	</object>
	<object v-if="showObject"
		id="cc_object2"
		:src="swfUrl.replace('cc', 'cc_old')"
		type="application/x-shockwave-flash"
		width="980"
		height="600"
		@dragover.prevent.stop=""
		@drop.prevent.stop="fileDropped">
		<param v-for="[name, param] of Object.entries(Object.assign(params, { movie:params.movie.replace('cc', 'cc_old') }))" :name="name" :value="toAttrString(param)"/>
	</object>
</template>
