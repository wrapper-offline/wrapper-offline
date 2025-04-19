<style>
#cc_object[src*="cc_browser.swf"] {
	display: block;
	margin: auto;
	width: 980px;
	height: 1200px;
}
#cc_object[src*="cc.swf"] {
	display: block;
	margin: auto;
	width: 980px;
	height: 600px;
}
</style>

<script setup lang="ts">
import CCObject from "../components/CCObject.vue";
import Navbar from "../components/Navbar.vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { onMounted, ref, useTemplateRef } from "vue";
import ThemeSelector from "../components/ThemeSelector.vue";

const route = useRoute();
const router = useRouter();
const showObject = ref(false);
const showSelector = ref(false);
let themeId = "";
type CCObjectType = InstanceType<typeof CCObject>;
const ccObject = useTemplateRef<CCObjectType>("cc-object");

/**
 * initializes cc object
 * @param id theme id
 */
function initObject(id:string) {
	themeId = id;
	showSelector.value = false;
	showObject.value = true;
	ccObject.value.displayBrowser(themeId);
}

function charSaved() {
	ccObject.value.displayBrowser(themeId);
}

/**
 * displays the cc if there is an id, shows theme selector if not
 */
function themeIdCheck() {
	if (themeId.length > 0) {
		initObject(themeId);
	} else {
		showSelector.value = true;
		showObject.value = false;
	}
}

/**
 * called when a theme has been clicked in the theme selector
 * @param id theme id
 */
function themeClicked(id:string) {
	router.push(route.path + "/" + id);
}

onBeforeRouteUpdate((newRoute) => {
	ccObject.value.reset();
	themeId = newRoute.params.themeId as string || "";
	themeIdCheck();
});

onMounted(() => {
	themeId = route.params.themeId as string || "";
	themeIdCheck();
});
</script>

<template>
	<div>
		<Navbar :entries="[{
			path: '/characters',
			title: 'Characters'
		}]" state="cc"/>
		<div class="page_contents">
			<theme-selector
				heading-for="Characters"
				v-if="showSelector"
				cc-filter
				@theme-clicked="(theme) => themeClicked(theme.cc_theme_id)"/>
			<CCObject v-show="showObject" ref="cc-object" @char-saved="charSaved"/>
		</div>
	</div>
</template>
