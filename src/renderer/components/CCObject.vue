<style>
#cc_object[src*="cc.swf"] {
	display: block;
	margin: auto;
	width: 100%;
	max-width: calc(182px * 7);
	height: calc(100% - 42px);
}
.cc_hotbar {
	background: hsl(252deg 16% 94%);
	border-bottom: 1px solid hsl(240 12% 76% / 1);
	display: flex;
	justify-content: space-between;
	padding: 5px calc((100% - (182px * 7)) / 2);
	height: 42px;
}

html.dark .cc_hotbar {
	background: hsl(250 9% 16% / 1);
	border-color: hsl(250 9% 24% / 1);
}

.cc_container {
	height: 100%;
}

.cc_hotbar>div {
	display: flex;
}

.cc_hotbar .nav_btn {
	border: 1px solid #0000;
	color: hsl(211 4% 32% / 1);
	border-radius: 5px;
	transition: 0.2s var(--button-anim);
	font-size: 16px;
	margin: 0 3px;
	padding: 0 10px;
}
.cc_hotbar .nav_btn i {
	transform: translateY(1px);
}
.cc_hotbar .nav_btn:hover {
	background: hsl(338deg 37% 83%);
	border-color: hsl(344deg 57% 58% / 45%);
	color: hsl(344deg 15% 30% / 1);
	transition: none;
	cursor: pointer;
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
} from "../utils/AppInit";
import extractCharThemeId from "../utils/extractCharThemeId";
import { onMounted, onUnmounted, ref, useTemplateRef } from "vue";
import Button from "./controls/Button.vue";
import useLocalSettings from "../composables/useLocalSettings";
import ColorPicker from "./controls/ColorPicker.vue";
import { HSVtoRGB, RGBtoHex } from "../utils/colorUtil";

const emit = defineEmits<{
	/** emitted when the object switches to the cc */
	ccEnter: [],
	charSaved: [string],
}>();
const props = defineProps<{
	strictThemeUpload?: boolean
}>();

const ccContainer = useTemplateRef("cc-container");
const ccObject = useTemplateRef("cc-object");
const settings = useLocalSettings();
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
	movie: "",
	wmode: "transparent"
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
	if (!e.dataTransfer) {
		return;
	}
	const reader = new FileReader();
	reader.onload = (e2) => {
		const xml = (reader.result || "").toString();
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

function cmdBtn_click(option:string) {
	switch (option) {
		case "undo":
			//@ts-ignore
			ccObject.value.undo();
			break;
		case "redo":
			//@ts-ignore
			ccObject.value.redo();
			break;
		case "flip":
			//@ts-ignore
			ccObject.value.previewFlip();
			break;
	}
}

function bgColor_input(value:[number, number, number]) {
	if (!ccContainer.value) {
		return;
	}
	const hex = RGBtoHex(HSVtoRGB(value));
	ccContainer.value.style.backgroundColor = "#" + hex;
}

onMounted(() => {
	//@ts-ignore
	window.ccLoaded = function () {
		// TODO SHOW HOTBAR CONTENTS
	};
	//@ts-ignore
	window.getDarkMode = function () {
		return settings.darkMode;
	};
});

defineExpose({
	createCharacter,
	copyCharacter,
	getXml,
	uploadCharacter,
	reset
});
</script>

<template>
	<div class="cc_container" ref="cc-container">
		<div class="cc_hotbar">
			<div>
				upload asset
			</div>
			<div>
				<div class="nav_btn" v-tooltip="'Undo'" @click="cmdBtn_click('undo')"><i class="ico undo"></i></div>
				<div class="nav_btn" v-tooltip="'Redo'" @click="cmdBtn_click('redo')"><i class="ico redo"></i></div>
				(reset, random, bodytype)
			</div>
			<div>
				preview zoom, fit
				<div class="nav_btn" v-tooltip="'Flip preview'" @click="cmdBtn_click('flip')"><i class="ico squarrows"></i></div>
				<ColorPicker tooltip="Background color" @input="bgColor_input"/>
			</div>
		</div>
		<object v-if="showObject"
			id="cc_object"
			:src="swfUrl"
			type="application/x-shockwave-flash"
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
			<param v-for="[name, param] of Object.entries(Object.assign(params, { movie:(params.movie || '').replace('cc', 'cc_old') }))" :name="name" :value="toAttrString(param)"/>
		</object>
	</div>
</template>
