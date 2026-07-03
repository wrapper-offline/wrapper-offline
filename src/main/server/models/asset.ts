import type { Char } from "./char";
import directories from "../../storage/directories";
import fs from "fs";
import Database, { generateId } from "../../storage/database";
import path from "path";

export interface Sound {
	type: "sound",
	subtype: "bgmusic" | "soundeffect" | "voiceover" | "tts",
	id: string,
	duration: number,
	name: string,
	tags?: string,
};
export interface Background {
	type: "bg",
	id: string,
	name: string,
	tags?: string,
};
export interface Prop {
	type: "prop",
	subtype: "0",
	ptype: "placeable" | "headable" | "holdable" | "wearable",
	id: string,
	name: string,
	tags?: string,
};
export interface Video {
	type: "prop",
	subtype: "video",
	id: string,
	duration: number,
	width: number,
	height: number,
	name: string,
	tags?: string,
};
export type Asset = Sound | Background | Prop | Video | Char;

const API_SERVER = `${process.env.API_SERVER_HOST}:${process.env.API_SERVER_PORT}`;
const XML_HEADER = process.env.XML_HEADER as string;

export default class AssetModel {
	static folder = directories.asset;

	/**
	 * Deletes an asset.
	 * @param id Asset ID
	 */
	static delete(id:string) {
		const asset = Database.get("assets", id);
		Database.delete("assets", id);

		const type = asset.type;
		// char ids don't have a file extension so we'll need to add it
		if (type == "char") id += ".xml";
		fs.unlinkSync(path.join(this.folder, id));

		// delete video and char thumbnails
		if (
			type == "char" ||
			(type == "prop" && asset.subtype == "video")
		) {
			const thumbId = id.slice(0, -3) + "png";
			fs.unlinkSync(path.join(this.folder, thumbId));
		}
	};

	/**
	 * loads an asset file
	 * @param filename name of the file to load
	 * @param asBuffer return a buffer instead of a readstream
	 * @throws {RangeError} asset does not exist
	 */
	static load(filename:string, asBuffer?:false): fs.ReadStream
	static load(filename:string, asBuffer:true): Buffer
	static load(filename:string, asBuffer = false): fs.ReadStream | Buffer {
		const filepath = path.join(this.folder, filename);
		if (!fs.existsSync(filepath)) {
			throw new RangeError("Asset does not exist FUCK YOU");
		}
		let data;
		if (asBuffer) {
			data = fs.readFileSync(filepath);
		} else {
			data = fs.createReadStream(filepath);
		}
		return data;
	};

	/**
	 * returns an array of assets 
	 * @param filters object containing all properties an asset object should have
	 * @param returnXml if true, returns a ugc theme xml instead of an array of `Asset`s
	 */
	static list(filters:Partial<Asset>, returnXml:true): string
	static list(filters:Partial<Asset>, returnXml:false): Asset[]
	static list(returnXml:true): string
	static list(returnXml:false): Asset[]
	static list(param1?:boolean|Partial<Asset>, param2?:boolean) {
		let filters:Partial<Asset> | undefined, 
			returnXml:boolean = false;
		if (typeof param1 == "boolean") {
			returnXml = param1 || false;
		} else if (typeof param1 == "object") {
			filters = param1;
			if (typeof param2 == "boolean") {
				returnXml = param2;
			}
		}

		const files = Database.select("assets", filters);
		console.log(filters)
		if (returnXml) {
			return `${
				XML_HEADER
			}<ugc more="0">${
				files.map(this.meta2Xml).join("")
			}</ugc>`;
		}
		return files;
	};

	/**
	 * returns the info of an asset, throws 404 if it doesn't
	 * @param id asset id
	 * @throws {RangeError} asset doesn't exist
	 */
	static properties(id:string): Asset {
		return Database.get("assets", id);
	}

	/**
	 * updates asset info, throws 404 if asset doesn't exist
	 * @param id asset id
	 * @param properties properties to save
	 * @throws {RangeError} asset doesn't exist
	 */
	static updateProperties(id:string, properties:Partial<Asset>) {
		Database.update("assets", id, properties);
	}

	/**
	 * checks if an asset exists by its id
	 * @param id Asset ID
	 */
	static exists(id:string) {
		return Database.exists("assets", id);
	};

	/**
	 * converts an asset object to a theme xml node
	 * @param v asset object
	 * @returns theme xml node with the asset information
	 */
	static meta2Xml(v:Asset) {
		// sanitize stuff
		v.name = (v.name || "").replace(/"/g, "&quot;");

		let xml;
		switch (v.type) {
			case "char": {
				xml = `<char id="${v.id}" enc_asset_id="${v.id}" name="${v.name || "Untitled"}" cc_theme_id="${v.theme}" thumbnail_url="${API_SERVER}/assets/${v.id}.png" copyable="Y"><tags>${v.tags || ""}</tags></char>`;
				break;
			}
			case "bg": {
				xml = `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.name}" enable="Y" asset_url="${API_SERVER}/assets/${v.id}"/>`
				break;
			}
			// case "movie": {
			// 	xml = `<movie id="${v.id}" enc_asset_id="${v.id}" numScene="${v.sceneCount}" title="${v.title}" thumbnail_url="${apiServer}/file/movie/thumb/${v.id}"><tags></tags></movie>`;
			// 	break;
			// }
			case "prop": {
				if (v.subtype == "video") {
					xml = `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.name}" enable="Y" placeable="1" facing="left" width="${v.width}" height="${v.height}" asset_url="${API_SERVER}/assets/${v.id}" thumbnail_url="${API_SERVER}/assets/${v.id.slice(0, -3) + "png"}"/>`;
				} else {
					xml = `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.name}" enable="Y" ${v.ptype}="1" facing="left" width="0" height="0" asset_url="${API_SERVER}/assets/${v.id}"/>`;
				}
				break;
			}
			case "sound": {
				xml = `<sound subtype="${v.subtype}" id="${v.id}" enc_asset_id="${v.id}" name="${v.name}" enable="Y" duration="${v.duration}" downloadtype="progressive"/>`;
				break;
			}
			default: {
				throw new Error("Asset type is invalid.");
			}
		}
		return xml;
	};

	/**
	 * Saves an asset.
	 * @param data read stream, buffer, or file path
	 * @param idOrExt asset file extension, or a predetermined id including the ext
	 * @param info information about the asset. id, name, type, etc
	 */
	static save(
		data:fs.ReadStream | Buffer | string,
		idOrExt:string,
		info:Partial<Asset>
	): Promise<string> {
		return new Promise((res, rej) => {
			if (idOrExt.includes(".")) {
				info.id = idOrExt;
			} else {
				info.id = `${generateId()}.${idOrExt}`;
			}
			const asset = info as Asset;
			Database.insert("assets", asset)

			let writeStream = fs.createWriteStream(path.join(this.folder, asset.id));
			if (Buffer.isBuffer(data)) { // 
				writeStream.write(data, (e) => {
					if (e && e != null) return rej(e);
					res(asset.id);
				});
			} else { // stream
				if (typeof data == "string") { // file path
					data = fs.createReadStream(data);
					data.pause();
				}
				data.resume();
				data.pipe(writeStream);
				// wait for the stream to end
				data.on("end", () => res(asset.id));
			}
		});
	};

	/**
	 * saves the thumbnail of an asset
	 * @param thumbPath thumbnail path
	 * @param id asset id
	 * @param ext thumbnail file extension
	 */
	static saveThumb(thumbPath:string, id:string, ext:string): Promise<void> {
		return new Promise((res, rej) => {
			if (id.indexOf(".") > -1) {
				id = id.split(".")[0];
			}
			const newPath = path.join(this.folder, `${id}.${ext}`);
			const writeStream = fs.createWriteStream(newPath);
			const readStream = fs.createReadStream(thumbPath);
			readStream.pipe(writeStream);
			readStream.on("end", () => {
				readStream.destroy();
				res();
			});
			readStream.on("error", (e) => {
				console.error("Error reading", thumbPath, e);
				rej(e);
			});
		});
	}
};
