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
header .link {
	color: #454257;
	border-radius: 3px;
	transition: background 0.2s var(--button-anim);
	padding: 4px 8px;
	height: 100%;
}
header .link:hover {
	background: #323143;
	transition: none;
}
/* previous links */
header .parent_link {
	color: #fff;
	text-decoration: none;
	margin: 0 20px 0 0;
}
header .parent_link .caret {
	opacity: 0.6;
	pointer-events: none;
	font-size: 12px;
	position: relative;
	display: inline;
	margin-left: -16px;
	left: 24px;
}
/* current link */
header .final_link {
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

html.dark header {
	background: hsl(250 9% 13% / 1);
	border-color: hsl(250 9% 24% / 1);
}
html.dark header .link:hover {
	background: #262531;
}
</style>

<script setup lang="ts">
import Dropdown from "./controls/Dropdown.vue";
import DropdownItem from "./controls/DropdownItem.vue";
import { useRouter } from "vue-router";
import { ref } from "vue";
import { setView, setZoomLevel, view, zoomLevel } from "../controllers/listRefs";

export interface NavbarEntry {
	path: string,
	title: string,
};

const router = useRouter();
const isMovieList = ref(false);

/**
 * Builds an address using the current route
 * @param route vue-router route
 */
async function parsePath(route) {
	// parents.value = [];
	// finalPath.value = "";
	// if (route.path.startsWith("/characters")) {
	// 	const themeId = route.params.themeId as string | void;
	// 	if (!themeId) {
	// 		return;
	// 	}
	// 	const themeList = await useThemeList();
	// 	const theme = themeList.find(t => t.cc_theme_id == themeId);
	// 	parents.value.push({
	// 		path: "/characters",
	// 		title: "Characters"
	// 	});
	// 	finalPath.value = `${theme.name} Characters`;
	// 	isMovieList.value = false;
	// 	return;
	// }
}

function backButtonClick() {
	router.back();
}
function forwardButtonClick() {
	router.forward();
}

function onSearchInput(e:InputEvent) {
	const target = e.currentTarget as HTMLInputElement;
	// search.value = target.value;
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

defineProps<{
	/** display a number at the end of a final link */
	count?: number,
	/** address entries */
	entries: NavbarEntry[],
	/** specifies which options to display on the right */
	state: "cc" | "charlist" | "movielist"
}>();
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
		<div v-if="state == 'movielist'" class="head_right">
			<!-- new folder button -->
			<div class="nav_btn" title="New folder">
				<i class="ico newfolder"></i>
			</div>
			<!-- search box -->
			<input
				class="search_box"
				type="text"
				placeholder="Search movies..."
				@input="onSearchInput"/>
			<!-- zoom slider -->
			<Dropdown align="right">
				<template #toggle>
					<div class="nav_btn" title="Change zoom">
						<i class="ico magnify"></i>
					</div>
				</template>
				<DropdownItem>
					<input type="range" min="42" max="70" :value="zoomLevel.slice(0, -2)" @input="zoomSliderMoved"/>
				</DropdownItem>
			</Dropdown>
			<!-- view options -->
			<div class="nav_btn"
				title="Grid view"
				v-if="view == 'list'"
				@click="() => changeView('grid')">
				<i class="ico grid"></i>
			</div>
			<div class="nav_btn"
				title="List view"
				v-if="view == 'grid'"
				@click="() => changeView('list')">
				<i class="ico blist"></i>
			</div>
		</div>
	</header>
</template>
