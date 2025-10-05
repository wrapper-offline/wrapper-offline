<style lang="css">
.preview_popup_container {
	background: #0000;
}
#player_object {
	display: block;
	margin: auto;
	width: 640px;
	height: 360px;
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
} from "../../controllers/AppInit";
import Button from "../controls/Button.vue";
import Popup from "../Popup.vue";
import { onMounted, ref } from "vue";

const emit = defineEmits<{
	exitClicked: [],
	saveVideo: [],
}>();
const { show = true } = defineProps<{
	show?: boolean
}>();

let globalXml = "";
let params:Params = {
	flashvars: {
		isEmbed: "1",
		tlang: "en_US",
		isInitFromExternal: "1",
		startFrame: "0",
		autostart: "1",
		isPreview: "1",
		apiserver: apiServer + "/",
		storePath: staticServer + staticPaths.storeUrl + "/<store>",
		clientThemePath: staticServer + staticPaths.clientUrl + "/<client_theme>"
	},
	allowScriptAccess: "always",
	movie: ""
};
const showObject = ref(false);
const swfUrl = swfUrlBase + "/player.swf";

onMounted(() => {
	//@ts-ignore
	window.retrievePreviewPlayerData = function () {
		const movieXml = globalXml.slice();
		globalXml = "";
		return movieXml;
	}
});

/**
 * initializes the player object
 * @param movieXml movie xml
 * @param startFrame frame to start from
 */
function displayPlayer(movieXml:string, startFrame:number) {
	globalXml = movieXml;
	params.movie = swfUrl;
	params.flashvars.startFrame = startFrame.toString();
	showObject.value = true;
}

function exitButton_click() {
	showObject.value = false;
	emit("exitClicked");
}
function saveButton_click() {
	exitButton_click();
	emit("saveVideo");
}

defineExpose({ displayPlayer });

</script>

<template>
	<div class="preview_modal">
		<Popup class="preview_popup_container" :show="show">
			<template #small-heading>Editing a video</template>
			<template #large-heading>Video preview</template>
	
			<object v-if="showObject" id="player_object" :src="swfUrl" type="application/x-shockwave-flash" width="640" height="360">
				<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
			</object>
	
			<template #foot>
				<Button @click="exitButton_click">Exit preview</Button>
				<Button primary @click="saveButton_click">Save</Button>
			</template>
		</Popup>
	</div>
</template>
