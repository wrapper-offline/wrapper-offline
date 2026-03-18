<style>
	object#cr_object {
		position: absolute;
		top: 0;
		right: 0;
	}
</style>

<script setup lang="ts">
import { useTemplateRef } from 'vue';
import { initCR } from '../composables/useCharRenderer';
import { apiServer, Params, staticPaths, staticServer, swfUrlBase, toAttrString } from '../utils/AppInit';

const cr = useTemplateRef<HTMLObjectElement>("char-renderer");
let swfUrl:string = swfUrlBase + "/char_renderer.swf";
let params:Params = {
	flashvars: {
		apiserver: apiServer + "/",
		animationPath: swfUrl,
		storePath: staticServer + staticPaths.storeUrl + "/<store>",
		clientThemePath: staticServer + staticPaths.clientUrl + "/<client_theme>"
	},
	allowScriptAccess: "always",
	movie: swfUrl
};

initCR(cr);
</script>

<template>
	<object
		id="cr_object"
		:src="swfUrl"
		type="application/x-shockwave-flash"
		width="1"
		height="1"
		ref="char-renderer"
	>
		<param v-for="[name, param] of Object.entries(params)" :name="name" :value="toAttrString(param)"/>
	</object>
</template>