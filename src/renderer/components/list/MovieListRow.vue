<style>
tr.movie td.title img {
	width: initial;
}
</style>

<script setup lang="ts" generic="T extends Movie">
import { apiServer } from "../../controllers/AppInit";
import type { FieldIdOf } from "../../interfaces/ListTypes";
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import { inject } from "vue";
import LocalSettings from "../../controllers/LocalSettings";
import type { Movie } from "../../interfaces/Movie";
import MovieEntryOptions from "./options/MovieEntryOptions.vue";
import { useRouter } from "vue-router";

const emit = defineEmits<{
	entryDelete: [string],
	entryClick: [],
	entryCtrlClick: [],
	entryDblClick: [],
	entryShiftClick: [],
}>();
const props = defineProps<{
	checked: boolean,
	entry: T
}>();
defineExpose({ id:props.entry.id });

const columns = inject(genericColumnIdKey<T>(), []);
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
 * called when the `tr` element is clicked
 * does user action and emits event
 */
function entryElem_dblClick() {
	switch (LocalSettings.onMovieDclick) {
		case "edit": {
			router.push(`/movies/edit/${props.entry.id}`);
			break;
		}
		case "play": {
			openPlayWindow();
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
 * opens a video player window
 */
function openPlayWindow() {
	const width = screen.width > 1280 ? 1280 : 560;
	const height = screen.height > 720 ? 720 : 315;
	window.open(
		`?redirect=/movies/play/${props.entry.id}`,
		"MsgWindow",
		`width=${width},height=${height},left=${screen.width / 2 - 640},top=${screen.height / 2 - 360}`
	);
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
</script>

<template>
	<tr
		:class="{ checked, movie:true }"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click">
		<!-- :class="{
			movie: true,
			sel: (selection['movie'] || []).includes(movie.id)
		}"
		draggable="true"
		@dragstart="onMovieDrag($event, movie.id)"> -->
		<td class="hidden">
			<input ref="select-box" type="checkbox" @input="entryElem_ctrlClick" @click.stop :checked="checked"/>
		</td>
		<td v-for="columnId in columns" :class="{ title:columnId=='title' }">
			<img
				v-if="columnId == 'title'"
				:src="`${apiServer}/file/movie/thumb/${movieInfo('id')}`"
				alt="thumbnail"/>
			<span :title="movieInfo(columnId)">{{ movieInfo(columnId) }}</span>
		</td>
		<td class="actions hidden" @click.stop>
			<MovieEntryOptions :entry="entry" @play-click="openPlayWindow"/>
		</td>
	</tr>
</template>
