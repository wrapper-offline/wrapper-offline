import { apiServer } from "./controllers/AppInit";
import App from "./App.vue";
import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import SettingsController from "./controllers/SettingsController";

import AssetListView from "./routes/AssetListView.vue";
import CCView from "./routes/CCView.vue";
import Error404View from "./routes/Error404View.vue";
import MovieListView from "./routes/MovieListView.vue";
import PlayerView from "./routes/PlayerView.vue";
import StudioView from "./routes/StudioView.vue";

import DefaultLayout from "./DefaultLayout.vue"

const routes:RouteRecordRaw[] = [
	{
		path: "/",
		redirect: "/videos/movie",
	},
	{
		path: "/assets",
		component: DefaultLayout,
		children: [
			{ path:"", component:AssetListView },
		],
		meta: {
			title: "Your Library"
		},
	},
	{
		path: "/characters/:themeId?",
		component: DefaultLayout,
		children: [
			{ path:"", component:CCView },
		],
		meta: {
			title: "Characters"
		},
	},
	{
		path: "/videos/:folderId?",
		component: DefaultLayout,
		children: [
			{ path:"", component:MovieListView },
		],
		meta: {
			title: "Videos"
		},
	},
	{
		path: "/videos/create/:themeId?",
		component: StudioView,
		meta: {
			title: "Video Maker"
		},
	},
	{
		path: "/videos/edit/:movieId?",
		component: StudioView,
		meta: {
			title: "Video Maker"
		},
	},
	{
		path: "/videos/play/:movieId",
		component: PlayerView,
		meta: {
			title: "Playing a video"
		},
	},
	{
		path: "/starters",
		component: DefaultLayout,
		children: [
			{ path:"", component:MovieListView },
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

SettingsController.loadSettings().then(() => {
	const app = createApp(App);
	app.use(router);
	app.mount("#app");
});
