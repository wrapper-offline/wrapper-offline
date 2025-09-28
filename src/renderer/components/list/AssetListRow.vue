<script setup lang="ts" generic="T extends Asset">
import type { Asset } from "../../interfaces/Asset";
import AssetEntryOptions from "./options/AssetEntryOptions.vue";
import AssetImage from "../AssetImage.vue";
import AssetInfoModal from "../AssetInfoModal.vue";
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import { inject, Ref, ref, toValue, useTemplateRef } from "vue";
import type { FieldIdOf } from "../../interfaces/ListTypes";
import { flattenAssetType } from "../../utils/flattenAssetType";
import locale from "../../locale/en_US";

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

/** list of columns to be displayed */
const columns = inject(genericColumnIdKey<T>(), []);
const key = ref("assetlist-entry" + props.entry.id);
const selectBox = useTemplateRef<HTMLInputElement>("select-box");
const showPreview = ref(false);

/**
 * called when the `tr` element is clicked,
 * displays the asset preview modal and deselects
 */
function entryElem_dblClick() {
	showPreview.value = true;
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
 * called when the preview modal emits a closeClicked event
 * hides the modal
 */
function assetPreviewCloseClicked() {
	showPreview.value = false;
}

/**
 * called when the asset info has been updated in the preview modal
 * @param param0 object containing new asset info
 */
function assetInfoUpdated({ title }:Partial<T>) {
	props.entry.title = title;
	const origKey = toValue(key);
	key.value = null;
	key.value = origKey;
}

/**
 * returns normalized asset info to be displayed
 * @param field id of field to return
 */
function assetInfo(field:FieldIdOf<T>): string {
	switch (field) {
		case "type": {
			const flatType = flattenAssetType(
				props.entry.type,
				props.entry.subtype,
				props.entry.ptype
			);
			return locale.asset.flat_type_map[flatType];
		}
		default: return props.entry[field].toString();
	}
}
</script>

<template>
	<tr
		:key="key"
		:class="{ checked }"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.exact="entryElem_click">
		<!-- :class="{
			movie: true,
			sel: (selection['movie'] || []).includes(movie.id)
		}"
		draggable="true"
		@mousedown.exact="clearSelection(); select('movie', movie.id)"
		@mousedown.ctrl="select('movie', movie.id)"
		@dragstart="onMovieDrag($event, movie.id)"> -->
		<td class="hidden">
			<input ref="select-box" type="checkbox" @input="selectBox_click" @click.stop/>
		</td>
		<td v-for="columnId in columns" :class="{ title:columnId=='title' }">
			<!-- thumbnail block for title column -->
			<template v-if="columnId == 'title'" class="title">
				<AssetImage :asset="entry"/>
			</template>
			<span>{{ assetInfo(columnId) }}</span>
		</td>
		<td class="hidden">
			<AssetEntryOptions :entry="entry"/>
		</td>
		<Teleport to="body">
			<AssetInfoModal
				v-if="showPreview"
				:asset="entry"
				@close-clicked="assetPreviewCloseClicked"
				@update="assetInfoUpdated"/>
		</Teleport>
	</tr>
</template>
