import Database, { generateId } from "../../storage/database";
import Directories from "../../storage/directories";
import fs from "fs";
import { join } from "path";

export interface Watermark {
	id: string
};

export default class WatermarkModel {
	static folder = Directories.asset;

	/**
	 * returns a list of watermarks
	 */
	static list(): Watermark[] {
		return Database.select("watermarks");
	}

	/**
	 * Looks for a match in `Directories.asset`
	 * @param id watermark id
	 * @throws {RangeError} wm doensn't exist
	 */
	static load(id:string) {
		const filepath = join(this.folder, id);
		if (!fs.existsSync(filepath)) {
			throw new RangeError("watermark does not exist");
		}
		return fs.createReadStream(filepath);
	}

	/**
	 * checks if a watermark exists
	 * @param id watermark id
	 * @returns whether or not it exists
	 */
	static exists(id:string) {
		return Database.exists("watermarks", id);
	}

	/**
	 * Saves the watermark to `Directories.asset`
	 * @param input file path
	 * @param ext file extension of the input
	 * @param id watermark id, if replacing a watermark
	 * @throws {RangeError} watermark doesn't exist
	 * @returns id, which will change if the ext is different
	 */
	static save(input:string, ext:string, id?:string): Promise<string> {
		let newWatermark = false,
			oldId:string | undefined;

		if (typeof id == "undefined") {
			id = `${generateId()}.${ext}`;
			newWatermark = true;
		} else if (!this.exists(id)) {
			throw new RangeError("Watermark doesn't exist, bitch.")
		} else if (!id.endsWith(ext)) {
			oldId = id;
			id = `${id.split(".")[0]}.${ext}`;
		}
		
		const filePath = join(this.folder, id);
		const write = fs.createWriteStream(filePath);
		const read = fs.createReadStream(input);
		return new Promise((resolve, reject) => {
			read.pipe(write);
			read.on("end", () => {
				write.close();
				if (newWatermark) {
					Database.insert("watermarks", { id });
				} else if (oldId) {
					const oldPath = join(this.folder, oldId);
					if (fs.existsSync(oldPath))
						fs.unlinkSync(oldPath);
					Database.update("watermarks", oldId, { id });
				}
				resolve(id);
			});
			read.on("error", reject);
		});
	}

	/**
	 * deletes db object & deletes file if it exists
	 * @param id watermark id
	 * @throws {RangeError} wm doesn't exist
	 */
	static delete(id:string) {
		if (!this.exists(id)) {
			throw new RangeError("watermark doesn't exist");
		}
		Database.delete("watermarks", id);
		const filepath = join(this.folder, id);
		if (fs.existsSync(filepath))
			fs.unlinkSync(filepath);
	}	
};
