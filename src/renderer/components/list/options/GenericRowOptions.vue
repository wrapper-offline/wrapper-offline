<script setup lang="ts" generic="T extends GenericListEntry">
import type { GenericListEntry } from "../../../interfaces/ListTypes";

defineEmits<{
	entryDelete: [string[]]
}>();
const props = defineProps<{
	entry: T | string[]
}>();
</script>

<template>
	<div class="list_row_options">
	</div>
</template>
