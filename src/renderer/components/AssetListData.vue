<script setup lang="ts">
import type { Asset } from "../interfaces/Asset";
import AssetListOptions from "./AssetListOptions.vue";
import AssetImage from "./AssetImage.vue";
import AssetInfoModal from "./AssetInfoModal.vue";
import { inject, ref, toValue } from "vue";
import { type EntryKey } from "../interfaces/DataList";
import { flattenAssetType } from "../utils/flattenAssetType";
import locale from "../locale/en_US";
import CheckboxInput from "./controls/CheckboxInput.vue";

const emit = defineEmits<{
	entryDelete: [string],
	entryClick: [],
	entryCtrlClick: [],
	entryDblClick: [],
	entryShiftClick: [],
}>();
const props = defineProps<{
	checked: boolean,
	entry: Asset
}>();
defineExpose({ id:props.entry.id });

const columns = inject<EntryKey<Asset>[]>("columnKeys", []);
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
function assetInfoUpdated({ name }:Partial<Asset>) {
	props.entry.name = name || "";
	const origKey = toValue(key);
	key.value = "";
	key.value = origKey;
}

/**
 * returns normalized asset info to be displayed
 * @param field id of field to return
 */
function entryInfo(field:EntryKey<Asset>): string {
	switch (field) {
		case "index": {}
		case "type": {
			const flatType = flattenAssetType(props.entry);
			//@ts-ignore
			return locale.asset.flat_type_map[flatType];
		}
		default: return (props.entry[field] || "").toString();
	}
}

</script>

<template>
	<tr
		:key="key"
		class="dl_row asset"
		:class="{ checked }"
		@dblclick="entryElem_dblClick"
		@click.ctrl.exact="entryElem_ctrlClick"
		@click.shift.exact="entryElem_shiftClick"
		@click.exact="entryElem_click">
		<td class="hidden">
			<CheckboxInput
				v-bind:model-value="checked"
				@update:model-value="entryElem_ctrlClick"
				@dblclick.stop
				@click.stop/>
		</td>
		<td v-for="columnId in columns" :class="{ title:columnId == 'name' }">
			<template v-if="columnId == 'name'">
				<AssetImage :asset="entry"/>
			</template>
			<span>{{ entryInfo(columnId) }}</span>
		</td>
		<td class="hidden">
			<AssetListOptions :entry="entry"/>
		</td>
		<AssetInfoModal
			v-if="showPreview"
			:asset="entry"
			@close-clicked="assetPreviewClose_click"
			@update="assetInfoUpdated"/>
	</tr>
</template>

<style scoped>
@import url(../css/data_list_data.css);

</style>

