<style>
tr.movie td.title img {
	width: initial;
}
</style>

<script lang="ts">
export default {
	optionsComponent: MovieListOptions
};
</script>

<script setup lang="ts" generic="MovieEntry extends Movie">
import { apiServer } from "../../../utils/AppInit";
import { ViewMode, type FieldId } from "../../../interfaces/DataList";
import { genericColumnIdKey, modeKey } from "../../../keys/listTreeKeys";
import { inject } from "vue";
import type { Movie } from "../../../interfaces/Movie";
import MovieListOptions from "../options/MovieListOptions.vue";
import openPlayerWindow from "../../../utils/openPlayerWindow";
import useLocalSettings from "../../../composables/useLocalSettings";
import { useRouter } from "vue-router";

const emit = defineEmits<{
	entryDelete: [],
	entryClick: [],
	entryCtrlClick: [],
	entryDblClick: [],
	entryShiftClick: [],
}>();
const props = defineProps<{
	checked: boolean,
	entry: MovieEntry
}>();
defineExpose({ id:props.entry.id });

const columns = inject(genericColumnIdKey<MovieEntry>(), []);
const localSettings = useLocalSettings();
const router = useRouter();

/**
 * called when the entry element is clicked, emits event to parent
 */
function entryElem_click() {
	emit("entryClick");
}

/**
 * called when the entry element is clicked and ctrl is held down
 * flips selection state and emits event
 */
function entryElem_ctrlClick() {
	emit("entryCtrlClick");
}

/**
 * called when the entry element is clicked
 * does user action and emits event
 */
function entryElem_dblClick() {
	switch (localSettings.onMovieDclick) {
		case "edit": {
			router.push(`/movies/edit/${props.entry.id}`);
			break;
		}
		case "play": {
			openPlayerWindow(props.entry.id);
			break;
		}
		case "none":
		default:
			break;
	}
	emit("entryDblClick");
}

/**
 * called when the entry element is clicked as shift is held down
 * flips selection state and emits event
 */
function entryElem_shiftClick() {
	emit("entryShiftClick");
}

/**
 * called when the entry has been deleted
 */
function deleteBtn_click() {
	emit("entryDelete");
}

/**
 * returns a fixed date string for a movie
 * @param entry movie object
 */
function movieInfo(field:FieldId<MovieEntry>): string {
	switch (field) {
		case "index": {}
		case "date": {
			const split = props.entry.date.split("T");
			const date = split[0];
			const time = split[1].substring(0, 8);
			return `${date}, ${time}`;
		}
		default: return props.entry[field].toString();
	}
}

const mode = inject(modeKey);
</script>

<template>
	<div v-if="mode() == ViewMode.Grid"
		:class="{
			checked,
			dl_cell: true,
			movie: true
		}"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click"
	>
			<img
				:src="`${apiServer}/file/movie/thumb/${movieInfo('id')}`"
				alt="thumbnail"/>
			<span class="duration">{{ movieInfo('duration') }}</span>
			<div class="actions hidden">
				<MovieListOptions :entry="entry" @entry-delete="deleteBtn_click"/>
			</div>
			<div class="data">
				<span :title="movieInfo('title')" v-html="movieInfo('title')"></span>
				<span>{{ movieInfo('date') }}</span>
			</div>
	</div>
	<tr v-else
		:class="{
			checked,
			dl_row: true,
			movie: true
		}"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click"
	>
		<!-- 
		draggable="true"
		@dragstart="onMovieDrag($event, movie.id)"> -->
		<td class="hidden">
			<input ref="select-box" type="checkbox" @input="entryElem_ctrlClick" @click.stop :checked="checked"/>
		</td>
		<td v-for="columnId in columns" :class="{ title:columnId == 'title' }">
			<img
				v-if="columnId == 'title'"
				:src="`${apiServer}/file/movie/thumb/${movieInfo('id')}`"
				alt="thumbnail"/>
			<span :title="movieInfo(columnId)" v-html="movieInfo(columnId)"></span>
		</td>
		<td class="actions hidden" @click.stop>
			<MovieListOptions :entry="entry" @entry-delete="deleteBtn_click"/>
		</td>
	</tr>
</template>
