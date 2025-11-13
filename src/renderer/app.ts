import App from "./App.vue";
import { createApp } from "vue";
import router from "./router";
import useAppSettings from "./composables/useAppSettings";

const appSettings = useAppSettings();
appSettings.loadSettings().then(() => {
	const app = createApp(App);
	app.use(router);
	app.mount("#app");
});
