<style src="./list_row_options.css"></style>

<script setup lang="ts" generic="T extends Asset">
import type { Asset } from "../../../interfaces/Asset";

const props = defineProps<{
	entry: T | string[]
}>();
</script>

<template>
	<div class="list_row_options">
	</div>
</template>
