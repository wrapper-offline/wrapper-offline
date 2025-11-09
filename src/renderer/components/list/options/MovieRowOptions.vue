<style src="./list_row_options.css"></style>

<script setup lang="ts" generic="T extends Movie">
import type { Movie } from "../../../interfaces/Movie";

const emit = defineEmits<{
	playClick: []
}>();
const props = defineProps<{
	entry: T | string[]
}>();

const isSingular = !Array.isArray(props.entry);

function playButton_click() {
	emit("playClick");
}
</script>

<template>
	<div class="list_row_options">
		<a
			v-show="isSingular"
			class="option"
			href="javascript:;"
			@click="playButton_click"
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
			v-if="isSingular"
			class="option"
			href="/file/movie/file/${tbl.id}"
			target="_blank"
			:download="(entry as T).title"
			title="Download project files">
			<i class="ico download"></i>
		</a>
		<a class="option" href="javascript:;" onclick="destructive('${tbl.id}', 'delete')" title="Delete">
			<i class="ico trash"></i>
		</a>
	</div>
</template>
