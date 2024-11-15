const esbuild = require("esbuild");
const env = require("../config.json");

function readEnv() {
	let envObj = {}
	for (const [key, val] of Object.entries(env)) {
		envObj["process.env." + key] = `'${val}'`;
	}
	return envObj;
}

// npx esbuild src/main.js --bundle --platform=node --target=node14 --external:es6-promise

async function build() {
	const htmlPlugin = (await import('@chialab/esbuild-plugin-html')).default;
	esbuild.build({
		bundle: true,
		platform: "node",
		target: "node14",
		external: [
			"es6-promise",
			"electron",
			"@ffmpeg-installer/ffmpeg",
			"@ffprobe-installer/ffprobe",
			"*.woff"
		],
		define: readEnv(),
		plugins: [htmlPlugin()],
		entryPoints: ["src/main/index.ts"],
		outfile: "dist/main.js"
	});
	esbuild.build({
		bundle: true,
		platform: "node",
		target: "node14",
		external: [
			"electron",
		],
		entryPoints: ["src/preload.js"],
		outfile: "dist/preload.js"
	});
	esbuild.build({
		bundle: true,
		platform: "node",
		target: "node14",
		external: [
			"*.woff",
		],
		plugins: [htmlPlugin()],
		entryPoints: ["src/renderer/index.html"],
		outfile: "dist/renderer.html"
	});
}
build();
