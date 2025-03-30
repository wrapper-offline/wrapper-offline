<style lang="css" scoped>
.page_contents {
	overflow: auto;
}

/**
view options row
**/
.view_options {
	border-bottom: 1px solid #bfbeca;
	display: flex;
	padding: 6px 0 4px 30px;
	justify-content: space-between;
}
.view_options .zoom_slider {
	display: flex;
}
.view_options .zoom_slider input {
	margin-left: 4px;
}
.view_options .view_change .btn {
	font-weight: normal;
	margin: 0 4px 0 0;
	padding: 2px 8px 1px;
}
.view_options .view_change .btn:hover {
	opacity: 0.8;
}
html.dark .view_options {
	border-color: #32313f;
}

/***
list view
***/

table.movie_list {
	border-collapse: collapse;
	border-spacing: 0;
	table-layout: fixed;
	width: 100%;
}

/**
list head
*s*/
thead.list_head {
	border-bottom: 2px solid;
	border-color: #bfbeca;
}
thead.list_head th {
	border-left: 1px solid;
	border-color: #bfbeca;
	top: 0;
}
thead.list_head .space.side_padding {
	border: none;
	width: 25px;
}
thead.list_head .sort_option {
	transition: background 0.2s var(--button-anim);
	text-align: left;
	padding: 10px 6px;
	line-height: 15px;
}
thead.list_head .sort_option.active::after {
	content: "🞃";
	opacity: 0.7;
	float: right;
	transform: translate(-2px, -1px);
}
thead.list_head .sort_option.active.desc::after {
	transform: translate(-2px, 3px) rotate(180deg);
}
thead.list_head .sort_option:hover {
	background: #ffeaf4;
	transition: none;
}
/* resize dragger */
thead.list_head th .dragger {
	cursor: col-resize;
	position: absolute;
	float: right;
	margin-top: -23px;
	width: 6px;
	height: 32px;
}
thead.list_head th .dragger:hover {
	background: #489cf7a3;
	transition: 0.1s ease-in;
}
html.dark thead.list_head {
	border-color: #32313f;
}
html.dark thead.list_head th {
	border-color: #32313f;
}
html.dark thead.list_head .sort_option:hover {
	background: #422b3d;
}


/***
list view
***/

tbody {
	height: 100%;
}


/***
grid view
***/

.movie_grid {
	margin-top: 10px;
	padding-left: 25px;
}

</style>

<script setup lang="ts">
import { apiServer } from "../controllers/AppInit";
import type { Asset } from "../interfaces/Asset";
import ListTree from "../components/list/ListTree.vue";
import Navbar from "../components/Navbar.vue";
import type { NavbarEntry } from "../components/Navbar.vue";
import AssetListEntryRenderer from "../components/list/AssetListEntryRenderer.vue";
import {
	onMounted,
	provide,
	ref,
	Ref,
	toValue,
	watch
} from "vue";
import { useRoute } from "vue-router";
import { view, zoomLevel } from "../controllers/listRefs";
import { zoomLevelKey } from "../keys/listTreeKeys";
import type { FieldIdOf, ListFieldColumn, SelectedListSort } from "../interfaces/ListTypes";

const route = useRoute();
/** movie or starters page being used */
let listPage:"movie"|"starter";
/** id of the folder whose contents are currently being listed */
const currentFolder = ref<string>();

/** list of links to display in the navbar's address */
const navbarEntries = ref<NavbarEntry[]>([]);
/** list of user assets */
const assetList = ref<Asset[]>();

/* movie list columns */
let sortOptions:ListFieldColumn<Asset>[] = [
	{
		id: "title",
		title: "Name",
		width: ref(250),
	},
	{
		id: "id",
		title: "Asset ID",
		width: ref(100),
	},
	{
		id: "type",
		title: "Type",
		width: ref(100),
	},
];

/** list sort option that is currently selected */
const selectedSort = ref<SelectedListSort<Asset>>({
	id: "title",
	descending: true
});

/**
 * resets the movie list object to a blank value
 */
function initList() {
	assetList.value = [];
}

/**
 * used to resort a list of entries
 * @param asset1 movie 1
 * @param asset2 movie 2
 */
function assetSortCb(asset1:Asset, asset2:Asset): number {
	let mul = toValue(selectedSort).descending ? 1 : -1;
	const sortOption = toValue(selectedSort).id;
	switch (sortOption) {
		case "id":
		case "type": {
			return asset1[sortOption].localeCompare(asset2[sortOption]) * mul;
		}
	}
}

/**
 * called when the user clicks a sort option
 * @param newSort sort option to switch to
 */
function changeSort(newSort:FieldIdOf<Asset>) {
	// TODO : store sort option
	if (selectedSort.value.id == newSort) {
		selectedSort.value.descending = !selectedSort.value.descending;
	} else {
		selectedSort.value = {
			id: newSort,
			descending: true,
		};
	}
	assetList.value = assetList.value.sort(assetSortCb);
}

/**
 * called when the user resizes a movie list column
 * @param id sort option id
 * @param e mouse event
 */
function draggerDown(id:FieldIdOf<Asset>, e:MouseEvent) {
	document.body.classList.add("col_resize");
	const option = sortOptions.find(v => v.id == id);
	const startX = e.clientX;
	const startWidth = toValue(option.width);
	const moveCb = (moveE2:MouseEvent) => {
		let newWidth = Math.max(startWidth - startX + moveE2.clientX, 95);
		newWidth = Math.min(newWidth, 400);
		option.width.value = newWidth;
	};
	window.addEventListener("mousemove", moveCb);
	window.addEventListener("mouseup", () => {
		window.removeEventListener("mousemove", moveCb);
		document.body.classList.remove("col_resize");
	});
}

/**
 * initializes the list by loading assets
 */
function getAssetList(): Promise<Asset[]> {
	return new Promise((res) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			let responseJson = JSON.parse(this.responseText);
			res(responseJson);
		};
		let url = `${apiServer}/api/asset/list`;
		xhttp.open("GET", url, true);
		xhttp.send();
	});
}

/**
 * called when the route updates, gathers information before reloading the list
 */
async function routeUpdated() {
	listPage = route.name == "movie_list" ? "movie" : "starter";
	if (listPage == "movie") {
		currentFolder.value = route.params.folderId as string || "";
	}
	await loadAssetList();
}

/**
 * loads the movie/starter list along with the relevant navbar entries
 */
async function loadAssetList() {
	initList();
	const response = await getAssetList();
	navbarEntries.value = [
		{
			path: "/assets",
			title: "Your Library"
		}
	];
	assetList.value = response;
}

watch(() => route.path, routeUpdated);
onMounted(async () => {
	routeUpdated();
});

initList();
provide(zoomLevelKey, zoomLevel);

</script>

<template>
	<div>
		<Navbar :entries="navbarEntries" state="movielist"/>

		<div class="page_contents">
			<table class="movie_list">
				<thead class="list_head">
					<tr>
						<th class="space side_padding"></th>
						<th
							v-for="field in sortOptions" 
							@click.self="changeSort(field.id)"
							:class="{
								active: selectedSort.id == field.id,
								desc: selectedSort.descending,
								sort_option: true
							}"
							:style="{
								width: view == 'list' ? field.width.value + 'px' : '150px'
							}">
							{{ field.title }}
							<div v-if="view == 'list'"
								class="dragger"
								:style="{marginLeft: field.width.value - 11 + 'px'}"
								@mousedown.stop.prevent="(e) => draggerDown(field.id, e)"></div>
						</th>
						<th class="space"></th>
					</tr>
				</thead>
				<tbody id="list_body"></tbody>
			</table>

			<Teleport defer to="#list_body" :disabled="view == 'grid'">
				<ListTree
					ref="base-tree"
					:columns="sortOptions.map((v) => v.id)"
					:data="{ folders:[], entries:assetList }"
					:renderer="AssetListEntryRenderer"
					:selectedSort="selectedSort"/>
			</Teleport>
		</div>
	</div>
</template>
