<script setup lang="ts">
import {
	apiServer,
	Params,
	staticPaths,
	staticServer,
	swfUrlBase,
	toAttrString
} from "../controllers/AppInit";
import Button from "./controls/Button.vue";
import Popup from "./Popup.vue";

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
	allowScriptAccess: "always"
};
const swfUrl = swfUrlBase + "/player.swf";



</script>

<template>
	<Popup>
		<template #small-heading>Editing a video</template>
		<template #large-heading>Video preview</template>

		<object id="player_object" :src="swfUrl" type="application/x-shockwave-flash">
			<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
		</object>

		<template #foot>
			<Button><RouterLink to="/">Exit preview</RouterLink></Button>
			<Button><RouterLink to="/">Save video</RouterLink></Button>
		</template>
	</Popup>
</template>
