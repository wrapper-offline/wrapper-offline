<style>
.text_field {
	background: #fff;
	border: 1px solid #cacad4;
	box-shadow: inset 0 1px 1px #0000001f;
	border-radius: 3px;
	height: 32px;
}
.text_field input {
	background: #0000;
	border: none;
	color: inherit;
	padding: 0 4px 2px;
	height: 100%;
	width: 100%;
}
.text_field input:focus {
	outline: none;
}
</style>

<script setup lang="ts">
const model = defineModel();
</script>

<template>
	<div class="text_field">
		<input type="text" v-model="model"/>
	</div>
</template>
