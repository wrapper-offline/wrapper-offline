import { Readable } from "stream";
import Database, { generateId } from "../../storage/database";
import Directories from "../../storage/directories";
import fs from "fs";
import path from "path";

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
	 * @param input file path
	 * @param id watermark id, if replacing a watermark
	 * @returns id
	 */
	static save(input:string, ext:string, id:string): Promise<string> {
		if (typeof id == "undefined") {
			id = `${generateId()}.${ext}`;
		}
		return new Promise((res, rej) => {
			if (!id.endsWith(ext)) {
				const oldId = id;
				id = `${id.split(".")[0]}.${ext}`;
				const filepath = path.join(this.folder, oldId);
				if (fs.existsSync(filepath)) {
					fs.unlinkSync(filepath);
				}
				Database.update("watermarks", oldId, { id });
			}
			const filepath = path.join(this.folder, id);
			const write = fs.createWriteStream(filepath);
			const read = fs.createReadStream(input);
			read.pipe(write);
			read.on("end", () => {
				write.close();
				if (!Database.get("watermarks", id)) {
					Database.insert("watermarks", { id });
				}
				res(id);
			});
			read.on("error", () => {
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
