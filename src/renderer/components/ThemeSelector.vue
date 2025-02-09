<style lang="css">
.popup_container.theme_sel_popup {
	background: var(--popup-gradient-bg);
}
.popup_container.theme_sel_popup .popup {
	width: 70%;
	min-width: 660px;
	max-width: 950px;
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

@media (max-width: 700px) {
	.popup_container.theme_sel_popup .popup {
		min-width: 310px;
		width: 80%;
	}
	.theme {
		font-size: 16px;
		width: calc(100% - 8px);
	}
	.theme img {
		width: 50px;
		height: 50px;
	}
}

@media (min-width: 1270px) {
	.theme {
		width: calc(33% - 8px);
	}
}

@media (min-width: 1450px) {
	.popup_container.theme_sel_popup .popup {
		max-width: 1200px;
	}
	.theme {
		font-size: 22px;
		padding: 10px 16px;
		width: calc(33% - 8px);
	}
}

@keyframes popup_container_fade {
	0% {
		opacity: 0.2;
	}
	70% {
		opacity: 1;
	}
}

</style>

<script setup lang="ts">
import Button from "./controls/Button.vue";
import { onMounted, ref } from "vue";
import Popup from "./Popup.vue";
import { Theme, useThemeList } from "../controllers/themelist";

const props = defineProps<{
	ccFilter?: boolean,
	headingFor: string,
}>();
const themeList = ref<Theme[]>([]);

onMounted(async () => {
	themeList.value = await useThemeList(props.ccFilter);
});
</script>

<template>
	<div class="theme_selector">
		<Popup class="theme_sel_popup hidden">
			<template #small-heading>{{ props.headingFor }}</template>
			<template #large-heading>Select a theme</template>
	
			<div v-for="theme in themeList" class="theme" :style="{
				backgroundImage: `url('/img/themes/banners/${theme.id}.webp')`
			}" :data-id="theme.id" @click="$emit('themeClicked', theme)">
				<img :src="`/img/themes/icons/${theme.id}.webp`" alt=""/>
				{{ theme.name }}
			</div>
			
			<template #foot>
				<Button><RouterLink to="/">Cancel</RouterLink></Button>
			</template>
		</Popup>
	</div>
</template>