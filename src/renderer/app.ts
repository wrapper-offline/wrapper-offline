import App from "./App.vue";
import { createApp } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";
import ExampleView from "./ExampleView.vue";
import SettingsController from "./controllers/SettingsController";

const routes = [
	{
		path: "/",
		component: ExampleView,
		meta: {
			title: "Welcome to the future (2.1.0 test)"
		},
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
const apiServer = `${import.meta.env.VITE_SERVER_HOST}:${import.meta.env.VITE_SERVER_PORT}`;
SettingsController.loadSettings(apiServer).then(() => {
	const app = createApp(App);
	app.provide("apiServer", apiServer);
	app.use(router);
	app.mount("#app");
});
