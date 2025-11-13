<style lang="css">
@import "/node_modules/modern-normalize/modern-normalize.css";
@import "/css/icons.css";

:root {
	--popup-gradient-bg: radial-gradient(hsl(240deg 16% 22%), hsl(240deg 16% 8%));
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

a {
	color: #338cec;
	text-decoration: none;
}
a:hover {
	text-decoration: initial;
}

html.dark {
	--popup-gradient-bg: radial-gradient(#1e1d25, #0e0d11);
}

html.dark, html.dark>body {
	background: #000;
	color: hsl(0deg 0% 82%);
}

@font-face {
	font-family: "Lato";
	font-style: normal;
	font-weight: 400;
	font-display: swap;
	src: url(/fonts/latonormal400.woff2) format("woff2");
}
@font-face {
	font-family: "Lato";
	font-style: normal;
	font-weight: 700;
	font-display: swap;
	src: url(/fonts/latonormal700.woff2) format("woff2");
}
@font-face {
	font-family: "Lato";
	font-style: italic;
	font-weight: 700;
	font-display: swap;
	src: url(/fonts/latoitalic400.woff2) format("woff2");
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
