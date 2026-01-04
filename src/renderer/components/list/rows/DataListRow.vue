<script setup lang="ts" generic="T extends DataListEntry">
import { defineComponent } from "vue";
import type { DataListEntry } from "../../../interfaces/DataList";
import GenericRowOptions from "../options/DataListOptions.vue";

defineProps<{
	checked: boolean,
	entry: T
}>();

defineComponent({
	optionsComponent: GenericRowOptions
});

defineExpose({ id:"" });
</script>

<template></template>
