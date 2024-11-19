const esbuild = require("esbuild");
const env = require("../config.json");

function readEnv() {
	let envObj = {}
	for (const [key, val] of Object.entries(env)) {
		envObj["process.env." + key] = `'${val}'`;
	}
	return envObj;
}

async function build() {
	const htmlPlugin = (await import('@chialab/esbuild-plugin-html')).default;
	esbuild.build({
		bundle: true,
		define: readEnv(),
		entryPoints: ["src/main/index.ts"],
		external: [
			"es6-promise",
			"electron",
			"@ffmpeg-installer/ffmpeg",
			"@ffprobe-installer/ffprobe",
			"*.woff"
		],
		outfile: "dist/main.js",
		platform: "node",
		plugins: [htmlPlugin()],
		target: "node14",
	});
	esbuild.build({
		bundle: true,
		entryPoints: ["src/preload.js"],
		external: [
			"electron",
		],
		outfile: "dist/preload.js",
		platform: "node",
		target: "node14",
	});
	esbuild.build({
		bundle: true,
		entryPoints: ["src/renderer/index.html"],
		loader: {
			".png": "file",
			".svg": "file",
			".woff": "file",
		},
		minify: true,
		outfile: "dist/renderer.html",
		plugins: [htmlPlugin()],
		sourcemap: true,
		supported: {
			nesting: false
		},
	});
}
build();
