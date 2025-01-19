import Directories from "../../../shared/storage/directories.js";
import fs from "fs";
import path from "path";

export default class WaveformModel {
	static folder = Directories.asset;

	/**
	 * Looks for a match in the `Directories.saved` folder.
	 * If there's no match found, it returns null.
	 * @param id asset id
	 */
	static load(id:string) {
		const filepath = path.join(this.folder, id + ".wf");
		const exists = fs.existsSync(filepath);
		if (!exists) {
			throw new Error("404");
		}
		return fs.readFileSync(filepath);
	}

	/**
	 * Saves the waveform to the `Directories.saved` folder.
	 * @param wf waveform data
	 * @param id asset id
	 */
	static save(wf:Buffer, id:string) {
		fs.writeFileSync(path.join(this.folder, id + ".wf"), wf);
	}
};
