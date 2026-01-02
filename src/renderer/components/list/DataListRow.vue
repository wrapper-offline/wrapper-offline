<script setup lang="ts" generic="T extends GenericListEntry">
import { defineComponent } from "vue";
import type { GenericListEntry } from "../../interfaces/DataList";
import GenericRowOptions from "./options/GenericRowOptions.vue";

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
