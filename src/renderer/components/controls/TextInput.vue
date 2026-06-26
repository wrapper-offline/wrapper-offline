<script setup lang="ts">
defineOptions({
	inheritAttrs: false
});
const model = defineModel();

</script>

<template>
	<div class="text_input">
		<input type="text" v-model="model" v-bind="$attrs"/>
	</div>
</template>

<style scoped>
.text_input {
	background: #fff;
	border: 1px solid #cacad4;
	box-shadow: inset 0 1px 1px #0000001f;
	border-radius: 3px;
	height: 32px;
}
.text_input input {
	background: #0000;
	border: none;
	color: inherit;
	padding: 0 4px 2px;
	height: 100%;
	width: 100%;
}
.text_input input:focus {
	outline: none;
}

html.dark .text_input {
	background: hsl(250deg 11% 20%);
	border-color: hsl(250deg 11% 24%);
}

</style>
