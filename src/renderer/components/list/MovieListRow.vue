<style>
tr.movie td.title img {
	width: initial;
}
</style>

<script setup lang="ts" generic="T extends Movie">
import { apiServer } from "../../controllers/AppInit";
import Checkbox from "../controls/Checkbox.vue";
import type { FieldIdOf } from "../../interfaces/ListTypes";
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import { inject, Ref, useTemplateRef } from "vue";
import type { Movie } from "../../interfaces/Movie";

const emit = defineEmits<{
	entryDeselect: [],
	entrySelect: [],
}>();
const props = defineProps<{
	checked: Ref<boolean>,
	entry: T
}>();

const columns = inject(genericColumnIdKey<T>(), []);
const checkbox = useTemplateRef<HTMLInputElement>("cb");

/**
 * called when the checkbox value has been updated
 */
function checkboxUpdate() {
	const value = checkbox.value.checked;
	if (value) {
		emit("entrySelect");
	} else {
		emit("entryDeselect");
	}
}

/**
 * returns a fixed date string for a movie
 * @param entry movie object
 */
function movieInfo(field:FieldIdOf<T>): string {
	switch (field) {
		case "date": {
			const split = props.entry.date.split("T");
			const date = split[0];
			const time = split[1].substring(0, 8);
			return `${date}, ${time}`;
		}
		default: return props.entry[field].toString();
	}
}

defineExpose<{
	
}>()
</script>

<template>
	<tr class="movie" :class="{ checked }">
		<!-- :class="{
			movie: true,
			sel: (selection['movie'] || []).includes(movie.id)
		}"
		draggable="true"
		@mousedown.exact="clearSelection(); select('movie', movie.id)"
		@mousedown.ctrl="select('movie', movie.id)"
		@dragstart="onMovieDrag($event, movie.id)"> -->
		<td class="hidden">
			<!-- <Checkbox :value="checked"/> -->
			<input type="checkbox" :value="checked" @input="checkboxUpdate" ref="cb"/>
		</td>
		<td v-for="columnId in columns" :class="{ title:columnId=='title' }">
			<img
				v-if="columnId == 'title'"
				:src="`${apiServer}/file/movie/thumb/${movieInfo('id')}`"
				alt="thumbnail"/>
			<span :title="movieInfo(columnId)">{{ movieInfo(columnId) }}</span>
		</td>
		<td class="actions hidden">
			<RouterLink class="action" :to="`?redirect=/movies/play/${movieInfo('id')}`" target="_blank">
				<i class="ico play"></i>
			</RouterLink>
			<RouterLink class="action" :to="`/movies/edit/${movieInfo('id')}`">
				<i class="ico brush"></i>
			</RouterLink>
			<!-- <a href="/file/movie/file/${tbl.id}"  title="Download files -- NOT AN EXPORTER"></a> -->
			<!--<a href="javascript:;" onclick="popupExport('${tbl.id}')" title="Export"></a>-->
			<!-- <a href="javascript:;" onclick="destructive('${tbl.id}', 'delete')" title="Delete"></a> -->
		</td>
	</tr>
</template>
