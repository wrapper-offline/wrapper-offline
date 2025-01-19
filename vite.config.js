import config from "./config.json" with {type:"json"};
import { defineConfig } from "vite";
import svgPlugin from "vite-svg-loader";
import vuePlugin from "@vitejs/plugin-vue";

process.env.VITE_SERVER_HOST = config.SERVER_HOST;
process.env.VITE_API_SERVER_PORT = config.API_SERVER_PORT;

export default defineConfig({
	base: "",
	esbuild: {
		target: "es2020"
	},
	build: {
		target: "es2020",
		rollupOptions: {
			input: ["./index.html"],
		},
		cssTarget: "chrome86",
	},
	keepProcessEnv: true,
	plugins: [
		vuePlugin(),
		svgPlugin(),
	],
	server: {
		port: 5173,
		
	},
});
