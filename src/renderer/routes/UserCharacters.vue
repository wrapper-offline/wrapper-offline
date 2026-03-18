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

.char_list .data_list_container.grid table.data_list tbody {
	display: grid;
	grid-template-columns: repeat(auto-fill, 92px);
	column-gap: 25px;
	justify-content: space-evenly;
	margin: auto;
	padding-right: 25px;
	max-width: calc(92px * 5);
}

@media (min-width: 700px) {
	.char_list .data_list_container.grid table.data_list tbody {
		grid-template-columns: repeat(auto-fill, 146px);
		max-width: calc(146px * 5);
	}
}

@media (min-width: 1000px) {
	.char_list .data_list_container.grid table.data_list tbody {
		grid-template-columns: repeat(auto-fill, 164px);
		max-width: calc(164px * 5);
	}
}

@media (min-width: 1270px) {
	.char_list div.filter_bar {
		padding: 10px max(calc((100% - (182px * 7)) / 2), 0px);
	}
	.char_list .data_list_container.select_mode .select_mode_options .side_padding {
		margin-left: max(calc((100% - (182px * 7)) / 2), 0px);
	}
	.char_list .data_list_container.grid table.data_list thead {
		padding: 0 max(calc((100% - (182px * 7)) / 2), 0px);
	}
	.char_list .data_list_container.grid table.data_list tbody {
		grid-template-columns: repeat(auto-fill, 182px);
		max-width: calc(182px * 7);
	}
}
</style>

<script setup lang="ts">
import { Char } from "../interfaces/Asset";
import Navbar from "../components/Navbar.vue";
import { onMounted, reactive, ref, useTemplateRef } from "vue";
import { apiServer } from "../utils/AppInit";
import DataList from "../components/list/DataList.vue";
import CharListRow from "../components/list/rows/CharListRow.vue";
import { DataListRow2, FieldId, ListFieldColumn, SelectedListSort, ViewMode } from "../interfaces/DataList";
import { useNavbar } from "../composables/useNavbar";
import Dropdown from "../components/controls/Dropdown.vue";
import DropdownItem from "../components/controls/DropdownItem.vue";
import { Theme, useThemeList } from "../composables/useThemeList";
import CharRenderer from "../components/CharRenderer.vue";
import FilterBar from "../components/list/FilterBar.vue";

let categories = ref<string[]>([]);
let charInsertion = [];
const chars = ref<Char[]>();
const columns:ListFieldColumn<Char>[] = [
	{
		id: "title",
		width: ref(0)
	},
	{
		id: "index",
		width: ref(0)
	}
];
const dataList = useTemplateRef("data-list");
const isLoading = ref(false);
let themelist:Theme[] = [];
const selectedSort = ref<SelectedListSort<Char>>(
	JSON.parse(localStorage.getItem("char_list-selectedSort")) ??
		{
			id: "index",
			descending: true
		}
);

const filters = reactive({
	stock: false,
	themeI: null,
	category: null,
});

/**
 * clears the asset list array
 */
function initList() {
	chars.value = [];
}

/**
 * initializes the list by loading assets
 */
function requestCharList(stockThemeId?:string): Promise<Char[]> {
	return new Promise((res) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			let responseJson = JSON.parse(this.responseText);
			res(responseJson);
		};
		let url:string;
		if (stockThemeId) {
			url = `${apiServer}/api/theme/get_chars?id=${stockThemeId}`;
		} else {
			url = `${apiServer}/api/char/list`;
		}
		xhttp.open("GET", url, true);
		xhttp.send();
	});
}

/**
 * adds all categories from a character list
 * @param charList char list
 */
function addCategories(charList:Char[], reset = false) {
	if (reset) {
		categories.value = [];
	}
	for (const char of charList) {
		if (!char.tags) continue;
		const tags = char.tags.split(",");
		const cI = tags.findIndex(t => t.startsWith("_cat:"));
		if (cI == -1) {
			continue;
		}
		const cat = tags[cI].substring(5);
		if (categories.value.indexOf(cat) > -1) {
			continue;
		}
		categories.value.push(cat);
	}
}

/**
 * used to resort a list of entries
 * @param movie1 movie 1
 * @param movie2 movie 2
 */
function charSort(movie1:Char, movie2:Char): number {
	let mul = selectedSort.value.descending ? 1 : -1;
	const sortOption = selectedSort.value.id;
	switch (sortOption) {
		case "index": {
			return (charInsertion.indexOf(movie1.id) - 
				charInsertion.indexOf(movie2.id)) * mul;
		}
		case "title": {
			return movie1[sortOption].localeCompare(movie2[sortOption]) * mul;
		}
	}
}

/**
 * loads the char list along with the relevant navbar entries
 */
async function loadCharList() {
	initList();
	if (filters.stock == true) {
		for (const theme of themelist) {
			if (filters.stock as boolean == false) {
				// user switched stock/custom filter before loading finished
				return;
			}
			const response = await requestCharList(theme.id);
			chars.value.push(...response);
			addCategories(response);
			await (new Promise((res) => {
				setTimeout(res, 50);
			}));
		}
	} else {
		const response = await requestCharList();
		chars.value = response;
		addCategories(response, true);
	}
	charInsertion = chars.value.map(c => c.id);
	chars.value = chars.value.sort(charSort);
}

function switchUgc() {
	filters.stock = !filters.stock;
	filters.themeI = null;
	filters.category = null;
	loadCharList();
	dataList.value.updateFilter({
		folders: null,
		entries: null,
	});
}

/**
 * applies alls filters to char list
 */
function refilter() {
	if (filters.themeI === null && filters.category === null) {
		dataList.value.updateFilter({
			folders: null,
			entries: null,
		});
		return;
	}

	let filtered:string[] = [];
	for (const char of chars.value) {
		if (filters.themeI !== null && (char.themeId != themelist[filters.themeI].cc_theme_id)) {
			continue;
		}

		if (filters.category !== null) {
			if (!char.tags) continue;
			const tags = char.tags.split(",");
			const cI = tags.findIndex(t => t.startsWith("_cat:"));
			if (cI == -1) continue;
			const charCat = tags[cI].substring(5);
			if (charCat != filters.category) continue;
		}
		filtered.push(char.id);
	}

	dataList.value.updateFilter({
		folders: [],
		entries: filtered,
	});
}

/**
 * called when a theme is clicked in its filter dropdown
 * sets filter and refilters
 * @param themeId theme id
 */
function theme_click(index?:number) {
	if (typeof index === "undefined") {
		if (filters.themeI === null) {
			return;
		}
		filters.themeI = null;
	} else {
		if (filters.themeI && filters.themeI == themelist[index].id) {
			return;
		}
		filters.themeI = index;
	}

	dataList.value.updateFilter({
		folders: [],
		entries: [],
	});
	filters.category = null;
	setTimeout(refilter, 5);
}

/**
 * called when a category is clicked in its filter dropdown
 * sets filter and refilters
 * @param category category
 */
function category_click(category?:string) {
	if (filters.category == category) {
		return;
	}
	dataList.value.updateFilter({
		folders: [],
		entries: ["ALWAYS BET ON NOTHING"],
	});
	filters.category = category || null;
	setTimeout(refilter, 5);
}

/**
 * called when the user clicks a sort option
 * @param newSort sort option to switch to
 */
function dataList_sortChange(newSort:FieldId<Char>) {
	if (selectedSort.value.id == newSort) {
		selectedSort.value.descending = !selectedSort.value.descending;
	} else {
		selectedSort.value = {
			id: newSort,
			descending: true,
		};
	}
	localStorage.setItem("char_list-selectedSort", JSON.stringify(selectedSort.value));
	chars.value = chars.value.sort(charSort);
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
	isLoading.value = true;
	themelist = await useThemeList(true);
	await loadCharList();
	setTimeout(() => {
		isLoading.value = false;
	}, 80);
});

</script>

<template>
	<div>
		<Navbar
			:supported="{ download:false, save:true }"/>

		<div class="page_contents char_list">
			<CharRenderer/>

			<FilterBar>
				<button class="filter_button active" @click="switchUgc">
					<template v-if="filters.stock">
						Stock characters
					</template>
					<template v-else>
						Custom characters
					</template>
				</button>
				<Dropdown class="theme_filter">
					<template #toggle>
						<button :class="{
							filter_button: true,
							active: filters.themeI !== null
						}">
							<template v-if="filters.themeI !== null">
								<img class="icon" :src="`/img/themes/icons/${themelist[filters.themeI].id}.webp`" alt=""/>
								{{ themelist[filters.themeI].name }}
							</template>
							<template v-else>Theme</template>
						</button>
					</template>
					<DropdownItem @click="theme_click()">None</DropdownItem>
					<DropdownItem v-for="(theme, index) in themelist" @click="theme_click(index)">
						<img class="icon" :src="`/img/themes/icons/${theme.id}.webp`" alt=""/>
						{{ theme.name }}
					</DropdownItem>
				</Dropdown>
				<Dropdown>
					<template #toggle>
						<button :class="{
							filter_button: true,
							active: filters.category !== null
						}">
							<template v-if="filters.category !== null">
								{{ filters.category }}
							</template>
							<template v-else>Category</template>
						</button>
					</template>
					<DropdownItem @click="category_click()">All</DropdownItem>
					<DropdownItem v-for="cat in categories" @click="category_click(cat)">
						<!-- meoowwww -->
						{{ cat }}
					</DropdownItem>
				</Dropdown>
			</FilterBar>

			<DataList
				ref="data-list"
				:data="{ folders:[], entries:chars }"
				:is-loading="isLoading"
				:columns="columns"
				:selected-sort="selectedSort"
				:restrictions="{
					mode: ViewMode.Grid
				}"
				:row-component="CharListRow as any as DataListRow2<Char>"
				@sort-change="dataList_sortChange"
			/>
		</div>
	</div>
</template>
