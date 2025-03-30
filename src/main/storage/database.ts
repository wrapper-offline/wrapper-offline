import type { Asset } from "../../main/server/models/asset";
import crypto from "crypto";
import directories from "./directories";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type { Movie } from "../../main/server/models/movie";

export type Folder = {
	id: string,
	title: string,
	/** folder color as a hex code, (ie. "ff00ff") */
	color: string,
	parent_id: string,
};

type DatabaseJson = {
	version: string,
	assets: Asset[],
	movies: Movie[],
	movie_folders: Folder[],
};

type ArrayKey<T> = {
	[K in keyof T]: T[K] extends any[] ? K : never
}[keyof T];
export type DBJsonArrayKey = ArrayKey<DatabaseJson>;
type DBJsonArrayProp<K extends DBJsonArrayKey> = DatabaseJson[K][number];

export class Database {
	private path = join(directories.saved, "database.json");
	private json:DatabaseJson = {
		version: process.env.WRAPPER_VER,
		assets: [],
		movies: [],
		movie_folders: [],
	};
	private static _instance:Database;

	constructor() {
		// create the file if it doesn't exist
		if (!existsSync(this.path)) {
			console.warn("Database doesn't exist! Creating...");
			this.save(this.json);

			try {
				this.refresh();
			} catch (e) {
				console.error("Something is extremely awfully horribly terribly preposterously crazily insanely madly wrong. You may be in a read-only system/admin folder.");
				process.exit(1);
			}
		}
		this.refresh();
		if (!this.json.version) {
			// wrapper versions prior to 2.1.0 don't store the database
			// version so we're going to be adding it and modifying things
			// as the database structure changes
			this.json.version = "2.0.0";
		}
		if (this.json.version == "2.0.0") {
			this.json.version = "2.1.0";
			this.json.movie_folders = [];
			this.save(this.json);
		}
		// just keep adding onto this as you change stuff
	}

	static get instance() {
		if (!Database._instance) {
			Database._instance = new Database();
		}
		return Database._instance;
	}

	/**
	 * refreshes this.json using the this.json in its current state
	 */
	private refresh() { // refresh the database vars
		const data = readFileSync(this.path);
		this.json = JSON.parse(data.toString());
	}

	/**
	 * saves this.json into the database.json file
	 * @param newData
	 */
	private save(newData:DatabaseJson) {
		try {
			writeFileSync(this.path, JSON.stringify(newData, null, "\t"));
		} catch (err) {
			console.error("Error saving DB:", err);
		}
	}

	/**
	 * deletes a field from the database
	 * @param from category to select from
	 * @param id id to look for
	 * @returns did it work or not
	 */
	delete(from:DBJsonArrayKey, id:string) {
		const object = this.get(from, id);
		if (object == false) {
			return false;
		}
		const index = object.index;

		this.json[from].splice(index, 1);
		this.save(this.json);
		return true;
	}

	/**
	 * returns an object from the database
	 * @param from category to select from
	 * @param id id to look for
	 * @returns returns object if it worked, false if it didn't
	 */
	get<K extends DBJsonArrayKey>(from:K, id:string): {
		data: DBJsonArrayProp<K>,
		index: number
	} | false {
		this.refresh();

		const category = this.json[from];
		let index:number;
		const object = category.find((i, ind) => {
			if (i.id == id) {
				index = ind;
				return true;
			}
		});
		if (!object) {
			return false;
		}

		return {
			data: object,
			index: index
		}
	}

	/**
	 * Adds another field to the database.
	 * @param into Category to insert into.
	 * @param data Data to insert.
	 */
	insert<K extends DBJsonArrayKey>(into:K, data:DBJsonArrayProp<K>) {
		this.refresh();
		this.json[into].unshift(data as (Folder & Asset) & Movie);
		this.save(this.json);
	}

	/**
	 * Returns the database.
	 * @param from Category to select from.
	 * @param where Parameters for each key.
	 */
	select<K extends DBJsonArrayKey>(
		from:K,
		where?:Record<string, string | string[]>
	):DBJsonArrayProp<K>[] {
		this.refresh();

		const category = this.json[from];
		const filtered = category.filter((val:Record<string, unknown>) => {
			for (const [key, value] of Object.entries(where || {})) {
				if (typeof value == "object") {
					return value.includes((val[key] || "").toString());
				}
				if (val[key] && val[key] != value) {
					return false;
				}
			}
			return true;
		});
		return filtered;
	}

	/**
	 * Updates a field from the database.
	 * @param from Category to select from.
	 * @param id Id to look for.
	 * @param data New data to save.
	 * @returns did it work or not
	 */
	update<K extends DBJsonArrayKey>(from:K, id:string, data:Partial<DBJsonArrayProp<K>>): boolean {
		const object = this.get(from, id);
		if (object == false) {
			return false;
		}
		const index = object.index;

		Object.assign(this.json[from][index], data);
		this.save(this.json);
		return true;
	}
};

/**
 * @summary generates a random id
 */
export function generateId() {
	return crypto.randomBytes(4).toString("hex");
}

export default Database.instance;
