import Database, { generateId } from "../../storage/database";
import Directories from "../../storage/directories";
import fs from "fs";
import path from "path";
import { Sharp } from "sharp";

type S = fs.ReadStream | Sharp;
export type Watermark = {
	id: string,
};

export default class WatermarkModel {
	static folder = Directories.asset;

	/**
	 * returns a list of watermarks
	 */
	static list(): Watermark[] {
		const list = Database.select("watermarks");
		return list;
	}

	/**
	 * Looks for a match in the `Directories.saved` folder.
	 * If there's no match found, it returns null.
	 * @param id watermark id
	 */
	static load(id:string) {
		const filepath = path.join(this.folder, id);
		const exists = fs.existsSync(filepath);
		if (!exists) {
			throw new Error("404");
		}
		return fs.createReadStream(filepath);
	}

	/**
	 * checks if a watermark exists
	 * @param id watermark id
	 * @returns whether or not it exists
	 */
	static exists(id:string) {
		const filepath = path.join(this.folder, id);
		const exists = fs.existsSync(filepath);
		return exists;
	}

	/**
	 * Saves the watermark to the `Directories.saved` folder.
	 * @param data watermark data as a stream
	 * @param id watermark id, if replacing a watermark
	 * @returns id
	 */
	static save(data:S, ext:string, id:string): Promise<string> {
		if (typeof id == "undefined") {
			id = `${generateId()}.${ext}`;
		}
		return new Promise((res, rej) => {
			const filepath = path.join(this.folder, id);
			const readStream = fs.createWriteStream(filepath);
			data.pipe(readStream);
			data.on("end", () => {
				readStream.close();
				if (!Database.get("watermarks", id)) {
					Database.insert("watermarks", {
						id
					});
				}
				res(id);
			});
			data.on("error", () => {
				rej();
			});
		});
	}

	/**
	 * checks for watermark in saved folder, deletes if exists
	 * deletes db entry
	 * @param id watermark id
	 */
	static delete(id:string) {
		const filepath = path.join(this.folder, id);
		const exists = fs.existsSync(filepath);
		if (exists) {
			fs.unlinkSync(filepath);
		}
		Database.delete("watermarks", id);
	}	
};
