import App from "./App.vue";
import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import SettingsController from "./controllers/SettingsController";

import AssetListView from "./routes/AssetListView.vue";
import CharacterAppView from "./routes/CharacterAppView.vue";
import Error404View from "./routes/Error404View.vue";
import StudioView from "./routes/StudioView.vue";
import VideoListView from "./routes/VideoListView.vue";

import DefaultLayout from "./DefaultLayout.vue"

const routes:RouteRecordRaw[] = [
	{
		path: "/",
		redirect: "/videos",
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
			{ path:"", component:CharacterAppView },
		],
		meta: {
			title: "Characters"
		},
	},
	// {
	// 	path: "/characters/create/:themeId?/:bs?",
	// 	component: DefaultLayout,
	// 	children: [
	// 		{ path:"", component:CharacterAppView },
	// 	],
	// 	meta: {
	// 		title: "Character Creator"
	// 	},
	// },
	// {
	// 	path: "/characters/copy/:assetId",
	// 	component: DefaultLayout,
	// 	children: [
	// 		{ path:"", component:CharacterAppView },
	// 	],
	// 	meta: {
	// 		title: "Character Creator"
	// 	},
	// },
	{
		path: "/videos/:displayStarters?",
		component: DefaultLayout,
		children: [
			{ path:"", component:VideoListView },
		],
		meta: {
			title: "Videos"
		},
	},
	{
		path: "/videos/create/:movieId?",
		component: StudioView,
		meta: {
			title: "Video Maker"
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

//@ts-ignore
const apiServer = `${import.meta.env.VITE_API_SERVER_HOST}:${import.meta.env.VITE_API_SERVER_PORT}`;
//@ts-ignore
const staticServer = `${import.meta.env.VITE_STATIC_SERVER_HOST}:${import.meta.env.VITE_STATIC_SERVER_PORT}`;
const staticPaths = {
	//@ts-ignore
	swfUrl: import.meta.env.VITE_SWF_URL,
	//@ts-ignore
	storeUrl: import.meta.env.VITE_STORE_URL,
	//@ts-ignore
	clientUrl: import.meta.env.VITE_CLIENT_URL,
};
SettingsController.loadSettings(apiServer).then(() => {
	const app = createApp(App);
	app.provide("apiServer", apiServer);
	app.provide("staticServer", staticServer);
	app.provide("staticPaths", staticPaths);
	app.use(router);
	app.mount("#app");
});
