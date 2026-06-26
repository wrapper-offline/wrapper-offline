<script setup lang="ts">
const model = defineModel<boolean>();

/**
 * updates the model with the clicked option's value
 * @param value 
 */
function checkbox_click(event:MouseEvent) {
	event.stopImmediatePropagation();
	model.value = !model.value;
}
</script>

<template>
	<div class="checkbox" :class="{ sel:model }" @click="checkbox_click"></div>
</template>

<style scoped>
.checkbox {
	background: hsl(250 16% 87% / 1);
	border-radius: 4px;
	width: 18px;
	height: 18px;
}
.checkbox:hover {
	background: hsl(250 16% 83% / 1);
}
.checkbox.sel {
	background: #489cf7;
}
.checkbox.sel::after {
	content: "\2713";
	color: #fff;
	line-height: 18px;
	font-size: 24px;
}
.checkbox.sel:hover {
	background: hsl(211 80% 68% / 1);
}

html.dark .checkbox {
	background: hsl(250deg 11% 22%);
}
html.dark .checkbox:hover {
	background: hsl(250deg 11% 26%);
}
html.dark .checkbox.sel {
	background: hsl(213, 92%, 56%);
}
html.dark .checkbox.sel:hover {
	background: hsl(212, 92%, 62%);
}
</style>
