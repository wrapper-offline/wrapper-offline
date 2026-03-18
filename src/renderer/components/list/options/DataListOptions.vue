<script setup lang="ts" generic="T extends DataListEntry">
import type { DataListEntry } from "../../../interfaces/DataList";

defineEmits<{
	entryDelete: [string[]]
}>();
const props = defineProps<{
	entry: T | string[]
}>();
</script>

<template>
	<div class="data_list_options">
	</div>
</template>
