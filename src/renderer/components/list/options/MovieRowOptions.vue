<style src="./list_row_options.css"></style>

<script setup lang="ts" generic="T extends Movie">
import { apiServer } from "../../../utils/AppInit";
import type { Movie } from "../../../interfaces/Movie";
import openPlayerWindow from "../../../utils/openPlayerWindow";
import en_US from "../../../locale/en_US";

const emit = defineEmits<{
	entryDelete: [string[]]
}>();
const props = defineProps<{
	entry: T | string[]
}>();

const isSingular = !Array.isArray(props.entry);

/**
 * called when play button is clicked
 */
function playBtn_click() {
	openPlayerWindow((props.entry as Movie).id);
}

/**
 * called when delete button is clicked
 */
async function deleteBtn_click() {
	const msg = isSingular ?
		en_US.list.actions.movie_delete_confirm.sing :
		en_US.list.actions.movie_delete_confirm.plr;
	if (!confirm(msg)) {
		return;	
	}

	const idField = Array.isArray(props.entry) ?
		props.entry.join(",") :
		props.entry.id;
	const body = new FormData();
	body.append("id", idField);
	const res = await fetch(apiServer + "/api/movie/delete", {
		method: "POST",
		body
	});
	if (!res.ok) {
		alert("Failed to delete movie");
		return;
	}
	emit("entryDelete", idField.split(","));
}

/**
 * returns array of entry ids
 */
function idsAsArray() {
	return Array.isArray(props.entry) ?
		props.entry :
		[ props.entry.id ];
}
</script>

<template>
	<div class="list_row_options">
		<a
			v-show="isSingular"
			class="option"
			href="javascript:;"
			@click="playBtn_click"
			title="Play">
			<i class="ico play"></i>
		</a>
		<RouterLink
			v-show="isSingular"
			class="option"
			:to="`/movies/edit/${(entry as T).id}`"
			title="Edit">
			<i class="ico brush"></i>
		</RouterLink>
		<a
			class="option"
			:href="`${apiServer}/file/movie/file/${idsAsArray().join(',')}`"
			download="download.zip"
			title="Download project files">
			<i class="ico download"></i>
		</a>
		<a class="option" href="javascript:;" @click="deleteBtn_click" title="Delete">
			<i class="ico trash"></i>
		</a>
	</div>
</template>
