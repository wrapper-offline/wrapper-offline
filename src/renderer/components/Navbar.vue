<style lang="css" scoped>
header {
	background: hsl(255 13% 88% / 1);
	border-bottom: 1px solid hsl(240 12% 76% / 1);
	border-radius: 10px 0 0;
	display: flex;
	justify-content: space-between;
	padding: 6.5px 8px;
	height: 50px;
}
header>div {
	display: flex;
	align-items: center;
	height: 100%;
}
/* navigation buttons */
header .nav_btn {
	border: 1px solid #0000;
	color: hsl(211 4% 32% / 1);
	border-radius: 5px;
	transition: 0.2s var(--button-anim);
	font-size: 16px;
	margin: 0 3px 0 3px;
	padding: 2px 8px;
}
header .nav_btn i {
	transform: translateY(1px);
}
header .nav_btn:hover {
	background: hsl(344deg 90% 89% / 35%);
    border-color: hsl(344deg 57% 58% / 45%);
	color: hsl(344deg 20% 30% / 1);
	transition: none;
	cursor: pointer;
}

/**
address
**/
header .link_container {
	margin-left: 2px;
	overflow: hidden;
	white-space: nowrap;
}
header .link_container .link {
	color: #454257;
	border-radius: 3px;
	transition: background 0.2s var(--button-anim);
	padding: 4px 8px;
	height: 100%;
}
header .link_container .link:hover {
	background: hsl(255 13% 92% / 1);
	transition: none;
}
/* previous links */
header .link_container .parent_link {
	text-decoration: none;
	margin: 0 20px 0 0;
}
header .link_container .parent_link .caret {
	opacity: 0.6;
	pointer-events: none;
	font-size: 12px;
	position: relative;
	display: inline;
	margin-left: -16px;
	left: 24px;
}
/* current link */
header .link_container .final_link {
	user-select: none;
	font-weight: bold;
}

/**
search bar
**/
header .btn {
	margin: 0;
}
header .search_box {
	background: hsl(255 13% 90% / 1);
    border: 1px solid hsl(255 12% 73% / 1);
	border-radius: 3px;
	transition: 0.2s var(--button-anim);
	padding: 5px 6px;
}
header .search_box:focus {
	background: hsl(255 13% 91% / 1);
	border-color: #5589d8;
	outline: none;
}

/**
dark mode
**/
html.dark header {
	background: hsl(250 9% 13% / 1);
	border-color: hsl(250 9% 24% / 1);
}
html.dark header .nav_btn {
	color: hsl(0deg 0% 82%);
}
html.dark header .nav_btn:hover {
	background: hsl(328 21% 21% / 1);
	color: hsl(328 23% 88% / 1);
}
html.dark header .link_container .link {
	color: hsl(0deg 0% 85%);
}
html.dark header .link_container .link:hover {
	background: hsl(250 9% 17% / 1);
}
html.dark header .search_box {
	background: hsl(250 9% 16% / 1);
	border-color: hsl(250 9% 24% / 1);
	color: hsl(0deg 0% 82%);
}
html.dark header .search_box:focus {
	border-color: #5589d8;
}
</style>

<script setup lang="ts">
import Dropdown from "./controls/Dropdown.vue";
import DropdownItem from "./controls/DropdownItem.vue";
import { useRouter } from "vue-router";
import { searchInput, setView, setZoomLevel, view, zoomLevel } from "../controllers/listRefs";

export interface NavbarEntry {
	path: string,
	title: string,
};

const emit = defineEmits<{
	newFolderClick: []
}>();
defineProps<{
	/** display a number at the end of a final link */
	count?: number,
	/** address entries */
	entries: NavbarEntry[],
	/** specify supported features to show */
	supported?: {
		/** displays a new folder icon */
		newFolder?: boolean,
		/** display a search box */
		search?: boolean,
		/** display view mode toggle (list or grid) */
		viewMode?: boolean,
		/** display a zoom slider */
		zoom?: boolean,
	}
}>();

const router = useRouter();

function backButtonClick() {
	router.back();
}
function forwardButtonClick() {
	router.forward();
}

function onSearchInput(e:InputEvent) {
	const target = e.currentTarget as HTMLInputElement;
	searchInput(target.value);
}

/**
 * called when the new folder icon is clicked, emits event for it
 */
function newFolderClick() {
	emit("newFolderClick");
}

/**
 * called when the user clicks the view buttons
 * @param newView view to switch to
 */
function changeView(newView:"grid"|"list") {
	setView(newView);
}

/**
 * called when the user adjusts the zoom slider
 */
function zoomSliderMoved(e:InputEvent) {
	const target = e.currentTarget as HTMLInputElement;
	const newVal = target.valueAsNumber;
	setZoomLevel(newVal);
}
</script>

<template>
	<header>
		<div class="head_left">
			<div class="nav_btn" @click="backButtonClick"><i class="ico left"></i></div>
			<div class="nav_btn" @click="forwardButtonClick"><i class="ico right"></i></div>
			<div class="link_container">
				<RouterLink v-for="parent in entries.slice(0, -1)" :to="parent.path" class="link parent_link">
					{{ parent.title }}
					<div class="caret"><i class="ico right"></i></div>
				</RouterLink>
				<span v-if="entries.length > 0" class="link final_link">
					{{ entries[entries.length - 1].title }}
					<template v-if="count">
						({{ count }})
					</template>
				</span>
			</div>
		</div>
		<div class="head_right">
			<!-- new folder button -->
			<div v-if="supported?.newFolder"
				class="nav_btn"
				title="New folder"
				@click="newFolderClick">
				<i class="ico newfolder"></i>
			</div>
			<!-- search box -->
			<input v-if="supported?.search"
				class="search_box"
				type="text"
				placeholder="Search"
				@input="onSearchInput"/>
			<!-- zoom slider -->
			<Dropdown v-if="supported?.zoom" align="right">
				<template #toggle>
					<div class="nav_btn" title="Adjust zoom level">
						<i class="ico magnify"></i>
					</div>
				</template>
				<DropdownItem>
					<input type="range" min="42" max="70" :value="zoomLevel.slice(0, -2)" @input="zoomSliderMoved"/>
				</DropdownItem>
			</Dropdown>
			<!-- view options -->
			<div v-if="supported?.viewMode && view == 'list'"
				class="nav_btn"
				title="Grid view"
				@click="() => changeView('grid')">
				<i class="ico grid"></i>
			</div>
			<div v-if="supported?.viewMode && view == 'grid'"
				class="nav_btn"
				title="List view"
				@click="() => changeView('list')">
				<i class="ico blist"></i>
			</div>
		</div>
	</header>
</template>
