<style src="./list_entry_options.css"></style>

<script setup lang="ts" generic="T extends Asset">
import type { Asset } from "../../../interfaces/Asset";

const props = defineProps<{
	entry: T | string[]
}>();
</script>

<template>
	<div class="list_entry_options">
	</div>
</template>
