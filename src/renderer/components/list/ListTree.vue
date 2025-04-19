<style lang="css">

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
list head
*s*/
thead.list_head {
	border-bottom: 1px solid hsl(240 12% 76% / 1);
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

table.list_tree tbody {
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
table.list_tree tbody tr:nth-child(2n) {
	background: hsl(257deg 14% 96.5%);
}

table.list_tree tbody tr {
	align-items: center;
	height: v-bind("zoomLevel");
}
table.list_tree tbody tr td {
	line-height: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 10px 6px;
}
/* name column */
table.list_tree tbody tr td.title {
	display: flex;
	align-items: center;
}
table.list_tree tbody tr td.title img {
	display: block;
	margin-right: 7px;
	width: calc(v-bind("zoomLevel") - 20px);
	height: calc(v-bind("zoomLevel") - 20px);
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
	background: hsl(340 95% 94% / 1);
}
table.list_tree tbody tr.sel {
	background: hsl(340 100% 70% / 1);
	color: #fff;
}


tr.folder td.title .folder_icon {
	margin-right: 7px;
	min-width: calc(calc(calc(v-bind("zoomLevel") - 20px) / 9) * 16);
	height: calc(v-bind("zoomLevel") - 20px);
}
div.folder .thumbnail_container img {
	height: calc(calc(calc(calc(calc(4 * v-bind("zoomLevel")) - 14px) / 16) * 9) - 1px);
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
	width: calc(4 * v-bind("zoomLevel"));
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
	width: calc(calc(4 * v-bind("zoomLevel")) - 14px);
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

/**
dark mode reskinning
**/
/* movie rows */
html.dark {
	border-color: hsl(246 11% 21% / 1);
}
html.dark table.list_tree tbody tr:nth-child(2n) {
	background: hsl(250 8% 17.5% / 1);
}
html.dark table.list_tree tbody tr:hover {
	background: #422b3d;
}
/* movie tiles */
html.dark div.movie {
	border-color: #2b2a37;
}
html.dark div.movie:hover {
	background: #422b3d;
	border-color: #5f3b57;
}
</style>

<script setup lang="ts" generic="ListEntry extends GenericListEntry">
import { genericColumnIdKey, zoomLevelKey } from "../../keys/listTreeKeys";
import type {
	GenericListEntry,
	ListFieldColumn,
	SelectedListSort
} from "../../interfaces/ListTypes";
import FolderIcon from "../icons/FolderIcon.vue";
import GenericListRow from "./GenericListRow.vue";
import { inject, provide, ref } from "vue";
import locale from "../../locale/en_US";
import { useRoute, useRouter } from "vue-router";
import { view } from "../../controllers/listRefs";

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
	/** id of the new entry field to sort by */
	sortChange: [string],
}>();
const props = defineProps<{
	/** list of entries and folders */
	data: ListData,
	/** list of columns to display */
	sortOptions: ListFieldColumn<ListEntry>[],
	/** id of the column to sort by */
	selectedSort: SelectedListSort<ListEntry>,
	restrictions?: {
		/** restrict supported modes */
		mode?: "list"|"grid",
	},
	/** row component to use when displaying entries */
	component: typeof GenericListRow<ListEntry>,
}>();
const modeRestriction = props?.restrictions?.mode ?? false;

const route = useRoute();
const router = useRouter();

const columns = props.sortOptions.map((v) => v.id);
const mode = modeRestriction ? modeRestriction : view;

const zoomLevel = inject(zoomLevelKey, ref("15px"));

/**
 * called when folder is clicked, navigates to it
 * @param folderId folder id
 */
function folderClicked(folderId:string) {
	router.push({
		name: route.name,
		params: {
			folderId
		}
	});
}

/**
 * called when entry field in the `thead` is clicked.
 * emits an event requesting the parent to resort the list
 * @param fieldId id of the entry field to sort by
 */
function sortOptionClicked(fieldId:string) {
	emit("sortChange", fieldId);
}

function draggerDown(id, event) {

}

provide(genericColumnIdKey<ListEntry>(), columns);

</script>

<template>
	<table class="list_tree">
		<thead class="list_head">
			<tr>
				<th class="space side_padding"></th>
				<th
					v-for="field in sortOptions" 
					:class="{
						active: selectedSort.id == field.id,
						desc: selectedSort.descending,
						sort_option: true
					}"
					:style="{
						width: mode == 'list' ? field.width.value + 'px' : '150px'
					}"
					@click.self="sortOptionClicked(field.id.toString())">
					{{ locale.list.column_name?.[field.id.toString()] ?? field.id }}
					<div v-if="mode == 'list'"
						class="dragger"
						:style="{marginLeft: field.width.value - 11 + 'px'}"
						@mousedown.stop.prevent="(e) => draggerDown(field.id, e)"></div>
				</th>
				<th class="space"></th>
			</tr>
		</thead>
		<tbody>
			<tr class="entry folder" v-for="folder in data.folders" @click="folderClicked(folder.id)">
				<td></td>
				<template v-for="columnId in columns">
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
			<component v-for="entry in data.entries" :entry="entry"/>
		</tbody>
	</table>
</template>
