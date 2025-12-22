import { createMemoryHistory, createRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import DefaultLayout from "./DefaultLayout.vue"
import Error404View from "./routes/Error404View.vue";
import PlayerView from "./routes/PlayerView.vue";
import StudioView from "./routes/StudioView.vue";
import UserCharacters from "./routes/UserCharacters.vue";
import UserMovies from "./routes/UserMovies.vue";
import UserStudioAssets from "./routes/UserStudioAssets.vue";
import LegacyUserCharacters from "./routes/LegacyUserCharacters.vue";

const routes:RouteRecordRaw[] = [
	{
		path: "/",
		redirect: {
			name: "movie_list"
		}
	},
	{
		path: "/assets",
		component: DefaultLayout,
		children: [
			{
				name: "asset_list",
				path: "",
				component:UserStudioAssets
			},
		],
		meta: {
			title: "Your Library"
		},
	},
	{
		path: "/characters/:themeId?",
		component: DefaultLayout,
		children: [
			{
				name: "char_list",
				path: "",
				component: UserCharacters
			},
		],
		meta: {
			title: "Characters"
		},
	},
	{
		path: "/characters_old/:themeId?",
		component: DefaultLayout,
		children: [
			{
				name: "old_cc_page",
				path: "",
				component: LegacyUserCharacters
			},
		],
		meta: {
			title: "Characters (old)"
		},
	},
	{
		path: "/movies/:folderId?",
		component: DefaultLayout,
		children: [
			{ 
				name: "movie_list",
				path: "",
				component: UserMovies,
			},
		],
		meta: {
			title: "Videos"
		},
	},
	{
		path: "/movies/create/:themeId?",
		component: StudioView,
		meta: {
			title: "Video Editor"
		},
	},
	{
		path: "/movies/edit/:movieId?",
		component: StudioView,
		meta: {
			title: "Video Editor"
		},
	},
	{
		path: "/movies/play/:movieId",
		component: PlayerView,
		meta: {
			title: "Video Player"
		},
	},
	{
		path: "/starters",
		component: DefaultLayout,
		children: [
			{
				name: "starter_list",
				path: "",
				component: UserMovies,
			},
		],
		meta: {
			title: "Starters"
		},
	},
	{
		path: "/:pathMatch(.*)*",
		component: DefaultLayout,
		children: [
			{ path:"", component:Error404View },
		],
		meta: {
			title: "404: Page Not Found"
		}
	}
];
const router = createRouter({
	history: createMemoryHistory(),
	routes,
});
router.beforeEach((to) => {
	const title = to.meta.title as string;
	const titleBase = "Wrapper: Offline";
	if (title) {
		document.title = `${title} - ${titleBase}`;
	} else {
		document.title = titleBase;
	}
});

export default router;
