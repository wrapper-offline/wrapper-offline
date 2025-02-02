import directories from "../../storage/directories";
import database, { generateId } from "../../storage/database";
import fs from "fs";
import { join } from "path";
import Parse from "../utils/movieParser.js";

export type Movie = {
	duration: string,
	date: string,
	title: string,
	sceneCount: number,
	watermark?: string,
	id: string,
};
export type Starter = {
	type: "movie",
	duration: string,
	date: string,
	title: string,
	sceneCount: number,
	id: string,
};

export default class MovieModel {
	static folder = directories.saved;

	/**
	 * deletes a movie do i really have to explain this to you
	 * @param id movie id
	 */
	static delete(id:string): Promise<void> {
		return new Promise((res, rej) => {
			// if movie delete from movies, if starter delete from assets
			if (database.get("movies", id)) {
				database.delete("movies", id);
			} else if (database.select("assets", {
				id: id,
				type: "movie"
			}).length > 0) {
				database.delete("assets", id);
			} else {
				return rej("404");
			}

			fs.unlinkSync(join(this.folder, id + ".xml"));
			fs.unlinkSync(join(this.folder, id + ".png"));
			res();
		});
	}

	/**
	 * packs a movie into a zip to be loaded by the videomaker
	 * @param id movie id
	 * @returns zip file containing the movie
	 */
	static async packMovie(id:string): Promise<Buffer> {
		if (!this.exists(id)) {
			throw "404";
		} 
		const filepath = join(this.folder, id);
		const xml = fs.readFileSync(filepath + ".xml");
		const thumbnail = fs.readFileSync(filepath + ".png");
		const zipped = await Parse.pack(xml, thumbnail);
		return zipped;
	}

	/*
	extraction
	*/

	/**
	 * extracts audio information from a movie xml
	 * @param id movie id
	 * @returns list of objects representing audio clips and how they
	 * should be played
	 */
	static async extractAudioTimes(id:string): Promise<{
		filepath: string,
		start: number,
		stop: number,
		trimStart: number,
		trimEnd: number,
		fadeIn: {
			duration: number;
			vol: number;
		},
		fadeOut: {
			duration: number;
			vol: number;
		}
	}[]> {
		if (!this.exists(id)) {
			throw "404";
		}
		const filepath = join(this.folder, `${id}.xml`);
		const xml = fs.readFileSync(filepath);
		const audio = await Parse.extractAudioTimes(xml);
		return audio;
	}

	/**
	 * Gets movie metadata from an XML.
	 * @param id movie id
	 * @returns movie information 
	 */
	static async extractMeta(id:string): Promise<{
		date: Date,
		durationString: string,
		duration: number,
		sceneCount?: number,
		title: string,
		id: string
	}> {
		const filepath = join(this.folder, `${id}.xml`);
		if (!fs.existsSync(filepath)) {
			throw "404";
		}
		const buffer = fs.readFileSync(filepath);

		// title
		const title = buffer.subarray(
			buffer.indexOf("<title>") + 16,
			buffer.indexOf("]]></title>")
		).toString().trim();

		// get the duration string
		const durBeg = buffer.indexOf('duration="') + 10;
		const duration = Number.parseFloat(buffer.subarray(
			durBeg,
			buffer.indexOf('"', durBeg)
		).toString().trim());
		const min = ('' + ~~(duration / 60)).padStart(2, '0');
		const sec = ('' + ~~(duration % 60)).padStart(2, '0');
		const durationStr = `${min}:${sec}`;

		let count = 0;
		let pos = buffer.indexOf('<scene id=');
		while (pos > -1) {
			count++;
			pos = buffer.indexOf('<scene id=', pos + 10);
		}

		return {
			id,
			duration,
			title,
			date: fs.statSync(filepath).mtime,
			durationString: durationStr,
			sceneCount: count,
		};
	}

	/**
	 * what do you think
	 * @param xml the movie xml
	 * @param thumb movie thumbnail in .png format
	 * @param id movie id, if overwriting an old one
	 * @param saveAsStarter
	 * @returns movie id
	 */
	static async save(
		xml:Buffer,
		thumbnail:Buffer,
		id:string,
		saveAsStarter:boolean
	): Promise<string> {
		return new Promise((res, rej) => {
			const newMovie = !id;
			if (!newMovie && !this.exists(id)) {
				return rej("404");
			}
			id ||= generateId();

			if (thumbnail) {
				fs.writeFileSync(join(this.folder, id + ".png"), thumbnail);
			}
			fs.writeFileSync(join(this.folder, id + ".xml"), xml);

			this.extractMeta(id).then((meta) => {
				// cat meoww x3
				let dbCat:"assets"|"movies";
				const info:Movie|Starter = {
					id: id,
					duration: meta.durationString,
					date: meta.date.toISOString(),
					title: meta.title,
					sceneCount: meta.sceneCount,
				};
				if (
					// new starter
					(newMovie && saveAsStarter) ||
					database.select("assets", {
						id: id,
						type: "movie"
					}).length > 0
				) {
					(info as Starter).type = "movie";
					dbCat = "assets";
				} else {
					dbCat = "movies";
				}
				if (!database.update(dbCat, id, info)) {
					console.log("Models.movie#save: Inserting movie into database...");
					database.insert(dbCat, info);
				}
				res(id);
			});
		});
	}

	/**
	 * checks if a movie exists
	 * @param id movie id
	 * @returns whether it exists or not
	 */
	static exists(id:string): boolean {
		if (
			!database.get("movies", id) &&
			database.select("assets", {
				id: id,
				type: "movie"
			}).length <= 0
		) {
			return false;
		}
		return true;
	}

	/**
	 * returns a movie thumbnail stream. throws "404" if movie doesn't exist
	 * @param id movie id
	 */
	static thumb(id:string) {
		// look for match in folder
		const filepath = join(this.folder, `${id}.png`);
		if (fs.existsSync(filepath)) {
			const readStream = fs.createReadStream(filepath);
			return readStream;
		} else {
			throw "404";
		}
	}

	/**
	 * unpacks a movie zip
	 * @param body zip containing the movie and its assets
	 * @param isStarter is the movie being uploaded as a starter
	 * @returns movie id
	 */
	static upload(body:Buffer, isStarter = false): Promise<string> {
		return new Promise(async (res, rej) => {
			const id = generateId();
			const [xml, thumb] = await Parse.unpack(body);

			fs.writeFileSync(join(this.folder, `${id}.xml`), xml);
			fs.writeFileSync(join(this.folder, `${id}.png`), thumb);
			this.extractMeta(id).then((meta) => {
				let dbCategory:string;
				const info:Starter|Movie = {
					id,
					duration: meta.durationString,
					date: meta.date.toISOString(),
					title: meta.title,
					sceneCount: meta.sceneCount,
				};
				if (isStarter) {
					(info as Starter).type = "movie";
					dbCategory = "assets";
				} else {
					dbCategory = "movies";
				}

				database.insert(dbCategory, info);
				res(id);
			});
		});
	}
};
