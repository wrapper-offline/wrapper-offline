<script setup lang="ts">
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
	<Sidebar/>
	<div id="app_right">
		<header></header>
		<RouterView/>
	</div>
</template>