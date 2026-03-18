<style lang="css">
:root {
	--height-anim: cubic-bezier(0.02, 0.71, 0.31, 0.99);
	--page-anim: cubic-bezier(0.1, 0.8, 0.4, 0.97);
	--page-anim-inverse: cubic-bezier(0.6, 0.03, 0.9, 0.2);
}


.popup_container.ccts .popup .contents {
	transition: height .2s var(--height-anim);
	overflow-x: hidden;
	overflow-y: scroll;
	padding: 15px 10px 15px 30px;
}
.popup_container.ccts .popup .contents[style] {
	position: relative;
}

.popup_container.ccts .page {
	margin-bottom: 0;
	width: 100%;
}
.popup_container.ccts .page.page2 {
	display: grid;
    grid-template-columns: repeat(auto-fit, 130px);
	column-gap: 20px;
	row-gap: 15px;
	padding: 15px 0;
	justify-content: center;

}
.popup_container.ccts .page.page2 .bs {
	background: hsl(211deg 72% 54%);
	user-select: none;
	transition: .2s var(--button-anim);
	cursor: pointer;
    border-radius: 6px;
    padding: 30px 0;
	text-align: center;
	height: 200px;
}
.popup_container.ccts .page.page2 .bs img {
	pointer-events: none;
	height: 100%;
}
.popup_container.ccts .page.page2 .bs:hover {
	background: hsl(211deg 72% 40%);
	transition: none;
}

/**
animations
**/
.page2.slide-page-enter-active {
	animation: page-right .22s var(--page-anim);
}
.page2.slide-page-leave-active {
	position: absolute;
	animation: page-right .22s var(--page-anim-inverse) reverse;
}
.page1.slide-page-leave-active {
	position: absolute;
	animation: page-left .22s var(--page-anim);
}
.page1.slide-page-enter-active {
	animation: page-left .22s var(--page-anim-inverse) reverse;
}

@media (max-width: 700px) {
	.popup_container.ccts .page.page2 .bs {
		height: 200px
	}
}

@media (min-width: 1270px) {
	.popup_container.ccts .page.page2 {
		grid-template-columns: repeat(auto-fit, 170px);
	}
	.popup_container.ccts .page.page2 .bs {
		height: 260px
	}
}

@media (min-width: 1450px) {
	.popup_container.ccts .page.page2 {
		grid-template-columns: repeat(auto-fit, 190px);
	}
	.popup_container.ccts .page.page2 .bs {
		padding: 30px 0;
		height: 270px
	}
}

@keyframes page-right {
	0% {
		transform: translateX(18%);
		opacity: 0;
	}
	100% {
		transform: translateX(0);
		opacity: 1;
	}
}
@keyframes page-left {
	0% {
		transform: translateX(0);
		opacity: 1;
	}
	100% {
		transform: translateX(-18%);
		opacity: 0;
	}
}
</style>

<script setup lang="ts">
import Button from "./controls/Button.vue";
import { onMounted, ref } from "vue";
import Popup from "./Popup.vue";
import { Theme, useThemeList } from "../composables/useThemeList";
import CCTheme from "../models/cc/CCTheme";

const emit = defineEmits<{
	themeClick: [string, string]
}>();
const props = defineProps<{
	ccFilter?: boolean
}>();
const themeList = ref<Theme[]>([]);
const themeModel = ref<CCTheme>();

const BS_ID_TO_IMG_MAP = (bsId:string) => {
	switch (bsId) {
		case "adam":
		case "guy":
		case "man":
			return "a";
		case "eve":
		case "woman":
			return "b";
		case "bob":
		case "heavy_man":
			return "a_american";
		case "heavy_woman":
			return "b_american";
		case "rocky":
		case "muscular_guy":
			return "e";
		case "boy":
			return "c";
		case "girl":
			if (themeModel.value.id == "business" || themeModel.value.id == "whiteboard") {
				return "d";
			}
			return "b";
	}
};

function transition_beforeEnter(el:HTMLDivElement) {
	setTimeout(() => {
		el.style.width = el.clientWidth + "px";
		el.style.height = el.clientHeight + "px";
	}, 50);
}
function transition_beforeLeave(el:HTMLDivElement) {
	el.style.width = el.clientWidth + "px";
	el.style.height = el.clientHeight + "px";
	const contents = el.parentElement as HTMLDivElement;
	contents.style.height = el.clientHeight + "px";
}
function transition_enter(el:HTMLDivElement) {
	const contents = el.parentElement as HTMLDivElement;
	setTimeout(() => {
		contents.style.height = el.clientHeight + 30 + "px";
	}, 50);
}
function transition_afterEnter(el:HTMLDivElement) {
	el.style.width = null;
	el.style.height = null;
	el.removeAttribute("style");
	const contents = el.parentElement as HTMLDivElement;
	contents.style.height = null;
	contents.removeAttribute("style");
}

function backBtn_click() {
	themeModel.value = null;
}

/**
 * called when a theme is clicked, emits event
 * @param id theme id
 */
async function ccTheme_click(id:string) {
	const theme = new CCTheme(id);
	await theme.load();
	if (Object.keys(theme.bodyShapes).length == 1) {
		emit("themeClick", id, "default");
		return;
	}
	themeModel.value = theme;
}

/**
 * called when a bodyshape is clicked, emits event
 * @param id bodyshape id
 */
function bs_click(id:string) {
	const themeId = themeModel.value.id;
	emit("themeClick", themeId, id);
}

onMounted(async () => {
	themeList.value = await useThemeList(props.ccFilter);
});
</script>

<template>
	<div>
		<Popup class="theme_sel_popup hidden ccts">
			<template #small-heading>Create a character</template>
			<template #large-heading>
				<template v-if="themeModel">Select a body shape</template>
				<template v-else>Select a theme</template>
			</template>

			<Transition
				name="slide-page"
				@before-leave="transition_beforeLeave"
				@before-enter="transition_beforeEnter"
				@enter="transition_enter"
				@after-enter="transition_afterEnter"
			>
				<div v-if="!themeModel" class="page page1">
					<div v-for="theme in themeList"
						class="theme"
						:data-id="theme.id"
						@click="ccTheme_click(theme.cc_theme_id)">
						<img class="banner" :src="`/img/themes/banners/${theme.id}.webp`" alt=""/>
						<img class="icon" :src="`/img/themes/icons/${theme.id}.webp`" alt=""/>
						{{ theme.name }}
					</div>
				</div>

				<div v-else class="page page2">
					<div v-for="bodyShape in themeModel.bodyShapes"
						class="bs"
						@click="bs_click(bodyShape.id)">
						<img :src="`/img/bodyshapes/${BS_ID_TO_IMG_MAP(bodyShape.id)}.svg`" alt=""/>
					</div>
				</div>
			</Transition>
			
			<template #foot>
				<Button v-if="themeModel" @click="backBtn_click">Back</Button>
				<RouterLink to="/"><Button>Cancel</Button></RouterLink>
			</template>
		</Popup>
	</div>
</template>
