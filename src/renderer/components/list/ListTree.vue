<style lang="css">
/**
movie row
**/
tbody#list_body tr:nth-child(2n) {
	background: hsl(257deg 14% 96.5%);
}

tbody#list_body tr {
	align-items: center;
	height: v-bind("zoomLevel");
}
tbody#list_body tr td {
	line-height: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 10px 6px;
}
/* name column */
tbody#list_body tr td.title {
	display: flex;
	align-items: center;
}
tbody#list_body tr td.title img {
	display: block;
	margin-right: 7px;
	width: auto;
	height: calc(v-bind("zoomLevel") - 20px);
}
/* title text */
tbody#list_body tr td.title span {
	overflow: hidden;
	text-overflow: ellipsis;
	display: block;
}
tbody#list_body tr:first-of-type td:first-of-type {
	overflow: hidden;
}
tbody#list_body tr:hover {
	background: hsl(340 95% 94% / 1);
}
tbody#list_body tr.sel {
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
html.dark td:first-of-type::before,
html.dark td:first-of-type::after {
	border-color: hsl(246 11% 29% / 1);
}
html.dark tr.movie:nth-child(2n) {
	background: hsl(246 11% 14% / 1);
}
html.dark tr.movie:hover {
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

<script setup lang="ts" generic="T extends EntryBase">
import { genericColumnIdKey, zoomLevelKey } from "../../keys/listTreeKeys";
import type { EntryBase, FieldIdOf, SelectedListSort } from "../../interfaces/ListTypes";
import FolderIcon from "../icons/FolderIcon.vue";
import GenericEntryRenderer from "./GenericEntryRenderer.vue";
import { inject, provide, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

interface Folder {
	id: string,
	title: string,
	color: string,
	parent_id: string,
};
interface ListData {
	folders: Folder[],
	entries: T[],
};

const props = defineProps<{
	data: ListData,
	columns: FieldIdOf<T>[],
	renderer: typeof GenericEntryRenderer<T>,
	selectedSort: SelectedListSort<T>,
}>();

const route = useRoute();
const router = useRouter();

provide(genericColumnIdKey<T>(), props.columns);
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

</script>

<template>
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
	<renderer v-for="entry in data.entries" :entry="entry"/>
</template>
