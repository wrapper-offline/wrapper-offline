<style lang="css">

.list_tree_container {
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

table.list_tree {
	border-collapse: collapse;
	border-spacing: 0;
	table-layout: fixed;
	width: 100%;
}


/**
select mode
**/
.select_mode_options {
	background-color: #eeedf2;
	opacity: 0;
	transition: none;
	transform: translateX(-15px);
	display: flex;
	height: 0;
}
.select_mode_options .side_padding {
	margin-right: 6px;
	padding: 1px 6px;
}
.list_tree_container.select_mode thead.list_head {
	border: none;
	visibility: hidden;
}
.list_tree_container.select_mode thead.list_head .sort_option {
	line-height: 0;
	padding: 0 6px;
}
.list_tree_container.select_mode .select_mode_options {
	opacity: 1;
	padding: 5px 0;
	transition: transform 0.1s var(--slide-anim);
	transform: none;
	height: 33px;
}
.list_tree_container.select_mode .select_mode_options::after {
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
	background-color: #eeedf2;
	border-bottom: 1px solid hsl(240 12% 76% / 1);
	top: 0;
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
	color: hsl(218deg 14% 24%);
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

table.list_tree tbody {
	transition: 0.08s var(--slide-anim);
	height: 100%;
}


/***
grid view
***/

.movie_grid {
	margin-top: 10px;
	padding-left: 25px;
}

/**
movie row
**/
table.list_tree tbody tr {
	align-items: center;
	height: v-bind("zoomLevel.css()");
}
table.list_tree tbody tr td {
	line-height: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 10px 6px;
}
table.list_tree tbody tr td.hidden {
	opacity: 0;
}
/* name column */
table.list_tree tbody tr td.title {
	display: flex;
	align-items: center;
}
table.list_tree tbody tr td.title img {
	display: block;
	margin-right: 7px;
	width: calc(v-bind("zoomLevel.css()") - 20px);
	height: calc(v-bind("zoomLevel.css()") - 20px);
}
/* title text */
table.list_tree tbody tr td.title span {
	overflow: hidden;
	text-overflow: ellipsis;
	display: block;
}
table.list_tree tbody tr:first-of-type td:first-of-type {
	overflow: hidden;
}
table.list_tree tbody tr:hover {
	background: hsl(338deg 55% 91%);
}
table.list_tree tbody tr.checked {
	background: hsl(344 80% 50% / 0.55);
	color: #fff;
}
table.list_tree tbody tr:hover td.hidden,
table.list_tree tbody tr.checked td.hidden {
	opacity: 1;
}
.multiselect table.list_tree tbody tr td.actions.hidden {
	opacity: 0;
}


tr.folder td.title .folder_icon {
	margin-right: 7px;
	min-width: calc(calc(calc(v-bind("zoomLevel.css()") - 20px) / 9) * 16);
	height: calc(v-bind("zoomLevel.css()") - 20px);
}
div.folder .thumbnail_container img {
	height: calc(calc(calc(calc(calc(4 * v-bind("zoomLevel.css()")) - 14px) / 16) * 9) - 1px);
}



/**
movie tile
**/
div.movie {
	border: 1px solid #c8c5dc;
	border-radius: 3px;
	transition: 0.2s var(--button-anim);
	display: inline-flex;
	flex-direction: column;
	margin: 0 5px 10px;
	padding: 6px 7px;
	width: calc(4 * v-bind("zoomLevel.css()"));
}
div.movie .thumbnail_container img {
	pointer-events: none;
	width: 100%;
}
div.movie .thumbnail_container .duration {
	background: #0007;
	color: #fff;
	border-radius: 2px;
	position: absolute;
	margin-top: -36px;
	margin-left: 5px;
	padding: 0 4px;
}
div.movie .title {
	font-weight: bold;
	line-height: 17px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	display: block;
	margin-bottom: 2px;
	width: calc(calc(4 * v-bind("zoomLevel.css()")) - 14px);
}
div.movie .modified {
	font-size: 13px;
}
div.movie .actions {
	margin-top: 3px;
	text-align: center;
}
div.movie:hover {
	background: #ffebf9;
	border-color: #e2a5bd;
	box-shadow: 0 2px 4px #00000010;
	transition: none;
}

.list_tree_container.load_state tbody {
	transition: none;
	transform: translateX(-40px);
	opacity: 0;
}

/**
dark mode reskinning
**/
/* list mode */
html.dark .list_tree_container {
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
html.dark .list_tree_container.select_mode .select_mode_options::after {
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
html.dark table.list_tree tbody tr:hover {
	background: hsl(330 26% 21% / 1);
}
html.dark table.list_tree tbody tr.checked {
	background: hsl(342 47% 40% / 0.45);
}
/* grid mode */
html.dark div.movie {
	border-color: #2b2a37;
}
html.dark div.movie:hover {
	background: #422b3d;
	border-color: #5f3b57;
}
</style>

<script setup lang="ts" generic="ListEntry extends GenericListEntry,
	ListRow extends (typeof GenericListRow<ListEntry>),
	RowOptions extends (typeof GenericRowOptions<ListEntry>)">
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import type {
	FieldIdOf,
	GenericListEntry,
	ListFieldColumn,
	SelectedListSort
} from "../../interfaces/ListTypes";
import FolderIcon from "../icons/FolderIcon.vue";
import GenericListRow from "./GenericListRow.vue";
import GenericRowOptions from "./options/GenericRowOptions.vue";
import locale from "../../locale/en_US";
import { onMounted, onUnmounted, provide, ref, toValue, useTemplateRef, watch } from "vue";
import useListStore from "../../composables/useListStore";
import { useRoute, useRouter } from "vue-router";

interface Folder {
	id: string,
	title: string,
	color: string,
	parent_id: string,
};
interface ListData {
	folders: Folder[],
	entries: ListEntry[],
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
	/** list of columns to display */
	columns: ListFieldColumn<ListEntry>[],
	/** id of the column to sort by */
	selectedSort: SelectedListSort<ListEntry>,
	restrictions?: {
		/** restrict supported view modes */
		mode?: "list" | "grid",
	},
	/** row component to use when displaying entries */
	rowComponent: ListRow,
	/** component to use for row options */
	rowOptionsComponent: RowOptions,
}>();
const modeRestriction = props?.restrictions?.mode ?? false;
const route = useRoute();
const router = useRouter();
const { search, viewMode, zoomLevel } = useListStore();

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
	folders: string[],
	entries: string[],
} = {
	folders: [],
	entries: [],
};
const listRows = useTemplateRef("list-row");
/** current view mode */
const mode = modeRestriction ? modeRestriction : viewMode.value;

/**
 * filters entries or folders by name
 * @param v entry or folder to check
 * @param shouldContain string to check for
 * @param resultArray array containing resulting ids
 */
function dataFilterFunc(v:Folder|ListEntry, shouldContain:string, resultArray:string[]) {
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
function dragger_down(id:FieldIdOf<ListEntry>, e:MouseEvent) {
	document.body.classList.add("col_resize");
	const option = props.columns.find(v => v.id == id);
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
 * @param id movie id
 */
function entry_delete(id:string) {
	const index = props.data.entries.findIndex((v) => v.id == id);
	props.data.entries.splice(index, 1);
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
	selection.value.entries = listRows.value.map(e => e.id);
	selection.value.anchor = 0;
	syncSelectAllBox();
}

provide(genericColumnIdKey<ListEntry>(), columnIds);

watch(() => search.value, (newSearch:string) => {
	// clear selection
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

defineExpose({ resetSelection });

</script>

<template>
	<div :class="{
		list_tree_container: true,
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
			<rowOptionsComponent :entry="selection.entries"/>
		</div>
		<table class="list_tree">
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
							width: mode == 'list' ? field.width.value + 'px' : '150px'
						}"
						@click.self="sortOption_click(field.id.toString())">
						{{ locale.list.column_name?.[field.id.toString()] ?? field.id }}
						<div v-if="mode == 'list'"
							class="dragger"
							:style="{marginLeft: field.width.value - 11 + 'px'}"
							@mousedown.stop.prevent="(e) => dragger_down(field.id, e)"></div>
					</th>
					<th class="space"></th>
				</tr>
			</thead>
			<tbody>
				<template v-for="folder in data.folders">
					<tr
						v-if="search.value.length > 0 ? filteredEntryIds.folders.includes(folder.id) : true"
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
					<rowComponent
						v-if="search.value.length > 0 ? filteredEntryIds.entries.includes(entry.id) : true"
						ref="list-row"
						:checked="selection.entries.includes(entry.id)"
						:entry="entry"
						@entry-delete="entry_delete"
						@entry-click="entry_click(entry.id)"
						@entry-ctrl-click="entry_ctrlClick(entry.id)"
						@entry-dbl-click="entry_dblClick()"
						@entry-shift-click="entry_shiftClick(entry.id)"/>
				</template>
			</tbody>
		</table>
	</div>
</template>
