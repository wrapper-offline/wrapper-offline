<style lang="css">
.popup_container.theme_sel_popup {
	background: var(--popup-gradient-bg);
}
.popup_container.theme_sel_popup .popup {
	width: 70%;
	min-width: 660px;
	max-width: 950px;
	max-height: calc(100% - 100px);
}

.theme_sel_popup .row {
	border-bottom: 1px solid hsl(252deg 16% 87%);
	margin-bottom: 10px;
	padding-bottom: 10px;
}
.theme_sel_popup .row:last-of-type {
	border: none;
	margin: 0;
	padding: 0;
}

/**
theme
**/
.theme_sel_popup .theme {
	background-color: hsl(252deg 16% 97%);
	border: 1px solid hsl(252deg 16% 82%);
	border-radius: 3px;
	transition: 0.12s cubic-bezier(0.7, 0.5, 0.3, 1);
	display: inline-flex;
	align-items: center;
	font-size: 19px;
	font-weight: bold;
	margin: 4px;
	width: calc(50% - 8px);
	height: 78px;
}
.theme_sel_popup .theme .icon {
	border-radius: 100%;
	margin: 0 12px 0 8px;
	width: 70px;
	height: 70px;
}
.theme_sel_popup .theme .banner {
	border-radius: 3px;
	transition: 0.12s cubic-bezier(0, 0.7, 0.1, 0.75);
	object-position: center -30px;
	object-fit: cover;
	opacity: 0.05;
    margin-right: -100%;
    width: 100%;
    height: 100%;
}
.theme_sel_popup .theme:hover {
	background-color: hsl(338deg 55% 85%);
	border-color: hsl(338deg 55% 77%);
	color: #fff;
	text-shadow: 0 0 10px #000;
	cursor: pointer;
}
.theme_sel_popup .theme:hover .icon {
	filter: brightness(1.1) blur(0.5px);
}
.theme_sel_popup .theme:hover .banner {
	object-position: center -15px;
	opacity: 0.5;
}

html.dark .theme_sel_popup .row {
	border-color: hsl(250deg 11% 20.5%);
}
html.dark .theme_sel_popup .theme {
	background-color: hsl(250deg 11% 17%);
	border-color: hsl(250deg 11% 23%);
}
html.dark .theme_sel_popup .theme .banner {
	opacity: 0.03;
}
html.dark .theme_sel_popup .theme:hover {
	background-color: #5d4354;
	border-color: #6b3f56;
	color: #ffd2e3;
}
html.dark .theme_sel_popup .theme:hover .banner {
	opacity: 0.48;
}

@media (max-width: 700px) {
	.popup_container.theme_sel_popup .popup {
		min-width: 310px;
		width: 80%;
	}
	.theme_sel_popup .theme {
		font-size: 16px;
		width: calc(100% - 8px);
		height: 58px;
	}
	.theme_sel_popup .theme .icon {
		width: 50px;
		height: 50px;
	}
}

@media (min-width: 1270px) {
	.theme_sel_popup .theme {
		width: calc(33% - 8px);
	}
}

@media (min-width: 1450px) {
	.popup_container.theme_sel_popup .popup {
		max-width: 1200px;
	}
	.theme_sel_popup .theme {
		font-size: 22px;
		width: calc(33% - 8px);
		height: 88px;
	}
	.theme_sel_popup .theme .icon {
		margin: 0 12px 0 16px;
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
import { Theme, useSortedList } from "../controllers/themelist";

const props = defineProps<{
	ccFilter?: boolean,
	headingFor: string,
}>();
const themeList = ref<Theme[][]>([]);

onMounted(async () => {
	themeList.value = await useSortedList(props.ccFilter);
});
</script>

<template>
	<div class="theme_selector">
		<Popup class="theme_sel_popup hidden">
			<template #small-heading>{{ props.headingFor }}</template>
			<template #large-heading>Select a theme</template>

			<div class="row" v-for="column in themeList">
				<div v-for="theme in column"
					class="theme"
					:data-id="theme.id"
					@click="$emit('themeClicked', theme)">
					<img class="banner" :src="`/img/themes/banners/${theme.id}.webp`" alt=""/>
					<img class="icon" :src="`/img/themes/icons/${theme.id}.webp`" alt=""/>
					{{ theme.name }}
				</div>
			</div>
			
			<template #foot>
				<Button><RouterLink to="/">Cancel</RouterLink></Button>
			</template>
		</Popup>
	</div>
</template>