<script setup lang="ts" generic="T extends Asset">
import type { Asset } from "../../interfaces/Asset";
import AssetImage from "../AssetImage.vue";
import AssetInfoModal from "../AssetInfoModal.vue";
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import { inject, ref, toValue } from "vue";
import type { FieldIdOf } from "../../interfaces/ListTypes";
import { flattenAssetType } from "../../utils/flattenAssetType";
import locale from "../../locale/en_US";

const props = defineProps<{
	entry: T
}>();
const key = ref("assetlist-entry" + props.entry.id);

/** list of columns to be displayed */
const columns = inject(genericColumnIdKey<T>(), []);
const showPreview = ref(false);

/**
 * called when the `tr` element is clicked,
 * displays the asset preview modal
 */
function assetEntryClicked() {
	showPreview.value = true;
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
	<tr :key="key" @click="assetEntryClicked">
		<!-- :class="{
			movie: true,
			sel: (selection['movie'] || []).includes(movie.id)
		}"
		draggable="true"
		@mousedown.exact="clearSelection(); select('movie', movie.id)"
		@mousedown.ctrl="select('movie', movie.id)"
		@dragstart="onMovieDrag($event, movie.id)"> -->
		<td></td>
		<td v-for="columnId in columns" :class="{ title:columnId=='title' }">
			<!-- thumbnail block for title column -->
			<template v-if="columnId == 'title'" class="title">
				<AssetImage :asset="entry"/>
			</template>
			<span>{{ assetInfo(columnId) }}</span>
		</td>
		<td></td>
		<Teleport to="body">
			<AssetInfoModal
				v-if="showPreview"
				:asset="entry"
				@close-clicked="assetPreviewCloseClicked"
				@update="assetInfoUpdated"/>
		</Teleport>
	</tr>
</template>
