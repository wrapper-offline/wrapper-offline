import { existsSync, mkdirSync } from "fs";
import { join } from "path";

class DirUtil {
	private static _instance:DirUtil;

	constructor() {
		const requiredPaths = [
			this.userData,
			this.asset,
			this.cache,
			this.export,
			this.log,
			this.saved,
		];
		for (const p of requiredPaths) {
			if (!existsSync(p)) {
				mkdirSync(p);
			}
		}
	}

	static get instance() {
		if (!DirUtil._instance) {
			DirUtil._instance = new DirUtil();
		}
		return DirUtil._instance;
	}

	get userData() {
		if (process.versions.hasOwnProperty("electron")) {
			const { app } = require("electron");
			return app.getPath("userData");
		}
		return join(__dirname, "../../", process.env.USERDATA_DIR);
	}

	get static() {
		return join(__dirname, "../resources/static");
	}

	get asset() {
		return join(this.userData, process.env.ASSET_FOLDER);
	}

	get cache() {
		return join(this.userData, process.env.CACHE_FOLDER);
	}

	get export() {
		return join(this.userData, process.env.EXPORT_FOLDER);
	}

	get log() {
		return join(this.userData, process.env.LOG_FOLDER);
	}

	get saved() {
		return join(this.userData, process.env.SAVED_FOLDER);
	}

	get store() {
		return join(this.static, process.env.STORE_URL);
	}
}

export default DirUtil.instance;
