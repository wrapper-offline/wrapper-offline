<style lang="css" scoped>
.page_contents {
	overflow: auto;
}
</style>

<script setup lang="ts">
import { apiServer } from "../utils/AppInit";
import type { Asset } from "../interfaces/Asset";
import AssetRowOptions from "../components/list/options/AssetRowOptions.vue";
import AssetListRow from "../components/list/AssetListRow.vue";
import type { FieldIdOf, ListFieldColumn, SelectedListSort } from "../interfaces/ListTypes";
import { flattenAssetType } from "../utils/flattenAssetType";
import ListTree from "../components/list/ListTree.vue";
import Navbar from "../components/Navbar.vue";
import type { NavbarEntry } from "../components/Navbar.vue";
import {
	onMounted,
	ref,
	toValue,
	watch
} from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

/** list of links to display in the navbar's address */
const navbarEntries = ref<NavbarEntry[]>([]);
/** list of user assets */
const assetList = ref<Asset[]>();
/** is the asset list currently being loaded */
const isLoading = ref(false);

let columnWidths = JSON.parse(localStorage.getItem("sasset_list-columnWidths")) ??
	{ "title":280, "id":120, "type":150 };
let columns:ListFieldColumn<Asset>[] = [
	{
		id: "title",
		width: ref(columnWidths["title"]),
	},
	{
		id: "id",
		width: ref(columnWidths["id"]),
	},
	{
		id: "type",
		width: ref(columnWidths["type"]),
	},
];

/** list sort option that is currently selected */
const selectedSort = ref<SelectedListSort<Asset>>(
	JSON.parse(localStorage.getItem("sasset_list-selectedSort")) ??
		{
			id: "title",
			descending: true
		}
);

/**
 * clears the asset list array
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
	if (selectedSort.value.id == newSort) {
		selectedSort.value.descending = !selectedSort.value.descending;
	} else {
		selectedSort.value = {
			id: newSort,
			descending: true,
		};
	}
	localStorage.setItem("sasset_list-selectedSort", JSON.stringify(toValue(selectedSort)));
	assetList.value = assetList.value.sort(assetSortCb);
}

/**
 * called when the user resizes a movie list column
 * @param id column id
 * @param newWidth new width in pixels
 */
function columnResized(id:FieldIdOf<Asset>, newWidth:number) {
	columnWidths[id] = newWidth;
	localStorage.setItem("sasset_list-columnWidths", JSON.stringify(columnWidths));
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
	isLoading.value = true;
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
			title: `Your Library`
		}
	];
	assetList.value = response.sort(assetSortCb);
	setTimeout(() => {
		isLoading.value = false;
	}, 80);
}

watch(() => route.path, routeUpdated);
onMounted(async () => {
	routeUpdated();
});

initList();

</script>

<template>
	<div>
		<Navbar
			:count="assetList.length"
			:entries="navbarEntries"
			:supported="{
				search: true,
				zoom: true
			}"/>

		<div class="page_contents">
			<ListTree
				:class="{
					load_state: isLoading
				}"
				ref="base-tree"
				:data="{ folders:[], entries:assetList }"
				:row-component="AssetListRow"
				:row-options-component="AssetRowOptions"
				:columns="columns"
				:selected-sort="selectedSort"
				:restrictions="{
					mode: 'list'
				}"
				@column-resize="columnResized"
				@sort-change="changeSort"/>
		</div>
	</div>
</template>
