<style>
.checkbox {
	width: 12px;
	height: 12px;
}
.checkbox .cb_input {
	position: absolute;
	opacity: 0;
	width: 12px;
	height: 12px;
}
.checkbox .cb_box {
	border: 1px solid #f00;
	border-radius: 3px;
	width: 100%;
	height: 100%;
}
</style>

<script setup lang="ts">
import { Ref, useTemplateRef, watch } from "vue";

const props = defineProps<{
	value: Ref<boolean>
}>();

const checkboxInput = useTemplateRef<HTMLInputElement>("checkbox");

watch(props.value, (newVal) => {
	console.log(newVal);
})
</script>

<template>
	<div class="checkbox">
		<input
			class="cb_input"
			type="checkbox"
			ref="checkbox"
			@input=""/>
		<div class="cb_box"></div>
		<div class="cb_check"></div>
	</div>
</template>
