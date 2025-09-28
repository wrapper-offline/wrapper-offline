<style>
tr.movie td.title img {
	width: initial;
}
</style>

<script setup lang="ts" generic="T extends Movie">
import { apiServer } from "../../controllers/AppInit";
import type { FieldIdOf } from "../../interfaces/ListTypes";
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import { inject, Ref, useTemplateRef } from "vue";
import type { Movie } from "../../interfaces/Movie";
import MovieEntryOptions from "./options/MovieEntryOptions.vue";

const emit = defineEmits<{
	entryDelete: [string],
	entryDeselect: [],
	entrySelect: [],
	entrySelfSelect: [],
}>();
const props = defineProps<{
	checked: Ref<boolean>,
	entry: T
}>();
defineExpose({ setSelectState, id:props.entry.id });

const columns = inject(genericColumnIdKey<T>(), []);
const selectBox = useTemplateRef<HTMLInputElement>("select-box");

/**
 * called when the `tr` element is clicked, deselects
 */
function entryElem_dblClick() {
	setSelectState(false);
	selectBox_click();
}

/**
 * called when the entry element is clicked, emits event to parent
 */
function entryElem_click() {
	setSelectState(true);
	emit("entrySelfSelect");
}

/**
 * called when the entry element is clicked and ctrl is held down
 * flips selection state and emits event
 */
function entryElem_ctrlClick() {
	const origValue = selectBox.value.checked;
	setSelectState(!origValue);
	selectBox_click();
}

/**
 * called when the select box is clicked, emits event to parent list
 */
function selectBox_click() {
	const value = selectBox.value.checked;
	if (value) {
		emit("entrySelect");
	} else {
		emit("entryDeselect");
	}
}

/**
 * updates the select box with the new selection state
 * @param newState new selection state
 */
function setSelectState(newState:boolean) {
	selectBox.value.checked = newState;
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
		@click.exact="entryElem_click">
		<!-- :class="{
			movie: true,
			sel: (selection['movie'] || []).includes(movie.id)
		}"
		draggable="true"
		@dragstart="onMovieDrag($event, movie.id)"> -->
		<td class="hidden">
			<input ref="select-box" type="checkbox" @input="selectBox_click" @click.stop/>
		</td>
		<td v-for="columnId in columns" :class="{ title:columnId=='title' }">
			<img
				v-if="columnId == 'title'"
				:src="`${apiServer}/file/movie/thumb/${movieInfo('id')}`"
				alt="thumbnail"/>
			<span :title="movieInfo(columnId)">{{ movieInfo(columnId) }}</span>
		</td>
		<td class="actions hidden" @click.stop>
			<MovieEntryOptions :entry="entry"/>
		</td>
	</tr>
</template>
