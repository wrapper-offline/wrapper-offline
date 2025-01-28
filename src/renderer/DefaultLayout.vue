<script setup lang="ts">
import Navbar from "./components/Navbar.vue";
import Sidebar from "./components/Sidebar.vue";
</script>

<template>
	<Sidebar/>
	<div id="app_right">
		<Navbar/>
		<RouterView/>
	</div>
</template>