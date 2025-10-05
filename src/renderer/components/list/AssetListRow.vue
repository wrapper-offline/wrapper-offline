<script setup lang="ts" generic="T extends Asset">
import type { Asset } from "../../interfaces/Asset";
import AssetEntryOptions from "./options/AssetEntryOptions.vue";
import AssetImage from "../AssetImage.vue";
import AssetInfoModal from "../AssetInfoModal.vue";
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import { inject, ref, toValue } from "vue";
import type { FieldIdOf } from "../../interfaces/ListTypes";
import { flattenAssetType } from "../../utils/flattenAssetType";
import locale from "../../locale/en_US";

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

/** list of columns to be displayed */
const columns = inject(genericColumnIdKey<T>(), []);
const key = ref("assetlist-entry" + props.entry.id);
const showPreview = ref(false);

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
 * called when the `tr` element is double clicked
 * opens asset preview and emits event
 */
function entryElem_dblClick() {
	showPreview.value = true;
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
 * called when the preview modal emits a closeClicked event
 * hides the modal
 */
function assetPreviewClose_click() {
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
		@click.shift.exact="entryElem_shiftClick"
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
			<input ref="select-box" type="checkbox" @input="entryElem_ctrlClick" @click.stop :checked="checked"/>
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
				@close-clicked="assetPreviewClose_click"
				@update="assetInfoUpdated"/>
		</Teleport>
	</tr>
</template>
