import App from "./App.vue";
import { createApp } from "vue";
import router from "./plugins/router";
import tooltip from "./directives/tooltip";
import useAppSettings from "./composables/useAppSettings";

const appSettings = useAppSettings();
appSettings.loadSettings().then(() => {
	const app = createApp(App);
	app.directive("tooltip", tooltip);
	app.use(router);
	app.mount("#app");
});
