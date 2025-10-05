<script setup lang="ts" generic="T extends GenericListEntry">
import type { GenericListEntry } from "../../interfaces/ListTypes";

defineProps<{
	checked: boolean,
	entry: T
}>();

defineExpose({ id:"" });
</script>

<template></template>
