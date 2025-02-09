<style lang="css" scoped>
header {
	background: #232131;
	padding: 13px 15px;
	height: 50px;
}
/* navigation buttons */
header .nav_btn {
	color: #fff;
	font-size: 12px;
	display: inline;
	margin: 0 5px 0 0;
	padding: 6px 4px;
}
header .nav_btn:hover {
	cursor: pointer;
	opacity: 0.8;
}
/* address */
header .link_container {
	display: inline;
	margin-left: 2px;
}
header .link {
	color: #fff;
	border-radius: 3px;
	transition: background 0.2s var(--button-anim);
	padding: 4px 8px;
}
header .link:hover {
	background: #323143;
	transition: none;
}
/* previous links */
header .parent_link {
	color: #fff;
	text-decoration: none;
	margin: 0 20px 0 0;
}
header .parent_link .caret {
	opacity: 0.6;
	pointer-events: none;
	font-size: 12px;
	position: relative;
	display: inline;
	margin-left: -16px;
	left: 24px;
}
/* current link */
header .final_link {
	user-select: none;
	font-weight: bold;
}

html.dark header {
	background: #121117;
}
html.dark header .link:hover {
	background: #262531;
}
</style>

<script setup lang="ts">
import Button from "./controls/Button.vue";
import { onBeforeRouteLeave, onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import { ref } from "vue";
import { useThemeList } from "../controllers/themelist";

interface Path {
	path: string,
	title: string,
}

const router = useRouter();
const parents = ref<Path[]>([]);
const finalPath = ref("");

async function parsePath(route) {
	parents.value = [];
	finalPath.value = "";
	if (route.path.startsWith("/videos")) {
		finalPath.value = "Videos";
	} else if (route.path.startsWith("/starters")) {
		finalPath.value = "Starters";
	} else if (route.path.startsWith("/characters")) {
		const themeId = route.params.themeId as string | void;
		if (!themeId) {
			return;
		}
		const themeList = await useThemeList();
		const theme = themeList.find(t => t.cc_theme_id == themeId);
		parents.value.push({
			path: "/characters",
			title: "Characters"
		});
		finalPath.value = `${theme.name} Characters`;
		return;
	}
}

function backButtonClick() {
	router.back();
}
function forwardButtonClick() {
	router.forward();
}

const route = useRoute();
parsePath(route);
onBeforeRouteLeave(parsePath);
onBeforeRouteUpdate(parsePath);
</script>

<template>
	<header>
		<div class="head_left">
			<div class="nav_btn" @click="backButtonClick"><i class="ico left"></i></div>
			<div class="nav_btn" @click="forwardButtonClick"><i class="ico right"></i></div>
			<div class="link_container">
				<RouterLink v-for="parent in parents" :to="parent.path" class="link parent_link">
					{{ parent.title }}
					<div class="caret"><i class="ico right"></i></div>
				</RouterLink>
				<span class="link final_link">
					{{ finalPath }}
				</span>
			</div>
		</div>
	</header>
</template>
