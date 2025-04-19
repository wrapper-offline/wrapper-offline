<style lang="css">
#right_page_container {
	background: #1c1c27;
	user-select: none;
	overflow: hidden;
	display: flex;
	flex-direction: column;
}
.page_contents {
	background: #eeedf2;
	overflow: auto;
	flex-grow: 1;
}

html.dark #right_page_container {
	background: hsl(250 10% 9% / 1);
}
html.dark .page_contents {
	background: hsl(250 9% 16% / 1);
}

/* html.dark #app_right {
	background: linear-gradient(hsl(246 11% 9% / 1) 20px, hsl(246 11% 15% / 1) 20px);
	width: 100%;
} */
</style>

<script setup lang="ts">
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
	<RouterView id="right_page_container" :style="{
		width: `calc(100% - ${sidebar?.width + sidebar?.slideMode.margin}px)`
	}"/>
</template>
