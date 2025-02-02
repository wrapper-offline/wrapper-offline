<style lang="css">
html.dark, html.dark>body {
	background: #1e1d25;
	color: #eee;
}
html.dark {
	--popup-gradient-bg: radial-gradient(#1e1d25, #0e0d11);
}
</style>

<script setup lang="ts">
import Navbar from "./components/Navbar.vue";
import Sidebar from "./components/Sidebar.vue";
import { useTemplateRef } from "vue";

type SidebarType = InstanceType<typeof Sidebar>;
const sidebar = useTemplateRef<SidebarType>("sidebar");

if (localStorage.getItem("DARK_MODE") == "true") {
	document.documentElement.classList.add("dark");
}
</script>

<template>
	<Sidebar ref="sidebar"/>
	<div id="app_right" :style="{
		width: `calc(100% - ${sidebar?.width + sidebar?.slideMode.margin}px)`
	}">
		<Navbar/>
		<RouterView/>
	</div>
</template>
