<style lang="css">
@import "https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap";
@import "/node_modules/modern-normalize/modern-normalize.css";
@import "/css/icons.css";

/**
general
**/
html, body {
	background: #e4e2e9;
	color: #505969;
	font: 15px/1.7 "Lato", Arial, sans-serif;
	width: 100%;
	height: 100%;
}
html.dark, html.dark>body {
	background: #1e1d25;
	color: #eee;
}
#app {
	display: flex; 
	flex-direction: row;
	overflow: hidden;
	height: 100%;
}

#app_right {
	width: 100%;
}

#page_container {
	background: #0000;
	overflow: auto;
	padding: 25px 20px;
	width: 100%;
	height: calc(100% - 50px);
}
</style>

<template>
	<RouterView/>
	<noscript>
		<h1>Wrapper: Offline</h1>
		<h2>JavaScript Required</h2>
		<p>This page requires JavaScript to function.</p>
	</noscript>
</template>
