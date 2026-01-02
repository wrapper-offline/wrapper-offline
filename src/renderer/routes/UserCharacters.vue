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

.dropdown.theme_filter .dropdown_item {
	line-height: 28px;
	padding: 4px 24px 4px 12px;
}
.dropdown.theme_filter .dropdown_item img {
	display: block;
	float: left;
	margin-right: 5px;
	height: 28px;
}

.data_list_container.grid.char_list table.data_list tbody {
	display: grid;
	grid-template-columns: repeat(auto-fit, 190px);
	column-gap: 25px;
	justify-content: center;
	margin: auto;
	padding-right: 25px;
	max-width: calc(190px * 5);
}

@media (max-width: 700px) {
	.data_list_container.grid.char_list table.data_list tbody {
		grid-template-columns: repeat(auto-fit, 100px);
		max-width: calc(100px * 5);
	}
}

@media (min-width: 1270px) {
	.data_list_container.grid.char_list table.data_list tbody {
		grid-template-columns: repeat(auto-fit, 200px);
		max-width: calc(200px * 7);
	}
}
</style>

<script setup lang="ts">
import { Asset } from "../interfaces/Asset";
import Navbar from "../components/Navbar.vue";
import { onMounted, ref } from "vue";
import { apiServer } from "../utils/AppInit";
import DataList from "../components/list/DataList.vue";
import CharListRow from "../components/list/CharListRow.vue";
import { DataListRow2, ListFieldColumn, SelectedListSort } from "../interfaces/DataList";
import { useNavbar } from "../composables/useNavbar";
import Dropdown from "../components/controls/Dropdown.vue";
import DropdownItem from "../components/controls/DropdownItem.vue";
import { Theme, useThemeList } from "../composables/useThemeList";
import CharRenderer from "../components/CharRenderer.vue";

const columns:ListFieldColumn<Asset>[] = [
	{
		id: "title",
		width: ref(0)
	},
	{
		id: "index",
		width: ref(0)
	}
];
const selectedSort = ref<SelectedListSort<Asset>>({
	id: "index",
	descending: true
});
/** list of user assets */
const assetList = ref<Asset[]>();
/** is the asset list currently being loaded */
const isLoading = ref(false);
let themelist:Theme[] = [];

/**
 * clears the asset list array
 */
function initList() {
	assetList.value = [];
}

/**
 * initializes the list by loading assets
 */
function requestCharList(): Promise<Asset[]> {
	return new Promise((res) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			let responseJson = JSON.parse(this.responseText);
			res(responseJson);
		};
		let url = `${apiServer}/api/char/list`;
		xhttp.open("GET", url, true);
		xhttp.send();
	});
}

/**
 * loads the char list along with the relevant navbar entries
 */
async function loadCharList() {
	isLoading.value = true;
	initList();
	const response = await requestCharList();
	assetList.value = response;
	setTimeout(() => {
		isLoading.value = false;
	}, 80);
}

const navbar = useNavbar();
navbar.setRouteState({
	entries: [
		{
			title: "Characters"
		}
	]
});
initList();
onMounted(async () => {
	await loadCharList();
	themelist = await useThemeList(true);
});

</script>

<template>
	<div>
		<Navbar
			:supported="{ download:false, save:true }"/>

		<div class="page_contents">
			<CharRenderer/>
			<!-- TODO: ADD CATEGORY SUPPORT WIth folders -->
			Filter by [Theme], [Custom/Stock characters], [Category (Default: All)]
			<Dropdown class="theme_filter">
				<template #toggle>
					Theme
				</template>
				<DropdownItem>
					None
				</DropdownItem>
				<DropdownItem v-for="theme in themelist">
					<img class="icon" :src="`/img/themes/icons/${theme.id}.webp`" alt=""/>
					{{ theme.name }}
				</DropdownItem>
			</Dropdown>
			<DataList
				class="char_list"
				:data="{ folders:[], entries:assetList }"
				:is-loading="isLoading"
				:columns="columns"
				:selected-sort="selectedSort"
				:restrictions="{
					mode: 'grid'
				}"
				:row-component="CharListRow as any as DataListRow2<Asset>"
			/>
		</div>
	</div>
</template>
