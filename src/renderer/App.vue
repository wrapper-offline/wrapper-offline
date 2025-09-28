<style lang="css">
@import "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap";
@import "/node_modules/modern-normalize/modern-normalize.css";
@import "/css/icons.css";

:root {
	--popup-gradient-bg: radial-gradient(#333, #111);
	--slide-anim: cubic-bezier(0, 1.15, 0.7, 1);
	--button-anim: cubic-bezier(0.2, 0.95, 0.25, 1);
}

/**
general
**/
html, body {
	color: hsl(218deg 14% 36%);
	font: 15px/1.7 "Lato", Arial, sans-serif;
	overflow: hidden;
	width: 100%;
	height: 100%;
}
body.col_resize {
	cursor: col-resize;
}

#app {
	display: flex; 
	flex-direction: row;
	height: 100%;
}

html.dark {
	--popup-gradient-bg: radial-gradient(#1e1d25, #0e0d11);
}

html.dark, html.dark>body {
	background: #000;
	color: hsl(0deg 0% 82%);
}
</style>

<script setup lang="ts">
import { onMounted } from "vue";
import { useRouter } from "vue-router";

const params = new URLSearchParams(window.location.search);
if (params.get("redirect")) {
	const router = useRouter();
	const to = params.get("redirect") as string;
	router.push(to);
}

onMounted(() => {
	document.getElementById("noscript").remove();
});

</script>

<template>
	<RouterView/>
	<noscript id="noscript">
		<h1>Wrapper: Offline</h1>
		<h2>JavaScript Required</h2>
		<p>This page requires JavaScript to function.</p>
	</noscript>
</template>
