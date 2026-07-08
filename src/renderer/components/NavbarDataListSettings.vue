<script setup lang="ts">
import { Flow } from '../interfaces/DataList';

const emit = defineEmits<{
	flowUpdate: [Flow]
}>();

const props = defineProps<{
	flow?: Flow
}>();

</script>

<template>
	<div>
		<template v-if="typeof flow !== 'undefined'">
			<div
				v-if="flow == Flow.List"
				class="nav_btn"
				v-tooltip="'Display as grid'"
				@click="emit('flowUpdate', Flow.Grid)">
				<i class="ico grid"></i>
			</div>
			<div
				v-else
				class="nav_btn"
				v-tooltip="'Display as list'"
				@click="emit('flowUpdate', Flow.List)">
				<i class="ico blist"></i>
			</div>
		</template>
	</div>
</template>

<style></style>
