import { once } from "events";
import Database, { generateId } from "../../storage/database";
import Directories from "../../storage/directories";
import fs from "fs";
import http from "http";
import { join } from "path";

export interface Char {
	type: "char",
	id: string,
	theme: string,
	name: string,
	tags?: string,
};

const STATIC_SERVER_HOST = process.env.STATIC_SERVER_HOST as string;
const STATIC_SERVER_PORT = process.env.STATIC_SERVER_PORT as string;
const CHAR_BASE_URL = process.env.CHAR_BASE_URL as string;

export default class CharModel {
	static folder = Directories.asset;

	/**
	 * returns a character's body xml. looks for a custom character,
	 * then checks for a stock character if it fails.
	 * @throws {RangeError} if the character doesn't exist
	 */
	static async load(id:string): Promise<Buffer> {
		const customPath = join(this.folder, `${id}.xml`);
		if (fs.existsSync(customPath)) {
			return fs.readFileSync(customPath);
		}

		const nId = (id.slice(0, -3) + "000").padStart(9, "0");
		const host = `${STATIC_SERVER_HOST}:${STATIC_SERVER_PORT}`;
		const path = `${CHAR_BASE_URL}/${nId}.txt`;
		const chars = await new Promise<Buffer>((resolve, reject) => {
			http.get(host + path, async (res) => {
				if (res.statusCode != 200) {
					return reject("404");
				}
				try {
					const buffers:Buffer[] = [];
					res.on("data", (c) => buffers.push(c));
					await once(res, "end");
					resolve(Buffer.concat(buffers));
				} catch (e) {
					throw e;
				}
			}).on("error", reject);
		});

		const line = chars
			.toString("utf8")
			.split("\n")
			.find((v) => v.substring(0, 3) == id.slice(-3));
		if (line) {
			return Buffer.from(line.substring(3));
		}
		throw new RangeError("dosen'tse sdf sfsdfsds");
	}

	/**
	 * saves the character and its metadata
	 * @param xml character body xml
	 * @param info metadata
	 * @returns char id
	 */
	static save(
		xml:Buffer,
		info:Pick<Char, "theme"> & Partial<Char>
	): string {
		const charInfo:Char = {
			type: "char",
			id: info.id || generateId(),
			theme: info.theme,
			name: info.name || "Untitled"
		};
		Database.insert("assets", charInfo);

		// fix handheld props for v2 cc themes by inserting version="2.0"
		if (!this.isSkeleton(charInfo.theme) && xml.indexOf("version=\"2.0\"") == -1) {
			const end = xml.indexOf(">", xml.indexOf("<cc_char"));
			xml = Buffer.concat([
				xml.subarray(0, end),
				Buffer.from(" version=\"2.0\""),
				xml.subarray(end)
			]);
		}

		// save the file
		fs.writeFileSync(join(this.folder, charInfo.id + ".xml"), xml);
		return charInfo.id;
	}

	/**
	 * saves a character thumbnail
	 * @param id the character id
	 * @param thumb a thumbnail of the character in PNG format
	 */
	static saveThumb(id:string, thumb:Buffer) {
		fs.writeFileSync(join(this.folder, `${id}.png`), thumb);
	}

	/**
	 * checks if a character exists
	 * @returns does it exist?
	 */
	static exists(id:string): boolean {
		try {
			this.load(id);
			return true;
		} catch (e) {
			if (e instanceof RangeError)
				return false;
			throw e;
		}
	}

	/**
	 * Looks for a theme in a character XML.
	 * @param charXml XML of the character to save
	 * @returns theme id
	 */
	static getThemeId(charXml:Buffer) {
		const beg = charXml.indexOf(`theme_id="`) + 10;
		const end = charXml.indexOf(`"`, beg);
		return charXml.subarray(beg, end).toString();
	}

	/**
	 * checks if a cc_theme is a skeleton theme
	 */
	static isSkeleton(themeId:string) {
		switch (themeId) {
			case "cctoonadventure":
			case "family":
				return true;
		}
		return false;
	}
};
