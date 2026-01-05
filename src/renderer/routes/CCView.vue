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
	margin-top: 15px;
	width: 980px;
	height: 600px;
}

.cc_hotbar {
	background: hsl(252deg 16% 94%);
	border-bottom: 1px solid hsl(240 12% 76% / 1);
	display: flex;
	justify-content: space-between;
	height: 35px;
}
</style>

<script setup lang="ts">
import CCObject from "../components/CCObject.vue";
import Navbar from "../components/Navbar.vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { onMounted, Ref, ref, useTemplateRef } from "vue";
import { useSidebar } from "../composables/useSidebar";
import useTempStorage from "../composables/useTempStorage";
import { useThemeList } from "../composables/useThemeList";
import CCThemeSelector from "../components/CCThemeSelector.vue";

type CCObjectType = InstanceType<typeof CCObject>;

const ccObject = useTemplateRef<CCObjectType>("cc-object");
const route = useRoute();
const router = useRouter();
const sidebar = useSidebar();
const tempStorage = useTempStorage();

const baseNavbarEntry = {
	path: "/characters_old",
	title: "Characters"
};
const showDlButton = ref(false);
const showObject = ref(false);
const showSelector = ref(false);
let themeId = "";

/**
 * initializes cc object
 * @param id theme id
 */
function initObject(id:string) {
	themeId = id;
	showSelector.value = false;
	showObject.value = true;
	const xml = tempStorage.retrieve("charXmlData") as string | void;
	if (typeof xml != "undefined") {
		ccObject.value.uploadCharacter(themeId, xml);
		return;
	}
	ccObject.value.displayBrowser(themeId);
}

function ccEntered() {
	
	showDlButton.value = true;
}

/**
 * called when download button in navbar is clicked
 */
function charDownload() {
	const xml = ccObject.value.getXml();
	const elem = document.createElement("a");
	elem.href = "data:text/xml," + xml;
	elem.download = "character.xml";
	elem.click();
	elem.remove();
}

/**
 * called when a character is saved, returns to browser
 */
function charSaved() {
	populateNavbar();
	ccObject.value.displayBrowser(themeId);
}

/**
 * displays the cc if there is an id, shows theme selector if not
 */
function themeIdCheck() {
	if (themeId.length > 0) {
		populateNavbar();
		initObject(themeId);
	} else {
		showSelector.value = true;
		showObject.value = false;
	}
}

/**
 * populates the navbar with the base link and theme chars link
 */
async function populateNavbar() {
	
}

/**
 * called when a theme has been clicked in the theme selector
 * @param id theme id
 */
function themeClicked(id:string) {
	router.push({
		name: "old_cc_page",
		params: {
			themeId: id
		}
	});
}

onBeforeRouteUpdate((newRoute) => {
	ccObject.value.reset();
	themeId = newRoute.params.themeId as string || "";
	themeIdCheck();
});

sidebar.setRouteState({
	slideMode: true
});

onMounted(() => {
	themeId = route.params.themeId as string || "";
	themeIdCheck();
});
</script>

<template>
	<div>
		<Navbar
			:supported="{ download:showDlButton, save:true }"
			state="cc"
			@download-click="charDownload"/>
		<!-- <div class="cc_hotbar">
			<div class="hb_left">
				upload asset, preview bg color
			</div>
			<div class="hb_left">
				undo, redo, (reset, andom, bodytype)
			</div>
			<div class="hb_left">
				preview zoom, fit, flip
			</div>
		</div> -->
		<div class="page_contents">
			<CCThemeSelector
				v-if="showSelector"
				cc-filter
				@theme-clicked="(theme) => themeClicked(theme.cc_theme_id)"/>
			<CCObject v-show="showObject" ref="cc-object" @cc-enter="ccEntered" @char-saved="charSaved"/>
		</div>
	</div>
</template>
