<style lang="css">
.popup_container {
	background: #0e0e109d;
	animation: 0.15s popup_container_fade forwards ease-out;
	z-index: 9;
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;
}

.popup {
	background: #eeedf2;
	border-radius: 3px;
	box-shadow: 0 2px 5px #0004;
	animation: 0.15s popup_flyDown forwards var(--sidebar-open-anim);
	overflow: hidden;
	position: absolute;
	top: 50%;
	left: 50%;
	width: 60%;
	height: 80%;
}
.popup .popup_heading {
	background: #dbd9e4;
    border-bottom: 1px solid #c1bfce;
	user-select: none;
	font-size: 20px;
	font-weight: 700;
	display: flex;
	margin: 0;
	padding: 6px 18px;
	height: 50px;
}
.popup .popup_heading .head_left {
	flex: 1;
	background: #0000;
}
.popup .popup_heading .head_center .small {
	color: #84899a;
	font-size: 10px;
	position: absolute;
	left: 0;
	transform: translateX(-50%);
	margin-left: 50%;
}
.popup .popup_heading .head_center .small + .main {
	font-size: 17px;
	position: relative;
	top: 6px;
}
.popup .popup_heading .head_right {
	flex: 1;
}
.popup .popup_heading small {
	color: #bbb;
}

.popup .close_btn {
	background: #0000;
	border: none;
	color: #fff;
	cursor: pointer;
	font-size: 30px;
	position: absolute;
	top: 20px;
	right: 30px;
}
.popup .close_btn:focus {
	outline: none;
}

.popup .contents {
	overflow: auto;
	padding: 15px 30px;
	height: calc(100% - 105px);
}

.popup .bottom {
	background: #e2e1ea;
    border-top: 1px solid #c7c5d3;
	display: flex;
	justify-content: flex-end;
	padding: 2px 10px;
	height: 55px;
}



@keyframes popup_container_fade {
	0% {
		opacity: 0.3;
	}
	100% {
		opacity: 1;
	}
}

@keyframes popup_flyDown {
	0% {
		transform: scale(0.8) translate(calc(-50% * calc(1 / 0.8)), calc(-50% - 200px));
	}
	100% {
		transform: translate(-50%, -50%);
	}
}

</style>

<style lang="css" scoped>
.popup {
	width: 70%;
	min-width: 660px;
	max-width: 950px;
	height: auto;
}

/**
theme
**/
.theme {
	background-color: #fcfcfd;
	background-position: center -30px;
	background-blend-mode: overlay;
	background-size: 100%;
	border-bottom: 1px solid #c9c5de;
    box-shadow: 0 0 2px 1px #00000015;
	border-radius: 3px;
	transition: 0.12s cubic-bezier(0.7, 0.5, 0.3, 1);
	display: inline-flex;
	align-items: center;
	font-size: 19px;
	font-weight: bold;
	margin: 4px;
	padding: 4px 8px;
	width: calc(50% - 8px);
}
.theme img {
	border-radius: 100%;
	transition: filter 0.1s linear;
	margin-right: 12px;
	display: block;
	height: 70px;
	width: 70px;
}
html div.theme:hover {
	background-color: #babeea;
	color: #fff;
	text-shadow: 0 0 10px #000;
	box-shadow: 0 2px 4px #00000010;
	background-size: 105%;
	background-position: center -15px;
	cursor: pointer;
}
.theme:hover img {
	filter: brightness(1.2) blur(0.5px);
}

html.dark .theme {
	background-color: #2c2c2c;
	border-color: #373546;
	background-blend-mode: color;
}
html.dark .theme:hover {
	background-color: #5d4354;
	border-color: #6b3f56;
	color: #ffd2e3;
	background-blend-mode: overlay;
}

@media (min-width: 1270px) {
	.theme {
		width: calc(33% - 8px);
	}
}

@media (min-width: 1450px) {
	.popup {
		max-width: 1200px;
	}
	.theme {
		font-size: 22px;
		padding: 10px 16px;
		width: calc(33% - 8px);
	}
}

</style>

<script async setup lang="ts">
import Button from "./controls/Button.vue";
import { inject, onMounted, ref } from "vue";

const props = defineProps<{
	ccFilter?: boolean
}>();

type Theme = {
	id: string,
	name: string,
	cc_theme_id?: string
};

const apiServer = inject("apiServer") as string;
const themeList = ref<Theme[]>([]);

function loadThemeList(ccFilter = false) : Promise<Theme[]> {
	return new Promise((res, rej) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			const themes = JSON.parse(this.responseText);
			let returnArray = [];
			for (const theme of themes) {
				if (ccFilter && !theme.cc_theme_id) {
					continue;
				}
				returnArray.push(theme);
			}
			res(returnArray);
		};
		xhttp.open("GET", `${apiServer}/api/theme/list`, true);
		xhttp.send();
	});
}
onMounted(async () => {
	themeList.value = await loadThemeList(props.ccFilter);
});
</script>

<template>
	<div class="theme_selector">
		<Teleport to="body">
			<div class="popup_container">
				<div class="popup">
					<h2 class="popup_heading">
						<div class="head_left"></div>
						<div class="head_center">
							<span class="small">Create a character</span>
							<span class="main">Select a theme</span>
						</div>
						<div class="head_right"></div>
					</h2>
					<div class="contents">
						<div v-for="theme in themeList" class="theme" :style="{
							backgroundImage: `url('/img/themes/banners/${theme.id}.webp')`
						}" :data-id="theme.id" @click="$emit('themeClicked', theme)">
							<img :src="`/img/themes/icons/${theme.id}.webp`" alt=""/>
							{{ theme.name }}
						</div>
					</div>
					<div class="bottom">
						<Button><RouterLink to="/">Cancel</RouterLink></Button>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>
