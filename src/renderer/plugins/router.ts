import { createMemoryHistory, createRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

const CCView = () => import("../routes/CCView.vue");
const DefaultLayout = () => import("../DefaultLayout.vue");
const Error404View = () => import("../routes/Error404View.vue");
const PlayerView = () => import("../routes/PlayerView.vue");
const StudioView = () => import("../routes/StudioView.vue");
const UserCharacters = () => import("../routes/UserCharacters.vue");
const UserMovies = () => import("../routes/UserMovies.vue");
const UserStudioAssets = () => import("../routes/UserStudioAssets.vue");

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
		path: "/characters",
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
		path: "/characters/create/:themeId?/:bs?",
		component: DefaultLayout,
		children: [
			{
				name: "cc",
				path: "",
				component: CCView
			},
		],
		meta: {
			title: "Character Creator"
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
