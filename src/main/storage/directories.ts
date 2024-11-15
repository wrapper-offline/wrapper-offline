import { existsSync, mkdirSync } from "fs";
import { join } from "path";

class DirUtil {
	private static _instance:DirUtil;

	constructor() {
		const requiredPaths = [
			this.userData,
			this.asset,
			this.cache,
			this.log,
			this.saved,
			this.export,
			this.theme,
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

	get asset() {
		return join(this.userData, process.env.ASSET_FOLDER);
	}

	get cache() {
		return join(this.userData, process.env.CACHÉ_FOLDER);
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

	get theme() {
		return join(this.userData, process.env.THEME_FOLDER);
	}
}
export default DirUtil.instance;
