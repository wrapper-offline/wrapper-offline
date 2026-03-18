<script setup lang="ts" generic="T extends Asset">
import type { Asset } from "../../../interfaces/Asset";

const props = defineProps<{
	entry: T | string[]
}>();
</script>

<template>
	<div class="data_list_options">
	</div>
</template>
