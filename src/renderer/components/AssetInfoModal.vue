<style>
.popup_container.asset_preview .contents {
	display: flex;
	min-width: 400px;
	max-width: 450px;
}
.asset_preview_left {
	flex-shrink: 0;
	margin-right: 8px;
	width: 160px;
	height: 170px;
}
.asset_preview_left .image_container {
	user-select: none;
	display: block;
	width: 160px;
	height: 170px;
}
/* information column */
.asset_preview_right h3 {
	margin: 0 0 4px 3px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	width: 250px;
}
.asset_preview_right table {
	margin: 0 0 4px;
}
.asset_preview_right table tr>td {
	padding: 1px 6px;
}
.asset_preview_right table tr>td:nth-child(1) {
	font-weight: bold;
	text-align: right;
	padding-right: 4px;
	min-width: 60px;
}
.asset_preview_right table tr>td:nth-child(2) {
	padding-left: 4px;
}
.asset_preview_right table tr>td:hover {
	background: #e3e2e9;
	cursor: default;
}
</style>

<script setup lang="ts">
import { Asset } from "../interfaces/Asset";
import AssetImage from "./AssetImage.vue";
import Button from "./controls/Button.vue";
import { flattenAssetType } from "../utils/flattenAssetType";
import { formatDur } from "../utils/formatDur";
import locale from "../locale/en_US";
import Popup from "./Popup.vue";

const props = defineProps<{
	asset: Asset
}>();

function flattenedTypeName() {
	const flatType = flattenAssetType(
		props.asset.type,
		props.asset.subtype,
		props.asset.ptype
	);
	return locale.asset.flat_type_map[flatType];
}

defineEmits<{
	closeClicked: []
}>();
</script>

<template>
	<Popup class="asset_preview">
		<template #small-heading>Your Library</template>
		<template #large-heading>Asset information</template>

		<div class="asset_preview_left">
			<AssetImage class="image_container" :asset="asset" playable/>
		</div>
		<div class="asset_preview_right">
			<h3 :title="asset.title.length > 25 ? asset.title : ''">
				{{ asset.title }}
			</h3>
			<table>
				<tbody>
					<tr>
						<td>ID:</td>
						<td>{{ asset.id }}</td>
					</tr>
					<tr>
						<td>Type:</td>
						<td>{{ flattenedTypeName() }}</td>
					</tr>
					<tr v-if="asset.type == 'sound'">
						<td>Duration:</td>
						<td>{{ formatDur(asset.duration) }}</td>
					</tr>
					<template v-if="asset.subtype == 'video'">
						<tr>
							<td>Width:</td>
							<td>{{ asset.width }}px</td>
						</tr>
						<tr>
							<td>Height:</td>
							<td>{{ asset.height }}px</td>
						</tr>
					</template>
				</tbody>
			</table>
		</div>

		<template #foot>
			<Button primary @click="$emit('closeClicked')">Close</Button>
		</template>
	</Popup>
</template>
