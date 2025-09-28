<script setup lang="ts" generic="T extends GenericListEntry">
import type { GenericListEntry } from "../../interfaces/ListTypes";

function setSelectState(newState:boolean) {

}

defineProps<{
	entry: T
}>();

defineExpose({ setSelectState, id:"" });
</script>

<template>
	entry1aa
</template>
