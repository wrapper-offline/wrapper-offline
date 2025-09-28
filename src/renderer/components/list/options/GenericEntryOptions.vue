<script setup lang="ts" generic="T extends GenericListEntry">
import type { GenericListEntry } from "../../../interfaces/ListTypes";

const props = defineProps<{
	entry: T | string[]
}>();
</script>

<template>
	<div class="list_entry_options">
	</div>
</template>
