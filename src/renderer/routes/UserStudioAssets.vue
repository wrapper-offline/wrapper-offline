<style lang="css" scoped>
.page_contents {
	overflow: auto;
}
</style>

<script setup lang="ts">

import { apiServer } from "../controllers/AppInit";
import type { Asset } from "../interfaces/Asset";
import AssetListRow from "../components/list/AssetListRow.vue";
import type { FieldIdOf, ListFieldColumn, SelectedListSort } from "../interfaces/ListTypes";
import { flattenAssetType } from "../utils/flattenAssetType";
import ListTree from "../components/list/ListTree.vue";
import Navbar from "../components/Navbar.vue";
import type { NavbarEntry } from "../components/Navbar.vue";
import {
	onMounted,
	provide,
	ref,
	toValue,
	watch
} from "vue";
import { useRoute } from "vue-router";
import { zoomLevel } from "../controllers/listRefs";
import { zoomLevelKey } from "../keys/listTreeKeys";

const route = useRoute();

/** list of links to display in the navbar's address */
const navbarEntries = ref<NavbarEntry[]>([]);
/** list of user assets */
const assetList = ref<Asset[]>();

/* movie list columns */
let sortOptions:ListFieldColumn<Asset>[] = [
	{
		id: "title",
		width: ref(280),
	},
	{
		id: "id",
		width: ref(120),
	},
	{
		id: "type",
		width: ref(150),
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
		case "type": {
			const type1 = flattenAssetType(asset1.type, asset1.subtype, asset1.ptype);
			const type2 = flattenAssetType(asset2.type, asset2.subtype, asset2.ptype);
			return type1.localeCompare(type2) * mul;
		}
		default: {
			const compare1 = asset1[sortOption].toString();
			const compare2 = asset2[sortOption].toString();
			return compare1.localeCompare(compare2) * mul;
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
			<ListTree
				ref="base-tree"
				:data="{ folders:[], entries:assetList }"
				:component="AssetListRow"
				:selected-sort="selectedSort"
				:sort-options="sortOptions"
				:restrictions="{
					mode: 'list'
				}"
				@sort-change="changeSort"/>
		</div>
	</div>
</template>
