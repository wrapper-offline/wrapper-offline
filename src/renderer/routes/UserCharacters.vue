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
import Navbar, { NavbarEntry } from "../components/Navbar.vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { onMounted, Ref, ref, useTemplateRef } from "vue";
import ThemeSelector from "../components/ThemeSelector.vue";
import useTempStorage from "../composables/useTempStorage";
import { useThemeList } from "../composables/useThemeList";

type CCObjectType = InstanceType<typeof CCObject>;

const ccObject = useTemplateRef<CCObjectType>("cc-object");
const route = useRoute();
const router = useRouter();
const tempStorage = useTempStorage();

const baseNavbarEntry = {
	path: "/characters",
	title: "Characters"
};
const navbarEntries:Ref<NavbarEntry[]> = ref([]);
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
	navbarEntries.value.push({
		path: "hope you like it",
		title: "Creating a character"
	});
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
	const themeList = await useThemeList();
	const theme = themeList.find(t => t.cc_theme_id == themeId);
	navbarEntries.value = [
		baseNavbarEntry,
		{
			path: "/characters/",
			title: `${theme.name} Characters`
		}
	];
	showDlButton.value = false;
}

/**
 * called when a theme has been clicked in the theme selector
 * @param id theme id
 */
function themeClicked(id:string) {
	router.push({
		name: "cc_page",
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

onMounted(() => {
	themeId = route.params.themeId as string || "";
	themeIdCheck();
});
</script>

<template>
	<div>
		<Navbar
			:entries="navbarEntries"
			:supported="{ download:showDlButton }"
			state="cc"
			@download-click="charDownload"/>
		<div class="page_contents">
			<theme-selector
				heading-for="Characters"
				v-if="showSelector"
				cc-filter
				@theme-clicked="(theme) => themeClicked(theme.cc_theme_id)"/>
			<CCObject v-show="showObject" ref="cc-object" @cc-enter="ccEntered" @char-saved="charSaved"/>
		</div>
	</div>
</template>
