import { context } from "esbuild";
import { copyFileSync, cpSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import pkg from "../package.json" with { type:"json" };
import { spawn } from "child_process";
import viteConfig from "../vite.config.mjs";

const DEV_HOST = "http://localhost";
const DEV_PORT = viteConfig.server.port || 5173;

const BASE_OPTIONS = {
	bundle: true,
	external: [
		"@ffmpeg-installer/ffmpeg",
		"@ffprobe-installer/ffprobe",
		"electron",
		"es6-promise",
		"formidable",
		"sharp"
	],
	platform: "node",
	target: "node14",
};

/** @returns {Record<string, string>} */
const readEnv = () => {
	const env = JSON.parse(readFileSync(join(import.meta.dirname, "../config.json")));
	let envObj = {}
	for (const [key, val] of Object.entries(env)) {
		envObj["process.env." + key] = `'${val}'`;
	}
	return envObj;
};

/** @type {Record<string, import("esbuild").BuildOptions>} */
let options = {
	main: {
		...BASE_OPTIONS,
		define: readEnv(),
		entryPoints: ["src/main/index.ts"],
		outfile: "dist/main.js",
	},
	preload: {
		...BASE_OPTIONS,
		entryPoints: ["src/preload.js"],
		outfile: "dist/preload.js",
	},
};

/** @returns {import("esbuild").Plugin} */
const restartMainPlugin = (cb) => {
	return {
		name: "restart-main",
		setup(build) {
			build.onEnd(result => {
				console.log(`Main build ended with ${result.errors.length} errors`);
				cb();
			});
		},
	};
};

/** @type {import("child_process").ChildProcessWithoutNullStreams | void} */
let mainProcess;

function restartMain() {
	if (mainProcess) {
		mainProcess.kill();
	}
	mainProcess = spawn(
		"npx " +
		[
			"electron",
			options.main.outfile,
			"--dev=true",
			`--host=${DEV_HOST}`,
			`--port=${DEV_PORT}`,
		].join(" "),
		{
			shell: true,
			stdio: "inherit"
		}
	);
}

async function initContexts() {
	return {
		main: await context(options.main),
		preload: await context(options.preload)
	};
}

if (process.argv.includes("--dev")) {
	options.main.plugins = [
		restartMainPlugin(() => restartMain())
	];
	let contexts = await initContexts();
	for (const [, ctx] of Object.entries(contexts)) {
		await ctx.watch()
	}
} else {
	let contexts = await initContexts();
	for (const [, ctx] of Object.entries(contexts)) {
		await ctx.rebuild();
		await ctx.dispose();
	}
	mkdirSync(join(import.meta.dirname, "../dist/scripts"));
	copyFileSync(
		join(import.meta.dirname, "./fixModules.js"),
		join(import.meta.dirname, "../dist/scripts/fixModules.js"),
	);
	const pkgJson = {
		name: pkg.name,
		description: pkg.description,
		version: pkg.version,
		dependencies: Object.fromEntries(Object.entries(pkg.dependencies).filter((a) => {
			return [
				"@ffmpeg-installer/ffmpeg",
				"@ffprobe-installer/ffprobe",
				"formidable",
				"sharp",
			].indexOf(a[0]) != -1;
		})),
		scripts: {
			postinstall: pkg.scripts.postinstall
		},
		main: "main.js"
	};
	writeFileSync("dist/package.json", JSON.stringify(pkgJson));
	spawn(
		"npm i",
		{
			shell: true,
			cwd: join(import.meta.dirname, "../dist"),
			stdio: "inherit"
		}
	);
}
