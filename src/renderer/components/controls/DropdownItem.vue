<style lang="css">
.dropdown_item {
	color: #232323;
	border-radius: 1px;
	text-decoration: none;
	display: block;
	line-height: 16px;
	font-size: 15px;
	margin: 0 4px;
	padding: 6px 15px;
}
.dropdown_item:hover {
	background: #5db8a7;
	color: #fff;
	cursor: pointer;
}
</style>

<script setup lang="ts">
defineProps(["value", "name"]);
</script>

<template>
	<div class="dropdown_item">
		<slot></slot>
	</div>
</template>
