import type { Char } from "./char";
import directories from "../../storage/directories";
import fs from "fs";
import Database, { generateId } from "../../storage/database";
import type { Starter } from "./movie";
import path from "path";

type Sound = {
	type: "sound",
	subtype: "bgmusic" | "soundeffect" | "voiceover" | "tts",
	title: string,
	duration: number,
	id: string,
};
type Background = {
	type: "bg",
	subtype: "0",
	title: string,
	id: string,
};
type Watermark = {
	type: "watermark",
	subtype: "0",
	title: string,
	id: string,
};
type Prop = {
	type: "prop",
	subtype: "0",
	ptype: "placeable" | "headable" | "holdable" | "wearable",
	title: string,
	id: string,
};
type Video = {
	type: "prop",
	subtype: "video",
	title: string,
	duration: number,
	width: number,
	height: number,
	id: string,
};
export type Asset = Sound | Background | Watermark | Prop | Video | Char;

const header = process.env.XML_HEADER;

export default class AssetModel {
	static folder = directories.asset;

	/**
	 * Deletes an asset.
	 * @param id Asset ID
	 */
	static delete(id:string) {
		const asset = Database.get("assets", id);
		if (!asset) {
			throw "404";
		}
		Database.delete("assets", id);

		const { type, subtype } = asset.data;
		// char ids don't have a file extension so we'll need to add it
		if (type == "char") id += ".xml";
		fs.unlinkSync(path.join(this.folder, id));

		// delete video and char thumbnails
		if (
			type == "char" ||
			subtype == "video"
		) {
			const thumbId = id.slice(0, -3) + "png";
			fs.unlinkSync(path.join(this.folder, thumbId));
		}
	};

	/**
	 * Returns a buffer or stream. Throws an error if the asset doesn't exist.
	 */
	static load(id:string, returnBuffer:false): fs.ReadStream
	static load(id:string, returnBuffer:true): Buffer
	static load(id:string, returnBuffer = false): fs.ReadStream | Buffer {
		if (!this.exists(id)) {
			throw "404";
		}

		const filepath = path.join(this.folder, id);
		let data;
		if (returnBuffer) {
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
		let filters, returnXml;
		if (typeof param1 == "boolean") {
			filters = null;
			returnXml = param1 || false;
		} else if (typeof param1 == "object") {
			filters = param1;
			if (typeof param2 == "boolean") {
				returnXml = param2;
			}
		}

		const files = Database.select("assets", filters);
		if (returnXml) {
			return `${
				header
			}<ugc more="0">${
				files.map(this.meta2Xml).join("")
			}</ugc>`;
		}
		return files;
	};

	/**
	 * returns the info of an asset, throws 404 if it doesn't
	 * @param id Asset ID
	 */
	static getInfo(id:string): Asset {
		const info = Database.get("assets", id);
		if (info == false) {
			throw "404";
		}
		return info.data;
	}

	/**
	 * updates asset info, throws 404 if asset doesn't exist
	 */
	static updateInfo(id:string, info:Partial<Asset>): void {
		const success = Database.update("assets", id, info);
		if (!success) {
			throw "404";
		}
	}

	/**
	 * checks if an asset exists by its id
	 * @param id Asset ID
	 * @param checkDBInstead check using the database instead of the existence of a file
	 */
	static exists(id:string, checkDBInstead = false) {
		if (checkDBInstead) {
			const asset = Database.get("assets", id);
			return asset != false;
		}
		const filepath = path.join(this.folder, id);
		const exists = fs.existsSync(filepath);
		return exists;
	};

	/**
	 * converts an asset or starter object to a theme xml node
	 * @param v asset or starter object
	 * @returns theme xml node with the asset information
	 */
	static meta2Xml(v:Asset | Starter) {
		const apiServer = `${process.env.API_SERVER_HOST}:${process.env.API_SERVER_PORT}`;
		// sanitize stuff
		v.title = (v.title || "").replace(/"/g, "&quot;");

		let xml;
		switch (v.type) {
			case "char": {
				xml = `<char id="${v.id}" enc_asset_id="${v.id}" name="${v.title || "Untitled"}" cc_theme_id="${v.themeId}" thumbnail_url="${apiServer}/assets/${v.id}.png" copyable="Y"><tags>${v.tags || ""}</tags></char>`;
				break;
			}
			case "bg": {
				xml = `<background subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" asset_url="${apiServer}/assets/${v.id}"/>`
				break;
			}
			case "movie": {
				xml = `<movie id="${v.id}" enc_asset_id="${v.id}" numScene="${v.sceneCount}" title="${v.title}" thumbnail_url="${apiServer}/file/movie/thumb/${v.id}"><tags></tags></movie>`;
				break;
			}
			case "prop": {
				if (v.subtype == "video") {
					xml = `<prop subtype="video" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" placeable="1" facing="left" width="${v.width}" height="${v.height}" asset_url="${apiServer}/assets/${v.id}" thumbnail_url="${apiServer}/assets/${v.id.slice(0, -3) + "png"}"/>`;
				} else {
					xml = `<prop subtype="0" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" ${v.ptype}="1" facing="left" width="0" height="0" asset_url="${apiServer}/assets/${v.id}"/>`;
				}
				break;
			}
			case "sound": {
				xml = `<sound subtype="${v.subtype}" id="${v.id}" enc_asset_id="${v.id}" name="${v.title}" enable="Y" duration="${v.duration}" downloadtype="progressive"/>`;
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
			Database.insert("assets", info as Asset)

			let writeStream = fs.createWriteStream(path.join(this.folder, info.id));
			if (Buffer.isBuffer(data)) { // 
				writeStream.write(data, (e) => {
					if (e && e != null) return rej(e);
					res(info.id);
				});
			} else { // stream
				if (typeof data == "string") { // file path
					data = fs.createReadStream(data);
					data.pause();
				}
				data.resume();
				data.pipe(writeStream);
				// wait for the stream to end
				data.on("end", () => res(info.id));
			}
		});
	};
};
