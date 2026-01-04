<style lang="css">

.data_list_container {
	background: repeating-linear-gradient(
		#0000 0,
		#0000 v-bind("zoomLevel.css()"),
		hsl(257deg 14% 96.5%) v-bind("zoomLevel.css()"),
		hsl(257deg 14% 96.5%) calc(v-bind("zoomLevel.css()") * 2)
	) 0 36px;
	overflow-x: auto;
	min-height: 100%;
}

/***
list view
***/

table.data_list {
	border-collapse: collapse;
	border-spacing: 0;
	table-layout: fixed;
	width: 100%;
}


/**
select mode
**/
.select_mode_options {
	background-color: hsl(252deg 16% 94%);
	opacity: 0;
	pointer-events: none;
	transition: none;
	transform: translateX(-15px);
	display: flex;
	height: 0;
}
.select_mode_options .side_padding {
	margin-right: 6px;
	padding: 1px 6px;
}
.data_list_container.select_mode table.data_list {
	margin-top: -2px;
}
.data_list_container.select_mode thead.list_head {
	border: none;
	visibility: hidden;
}
.data_list_container.select_mode thead.list_head .sort_option {
	line-height: 0;
	padding: 0 6px;
}
.data_list_container.select_mode .select_mode_options {
	opacity: 1;
	pointer-events: all;
	padding: 5px 0;
	transition: transform 0.1s var(--slide-anim);
	transform: none;
	position: relative;
	width: 100%;
	height: 35px;
}
.data_list_container.select_mode .select_mode_options::after {
	content: "";
	height: 1px;
	width: 100%;
	display: block;
	background-color: hsl(240 12% 76% / 1);
	position: absolute;
    margin-top: 30px;
}


/**
list head
**/

thead.list_head {
	background-color: hsl(252deg 16% 94%);
	border-bottom: 1px solid hsl(240 12% 76% / 1);
	top: 0;
}
thead.list_head th {
	border-color: #bfbeca;
	top: 0;
}
thead.list_head .space.side_padding {
	border: none;
	width: 25px;
}
thead.list_head .sort_option {
	color: hsl(218deg 14% 24%);
	border-radius: 4px 4px 0 0;
	transition: background 0.2s var(--button-anim);
	font-weight: normal;
	text-align: left;
	line-height: 15px;
	padding: 10px 6px;
}
thead.list_head .sort_option.active {
	font-weight: bold;
}
thead.list_head .sort_option.active::after {
	content: "🞃";
	opacity: 0.7;
	float: right;
	transform: translate(-2px, 0);
}
thead.list_head .sort_option.active.desc::after {
	transform: translate(-2px, 0) rotate(180deg);
}
thead.list_head .sort_option:hover {
	background: hsl(338deg 55% 91%);
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


/***
list view
***/

table.data_list tbody {
	transition: 0.08s var(--slide-anim);
	height: 100%;
}
table.data_list tbody::after {
	content: "";
	display: block;
	height: 30px;
}

/**
movie row
**/
table.data_list tbody tr {
	align-items: center;
	height: v-bind("zoomLevel.css()");
}
table.data_list tbody tr td {
	line-height: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 10px 6px;
}
table.data_list tbody tr td.hidden {
	opacity: 0;
}
/* name column */
table.data_list tbody tr td.title {
	display: flex;
	align-items: center;
}
table.data_list tbody tr td.title img {
	display: block;
	margin-right: 7px;
	width: calc(v-bind("zoomLevel.css()") - 20px);
	height: calc(v-bind("zoomLevel.css()") - 20px);
}
/* title text */
table.data_list tbody tr td.title span {
	overflow: hidden;
	text-overflow: ellipsis;
	display: block;
}
table.data_list tbody tr:first-of-type td:first-of-type {
	overflow: hidden;
}
table.data_list tbody tr:hover {
	background: hsl(338deg 55% 91%);
}
table.data_list tbody tr.checked {
	background: hsl(344 80% 50% / 0.55);
	color: #fff;
}
table.data_list tbody tr:hover td.hidden,
table.data_list tbody tr.checked td.hidden {
	opacity: 1;
}
.multiselect table.data_list tbody tr td.actions.hidden {
	opacity: 0;
}

/* tr.folder td.title .folder_icon {
	margin-right: 7px;
	min-width: calc(calc(calc(v-bind("zoomLevel.css()") - 20px) / 9) * 16);
	height: calc(v-bind("zoomLevel.css()") - 20px);
}
div.folder .thumbnail_container img {
	height: calc(calc(calc(calc(calc(4 * v-bind("zoomLevel.css()")) - 14px) / 16) * 9) - 1px);
} */

/* loading */
.data_list_container.load_state tbody {
	transition: none;
	transform: translateX(-40px);
	opacity: 0;
}


/***
grid view
***/
.data_list_container.grid {
	background: #0000;
}
.data_list_container.grid .select_mode_options .side_padding  {
	margin-left: max(0px, calc((100% - (38 * v-bind("zoomLevel.css()"))) / 2));
}
.data_list_container.grid table.data_list {
	display: block;
}
.data_list_container.grid table.data_list thead.list_head {
	padding: 0 max(0px, calc((100% - (38 * v-bind("zoomLevel.css()"))) / 2));
	display: block;
}
.data_list_container.grid table.data_list tbody {
	display: grid;
	grid-template-columns: repeat(auto-fill, calc(4 * v-bind("zoomLevel.css()")));
	column-gap: 25px;
	justify-content: space-evenly;
	margin: 0 auto;
	padding: 20px 25px 0;
	/* only allow 8 columns on the smallest possible size */
	max-width: calc(38 * v-bind("zoomLevel.css()"));
}
/* entry */
.data_list_container.grid table.data_list tbody div.dl_cell {
	border: 1px solid hsl(240 12% 76% / 1);
	border-radius: 6px;
	transition: width 0.2s var(--button-anim);
	align-items: start;
	display: inline-flex;
	flex-direction: column;
	margin: 0 0 20px;
	width: calc(4 * v-bind("zoomLevel.css()"));
}
.data_list_container.grid table.data_list tbody div.dl_cell img {
	border-radius: 5.5px 5.5px 0 0;
	transition: filter 0.2s var(--button-anim);
	margin: 0;
	width: 100%;
	height: auto;
}
.data_list_container.grid table.data_list tbody div.dl_cell span.duration {
	background: #000a;
	color: #fff;
	border-radius: 3px;
	letter-spacing: 0.5px;
	font-size: 12px;
	margin: -20px 0 0;
	padding: 0 4px;
	position: relative;
	top: -5px;
	left: 4px;
}
.data_list_container.grid table.data_list tbody div.dl_cell div.actions {
	background: #000c;
	border-radius: 16px;
	display: none;
	margin: -33px auto 0;
	padding: 4px 13px 2px 3px;
	position: relative;
	top: calc(
		14px - 
		((
			(9 / 16) * ((4 * v-bind("zoomLevel.css()")) - 8px)
		) / 2)
	);
}
.data_list_container.grid table.data_list tbody div.dl_cell div.actions a {
	color: #fff;
}
.data_list_container.grid table.data_list tbody div.dl_cell div.data {
	border-top: 1px solid hsl(240 12% 76% / 1);
	padding: 4px 8px 9px;
	width: 100%;
}
.data_list_container.grid table.data_list tbody div.dl_cell div.data span {
	display: block;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}
.data_list_container.grid table.data_list tbody div.dl_cell div.data span:nth-child(1) {
	font-weight: bold;
}
.data_list_container.grid table.data_list tbody div.dl_cell div.data span:nth-child(2) {
	opacity: 0.8;
	line-height: 18px;
}

.data_list_container.grid table.data_list tbody div.dl_cell:hover {
	background-color: hsl(338deg 55% 85%);
	border-color: hsl(338deg 55% 77%);
}
.data_list_container.grid table.data_list tbody div.dl_cell:hover img {
	filter: brightness(0.5)
}
.data_list_container.grid table.data_list tbody div.dl_cell:hover div.actions {
	display: block;
}
.data_list_container.grid table.data_list tbody div.dl_cell:hover div.data {
	border-color: hsl(338deg 55% 77%);
}

.data_list_container.grid table.data_list tbody div.dl_cell.checked {
	background-color: hsl(344 80% 50% / 0.55);
	border-color: hsl(344deg 97% 65%);
}
.data_list_container.grid table.data_list tbody div.dl_cell.checked div.data {
	border-color: hsl(344deg 97% 65%);
	color: #fff;
}

.data_list_container.grid.select_mode table.data_list {
	margin-top: -1px;
}


/**
dark mode reskinning
**/
/* list mode */
html.dark .data_list_container:not(.grid) {
	background: repeating-linear-gradient(
		#0000 0,
		#0000 v-bind("zoomLevel.css()"),
		hsl(250 8% 17.5% / 1) v-bind("zoomLevel.css()"),
		hsl(250 8% 17.5% / 1) calc(v-bind("zoomLevel.css()") * 2)
	) 0 36px;
}
html.dark .select_mode_options {
	background-color: hsl(250 9% 16% / 1);
}
html.dark .data_list_container.select_mode .select_mode_options::after {
	background-color: hsl(250 9% 24% / 1);
}
html.dark thead.list_head {
	background-color: hsl(250 9% 16% / 1);
	border-color: hsl(250 9% 24% / 1);
}
html.dark thead.list_head th {
	border-color: #32313f;
}
html.dark thead.list_head .sort_option {
	color: hsl(0deg 0% 92%);
}
html.dark thead.list_head .sort_option:hover,
html.dark table.data_list tbody tr:hover {
	background: hsl(330 26% 21% / 1);
}
html.dark table.data_list tbody tr.checked {
	background: hsl(342 47% 40% / 0.45);
}
/* grid mode */
html.dark .data_list_container.grid table.data_list tbody div.dl_cell,
html.dark .data_list_container.grid table.data_list tbody div.dl_cell div.data {
	border-color: hsl(250 9% 24% / 1);
}
html.dark .data_list_container.grid table.data_list tbody div.dl_cell:hover {
	background-color: hsl(330 26% 26% / 1);
	border-color: hsl(330 26% 41% / 1);
}
html.dark .data_list_container.grid table.data_list tbody div.dl_cell:hover div.data {
	border-color: hsl(330 26% 41% / 1);
}
html.dark .data_list_container.grid table.data_list tbody div.dl_cell.checked {
	background: hsl(342 47% 40% / 0.45);
	border-color: hsl(342deg 55% 48%);
}
html.dark .data_list_container.grid table.data_list tbody div.dl_cell.checked div.data {
	border-color: hsl(342deg 55% 48%);
}
</style>

<script setup lang="ts" generic="Entry extends DataListEntry,
	Row extends DataListRow2<Entry>">
import { genericColumnIdKey, modeKey } from "../../keys/listTreeKeys";
import {
	type DataListRow2,
	type FieldId,
	type DataListEntry,
	type ListFieldColumn,
	type SelectedListSort,
	ViewMode
} from "../../interfaces/DataList";
import FolderIcon from "../icons/FolderIcon.vue";
import locale from "../../locale/en_US";
import { onMounted, onUnmounted, provide, reactive, ref, toValue, useTemplateRef, watch } from "vue";
import useListStore from "../../composables/useListStore";
import { useRoute, useRouter } from "vue-router";
import { useScreenWidth } from "../../composables/useScreenWidth";

interface Folder {
	id: string,
	title: string,
	color: string,
	parent_id: string,
};
interface ListData {
	folders: Folder[],
	entries: Entry[],
};

const emit = defineEmits<{
	/** emitted when a column has been resized. [id, new width] */
	columnResize: [string, number],
	/** id of the new entry field to sort by */
	sortChange: [string],
}>();
const props = defineProps<{
	/** list of entries and folders */
	data: ListData,
	/** is the list being loaded */
	isLoading?: boolean,
	/** list of columns to display */
	columns: ListFieldColumn<Entry>[],
	/** id of the column to sort by */
	selectedSort: SelectedListSort<Entry>,
	restrictions?: {
		/** restrict supported view modes */
		mode?: ViewMode,
	},
	/** row component to use when displaying entries */
	rowComponent: Row,
}>();

const modeRestriction = props.restrictions?.mode === null ? false : props.restrictions?.mode;
const route = useRoute();
const router = useRouter();
const screenWidth = useScreenWidth();
const { search, viewMode: viewMode2, zoomLevel } = useListStore();

const columnIds = props.columns.map((v) => v.id);
const selectAllBox = useTemplateRef("select-all-box")
const selection = ref<{
	anchor: number,
	entries: string[]
}>({
	anchor: 0,
	entries: []
});
/** list of ids to display filtered by the current search box input */
const filteredEntryIds:{
	folders: string[] | null,
	entries: string[] | null,
} = reactive({
	folders: null,
	entries: null,
});
const listRows = useTemplateRef("list-row");
/** current view mode */
const mode = () => modeRestriction ? modeRestriction : viewMode2.value;

/**
 * filters entries or folders by name
 * @param v entry or folder to check
 * @param shouldContain string to check for
 * @param resultArray array containing resulting ids
 */
function dataFilterFunc(v:Folder|Entry, shouldContain:string, resultArray:string[]) {
	if (v.title.toLowerCase().includes(shouldContain)) {
		resultArray.push(v.id);
	}
}

/**
 * syncs the select all box state with the current selection
 */
function syncSelectAllBox() {
	const allSelected = selection.value.entries.length ==
		props.data.entries.length;
	selectAllBox.value.checked = allSelected;
}

/**
 * resets list of selected entries
 */
function resetSelection() {
	selection.value.anchor = 0;
	selection.value.entries = [];
	syncSelectAllBox();
}

/**
 * updates filtered entries
 */
function updateFilter(newFiltered: {
	folders: string[] | null,
	entries: string[] | null,
}) {
	filteredEntryIds.folders = newFiltered.folders;
	filteredEntryIds.entries = newFiltered.entries;
}

/**
 * called when entry field in the `thead` is clicked.
 * emits an event requesting the parent to resort the list
 * @param fieldId id of the entry field to sort by
 */
function sortOption_click(fieldId:string) {
	emit("sortChange", fieldId);
}

/**
 * called when the user resizes a movie list column
 * @param id sort option id
 * @param e mouse event
 */
function dragger_down(id:FieldId<Entry>, e:MouseEvent) {
	document.body.classList.add("col_resize");
	const option = props.columns.find(v => v.id == id);
	const startX = e.clientX;
	const startWidth = toValue(option.width);
	const moveCb = (moveE2:MouseEvent) => {
		let dx = moveE2.clientX - startX;
		if (screenWidth.value > 1200) {
			dx = ~~(dx / (screenWidth.value / 1000));
		}
		let newWidth = startWidth + dx;
		newWidth = Math.max(startWidth + dx, 95);
		newWidth = Math.min(newWidth, 400);
		option.width.value = newWidth;
	};
	window.addEventListener("mousemove", moveCb);
	window.addEventListener("mouseup", () => {
		window.removeEventListener("mousemove", moveCb);
		document.body.classList.remove("col_resize");
		emit("columnResize", id.toString(), option.width.value);
	});
}

function selectAll_click() {
	const equal = props.data.entries.length == selection.value.entries.length;
	const allSelected = equal && props.data.entries.length > 0;
	if (allSelected) {
		resetSelection();
	} else {
		selection.value.entries = props.data.entries.map(v => v.id);
	}
}

/**
 * called when folder is clicked, navigates to it
 * @param folderId folder id
 */
function folder_click(folderId:string) {
	router.push({
		name: route.name,
		params: {
			folderId
		}
	});
}

/**
 * called when a movie is deleted, removes it from list
 * @param ids movie ids
 */
function entry_delete(ids:string[]) {
	for (const id of ids) {
		const index = props.data.entries.findIndex((v) => v.id == id);
		props.data.entries.splice(index, 1);
	}
}

/**
 * called when a list entry has been clicked on
 * clears previous selection and selects the entry
 * @param id entry id
 */
function entry_click(id:string) {
	selection.value.entries = [id];
	selection.value.anchor = 0;
	syncSelectAllBox();
}

/**
 * called when a list entry has been ctrl + clicked
 * @param id entry id
 */
function entry_ctrlClick(id:string) {
	const oI = selection.value.entries.indexOf(id);
	if (oI > -1) { // already selected
		selection.value.entries.splice(oI, 1);
		if (oI - 1 < selection.value.entries.length - 1) {
			selection.value.anchor = 0;
		} else {
			selection.value.anchor = oI - 1;
		}
	} else {
		selection.value.entries.push(id);
		selection.value.anchor = selection.value.entries.length - 1;
	}
	syncSelectAllBox();
}

/**
 * called when a list entry has been double clicked on
 * clears selection
 */
function entry_dblClick() {
	resetSelection();
}

/**
 * called when a list entry has been selected as shift is held
 * selects anything between the entry and first selection
 * @param id entry id
 */
function entry_shiftClick(id:string) {
	const anchoredId = selection.value.entries[selection.value.anchor];
	if (typeof anchoredId == "undefined") { // nothing is selected
		selection.value.entries = [id];
		selection.value.anchor = 0;
		syncSelectAllBox();
		return;
	}
	selection.value.entries = [anchoredId];
	selection.value.anchor = 0;
	const indicies = [
		listRows.value.findIndex(e => e.id == anchoredId),
		listRows.value.findIndex(e => e.id == id)
	].sort((a, b) => a - b);
	for (let i = indicies[0]; i <= indicies[1]; i++) {
		const id = listRows.value[i].id;
		if (id == anchoredId) continue;
		selection.value.entries.push(id);
	}
	syncSelectAllBox();
}

/**
 * called on keydown, checks for ctrl a
 * selects all
 * @param e keyboard event
 */
function ctrlADown(e:KeyboardEvent) {
	if (!e.ctrlKey || e.key != "a") {
		return;
	}
	e.preventDefault();
	e.stopPropagation();
	selection.value.entries = listRows.value.map(e => e.id);
	selection.value.anchor = 0;
	syncSelectAllBox();
}

provide(genericColumnIdKey<Entry>(), columnIds);
provide(modeKey, mode);

watch(() => search.value, (newSearch:string) => {
	if (newSearch.length == 0) {
		filteredEntryIds.entries = null;
		filteredEntryIds.folders = null;
	}
	resetSelection();
	filteredEntryIds.entries = [];
	filteredEntryIds.folders = [];
	props.data.entries.forEach((v) => dataFilterFunc(v, newSearch, filteredEntryIds.entries));
	props.data.folders.forEach((v) => dataFilterFunc(v, newSearch, filteredEntryIds.folders));
});
onMounted(() => {
	document.addEventListener("keydown", ctrlADown);
});
onUnmounted(() => {
	document.removeEventListener("keydown", ctrlADown);
});

defineExpose({ resetSelection, updateFilter });

</script>

<template>
	<div :class="{
		data_list_container: true,
		load_state: isLoading,
		grid: mode() == ViewMode.Grid,
		multiselect: selection.entries.length > 1,
		select_mode: selection.entries.length > 0
	}" @click.self="resetSelection">
		<div class="select_mode_options">
			<div class="side_padding">
				<input
					ref="select-all-box"
					type="checkbox"
					:value="selection.entries.length == data.entries.length && 
						data.entries.length > 0"
					@input="selectAll_click"/>
			</div>
			{{ selection.entries.length }} selected
			<component
				:is="rowComponent.optionsComponent"
				:entry="selection.entries"
				@entry-delete="entry_delete"/>
		</div>
		<table class="data_list">
			<thead class="list_head">
				<tr>
					<th class="space side_padding"></th>
					<th
						v-for="field in columns" 
						:class="{
							active: selectedSort.id == field.id,
							desc: selectedSort.descending,
							sort_option: true
						}"
						:style="{
							width: mode() == ViewMode.List ? 
								(screenWidth > 1200 ? 
									field.width.value * screenWidth / 1000 : 
									field.width.value) + 'px' : 
								'150px'
						}"
						@click.self="sortOption_click(field.id.toString())">
						{{ locale.list.column_name?.[field.id.toString()] ?? field.id }}
						<div v-if="mode() == ViewMode.List"
							class="dragger"
							:style="{marginLeft: (screenWidth > 1200 ? 
									field.width.value * screenWidth / 1000 : 
									field.width.value) - 9 + 'px'}"
							@mousedown.stop.prevent="(e) => dragger_down(field.id, e)"></div>
					</th>
					<th class="space"></th>
				</tr>
			</thead>
			<tbody>
				<template v-for="folder in data.folders">
					<tr
						v-if="filteredEntryIds.folders === null ? true : filteredEntryIds.folders.includes(folder.id)"
						class="entry folder"
						@click="folder_click(folder.id)">
						<td></td>
						<template v-for="columnId in columnIds">
							<td v-if="columnId == 'title'" class="title">
								<FolderIcon :color="folder.color"/>
								<span>
									{{ folder.title }}
								</span>
							</td>
							<td v-else></td>
						</template>
						<td></td>
					</tr>
				</template>
				<!-- list entries -->
				<template v-for="entry in data.entries">
					<component
						:is="rowComponent"
						:key="entry.id"
						v-if="filteredEntryIds.entries === null ? true : filteredEntryIds.entries.includes(entry.id)"
						ref="list-row"
						:checked="selection.entries.includes(entry.id)"
						:entry="entry"
						@entry-delete="entry_delete([ entry.id ])"
						@entry-click="entry_click(entry.id)"
						@entry-ctrl-click="entry_ctrlClick(entry.id)"
						@entry-dbl-click="entry_dblClick()"
						@entry-shift-click="entry_shiftClick(entry.id)"/>
				</template>
			</tbody>
		</table>
	</div>
</template>
