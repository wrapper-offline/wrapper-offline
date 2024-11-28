import { context } from "esbuild";
import htmlPlugin from "@chialab/esbuild-plugin-html"
import { join } from "path";
import { readFileSync } from "fs";
import { spawn } from "child_process";

const DEV_HOST = "127.0.0.1";
const DEV_PORT = 8080;

/** @returns {Record<string, string>} */
const readEnv = () => {
	const env = JSON.parse(readFileSync(join(import.meta.dirname, "../config.json")));
	let envObj = {}
	for (const [key, val] of Object.entries(env)) {
		envObj["process.env." + key] = `'${val}'`;
	}
	return envObj;
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
/** @returns {import("esbuild").Plugin} */
const restartServerPlugin = (cb) => {
	return {
		name: "restart-server",
		setup(build) {
			build.onEnd(result => {
				console.log(`Server build ended with ${result.errors.length} errors`);
				cb();
			});
		},
	};
};

const BASE_OPTIONS = {
	bundle: true,
	define: readEnv(),
	external: [
		"@ffmpeg-installer/ffmpeg",
		"@ffprobe-installer/ffprobe",
		"electron",
		"es6-promise",
	],
	platform: "node",
	target: "node14",
}

/** @type {Record<string, import("esbuild").BuildOptions>} */
let options = {
	main: {
		...BASE_OPTIONS,
		entryPoints: ["src/main/index.ts"],
		outfile: "dist/main.js",
	},
	preload: {
		bundle: true,
		entryPoints: ["src/preload.js"],
		external: [
			"electron",
		],
		outfile: "dist/preload.js",
		platform: "node",
		target: "node14",
	},
	renderer: {
		bundle: true,
		entryPoints: ["src/renderer/index.html"],
		loader: {
			".png": "file",
			".svg": "file",
			".woff": "file",
		},
		minify: true,
		outdir: "dist/renderer",
		plugins: [htmlPlugin()],
		sourcemap: true,
		supported: {
			nesting: false
		},
	},
	server: {
		...BASE_OPTIONS,
		entryPoints: ["src/server/index.ts"],
		outfile: "dist/server.js",
	},
};

class ProcController {
	#procOptions = {
		main: [
			"npx",
			"electron",
			options.main.outfile,
			`--dev`,
			`--host=${DEV_HOST}`,
			`--port=${DEV_PORT}`,
		],
		server: [
			"node",
			options.server.outfile,
			`--dev`,
		]
	}
	/** @type {Record<"main"|"server", import("child_process").ChildProcessWithoutNullStreams>} */
	#processes = {}
	/** @param {"main"|"server"} name */
	#restart(name) {
		this.#procOptions[name];

		if (this.#processes[name]) {
			this.#processes[name].kill();
		}
		const prog = this.#procOptions[name].at(0);
		const options = this.#procOptions[name].slice(1);
		const process = spawn(prog, options, {
			cwd: join(import.meta.dirname, "../")
		});
		process.stdout.on("data", (c) => console.log(c.toString()));
		process.stderr.on("data", (c) => console.error(c.toString()));
		this.#processes[name] = process;
	}
	restartMain() {
		this.#restart("main");
	}
	restartServer() {
		this.#restart("server");
	}
};

async function initContexts() {
	return {
		main: await context(options.main),
		preload: await context(options.preload),
		renderer: await context(options.renderer),
		server: await context(options.server),
	};
}

if (process.argv.includes("--dev")) {
	const controller = new ProcController(); 
	options.main.plugins = [
		restartMainPlugin(() => controller.restartMain())
	];
	options.server.plugins = [
		restartServerPlugin(() => controller.restartServer())
	];
	let contexts = await initContexts();
	for (const [, ctx] of Object.entries(contexts)) {
		await ctx.watch()
	}
	await contexts.renderer.serve({
		servedir: "dist/renderer",
		host: DEV_HOST,
		port: DEV_PORT,
	});
} else {
	let contexts = await initContexts();
	for (const [, ctx] of Object.entries(contexts)) {
		await ctx.rebuild();
		await ctx.dispose();
	}
}
