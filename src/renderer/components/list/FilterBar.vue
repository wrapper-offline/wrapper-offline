<style>
div.filter_bar {
	display: block;
	padding: 10px calc((100% - (38 * v-bind("zoomLevel.css()"))) / 2) 8px;
}
div.filter_bar .spacer {
	display: inline-block;
	width: 25px;
}
div.filter_bar .dropdown {
	display: inline-block;
}
div.filter_bar .filter_button {
	background: #0000;
	border: 1px solid hsl(240 12% 70% / 1);
	border-radius: 4px;
	transition: 0.2s var(--button-anim);
	display: inline-block;
	margin-right: 10px;
	padding: 6px 12px;
}
div.filter_bar .filter_button img {
	display: block;
	margin-right: 5px;
	float: left;
	height: 16px;
}
div.filter_bar .filter_button:hover {
	background-color: hsl(216deg 55% 85%);
	border-color: hsl(216deg 55% 77%);
	cursor: pointer;
	transition: none;
}
div.filter_bar .filter_button:focus {
	outline: none;
}
div.filter_bar .filter_button.active {
	background-color: hsl(220deg 80% 47% / 0.55);
	border-color: hsl(220deg 67% 55%);
	color: #fff;
}
div.filter_bar .filter_button.active:hover {
	opacity: 0.8;
}

html.dark div.filter_bar .filter_button {
	border-color: hsl(250 9% 36% / 1);
	color: #fff;
}
html.dark div.filter_bar .filter_button:hover {
	background-color: hsl(216deg 35% 28%);
	border-color: hsl(216deg 25% 47%);
}
html.dark div.filter_bar .filter_button.active {
	background-color: hsl(216deg 80% 47% / 0.55);
	border-color: hsl(216deg 67% 55%);
}
</style>

<script setup lang="ts">
import useListStore from "../../composables/useListStore";
const { zoomLevel } = useListStore();
</script>

<template>
	<div class="filter_bar">
		<div class="spacer"></div>
		<slot></slot>
	</div>
</template>
