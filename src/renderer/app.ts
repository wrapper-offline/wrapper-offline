import App from "./App.vue";
import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import SettingsController from "./controllers/SettingsController";

import AssetListView from "./routes/AssetListView.vue";
import CharacterAppView from "./routes/CharacterAppView.vue";
import CharacterListView from "./routes/CharacterListView.vue";
import Error404View from "./routes/Error404View.vue";
import StudioView from "./routes/StudioView.vue";
import VideoListView from "./routes/VideoListView.vue";

const routes:RouteRecordRaw[] = [
	{
		path: "/",
		redirect: "/videos",
	},
	{
		path: "/videos/:displayStarters",
		component: VideoListView,
		meta: {
			title: "My Videos"
		},
	},
	{
		path: "/:pathMatch(.*)*",
		component: Error404View,
		meta: {
			title: "404"
		}
	}
];
const router = createRouter({
	history: createMemoryHistory(),
	routes,
});
router.beforeEach((to) => {
	console.log(to)
	const title = to.meta.title as string;
	const titleBase = "Wrapper: Offline";
	if (title) {
		document.title = `${title} - ${titleBase}`;
	} else {
		document.title = titleBase;
	}
});

//@ts-ignore
const apiServer = `${import.meta.env.VITE_SERVER_HOST}:${import.meta.env.VITE_API_SERVER_PORT}`;
SettingsController.loadSettings(apiServer).then(() => {
	const app = createApp(App);
	app.provide("apiServer", apiServer);
	app.use(router);
	app.mount("#app");
});
