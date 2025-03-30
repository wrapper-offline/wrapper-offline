<script setup lang="ts" generic="T extends Asset">
import { apiServer } from "../../controllers/AppInit";
import type { Asset } from "../../interfaces/Asset";
import { genericColumnIdKey } from "../../keys/listTreeKeys";
import { inject } from "vue";
import type { FieldIdOf } from "../../interfaces/ListTypes";
import { flattenAssetType } from "../../utils/flattenAssetType";
import locale from "../../locale/en_US";

const props = defineProps<{
	entry: T
}>();

const columns = inject(genericColumnIdKey<T>(), []);

/**
 * returns a fixed date string for a movie
 * @param entry movie object
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
	<tr class="asset">
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
				<!-- flash assets -->
				<img
					v-if="entry.id.endsWith('swf')"
					src="/img/importer/flash.svg"
					alt="thumbnail"/>
				<img
					v-else-if="entry.type == 'sound'"
					src="/img/importer/sound.svg"
					alt="thumbnail"/>
				<img
					v-else-if="entry.subtype == 'video'"
					:src="`${apiServer}/assets/${assetInfo('id').slice(0, -4)}.png`"
					alt="thumbnail"/>
				<img
					v-else-if="entry.type == 'bg' || entry.type == 'prop'"
					:src="`${apiServer}/assets/${assetInfo('id')}`"
					alt="thumbnail"/>
			</template>
			<span>{{ assetInfo(columnId) }}</span>
		</td>
		<td class="actions">
			<RouterLink class="action" :to="`?redirect=/movies/play/${assetInfo('id')}`" target="_blank">
				<i class="ico play"></i>
			</RouterLink>
			<RouterLink class="action" :to="`/movies/edit/${assetInfo('id')}`">
				<i class="ico brush"></i>
			</RouterLink>
			<!-- <a href="/file/movie/file/${tbl.id}"  title="Download files -- NOT AN EXPORTER"></a> -->
			<!--<a href="javascript:;" onclick="popupExport('${tbl.id}')" title="Export"></a>-->
			<!-- <a href="javascript:;" onclick="destructive('${tbl.id}', 'delete')" title="Delete"></a> -->
		</td>
	</tr>
</template>
