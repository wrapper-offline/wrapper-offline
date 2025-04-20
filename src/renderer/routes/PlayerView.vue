<style lang="css" scoped>
#full_page_container {
	padding: 0;
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
	background: radial-gradient(#333, #111);
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
import { onMounted, ref, useTemplateRef } from "vue";
import SettingsController from "../controllers/SettingsController";
import { useRoute } from "vue-router";

const studio = useTemplateRef<HTMLObjectElement>("studio-object");

onMounted(() => {
	
});

const showObject = ref(false);
let swfUrl:string;

let params:Params = {
	flashvars: {
		appCode: "go",
		autostart: "1",
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
	allowScriptAccess: "always",
	allowFullScreen: "true",
};

/**
 * called when a theme has been selected by the user
 * @param themeId theme id
 */
function displayPlayer(movieId:string) {
	swfUrl = swfUrlBase + "/player.swf";
	params.flashvars.movieId = movieId;
	params.movie = swfUrl;
	showObject.value = true;
}

const route = useRoute();
const movieId = route.params.movieId as string;
displayPlayer(movieId);
</script>

<template>
	<div id="full_page_container">
		<object v-if="showObject" id="studio_object" :src="swfUrl" type="application/x-shockwave-flash" ref="studio-object">
			<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
		</object>
	</div>
</template>
