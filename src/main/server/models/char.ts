import Database, { generateId } from "../../storage/database";
import Directories from "../../storage/directories";
import fs from "fs";
import path from "path";

export type Char = {
	type: "char",
	subtype: "0",
	title: string,
	tags?: string,
	themeId: string,
	id: string,
};

export default class CharModel {
	static folder = Directories.asset;
	static baseThumbUrl = path.join(Directories.static, process.env.CHAR_BASE_URL);

	/**
	 * Tries to find a character in the _SAVED folder. If there's no match, it tries to find it in the character dump.
	 */
	static charXml(id:string): Buffer {
		try {
			try { // custom characters
				return fs.readFileSync(path.join(this.folder, `${id}.xml`));
			} catch (err) { // stock characters
				console.log(err);
				const nId = (id.slice(0, -3) + "000").padStart(9, "0");
				const chars = fs.readFileSync(path.join(this.baseThumbUrl, `${nId}.txt`));

				const line = chars
					.toString("utf8")
					.split("\n")
					.find((v) => v.substring(0, 3) == id.slice(-3));
				if (line) {
					return Buffer.from(line.substring(3));
				}
				throw "404";
			}	
		} catch (err) {
			console.log(err);
			throw "404";
		}
	}

	/**
	 * saves the character and its metadata
	 * @param xml a buffer of a character xml
	 * @param info character metadata
	 * @returns char id
	 */
	static save(xml:Buffer, info:Partial<Char>): string {
		// save asset info
		info.id ||= generateId();
		Database.insert("assets", info);

		// fix handheld props for v2 cc themes by inserting version="2.0"
		if (!this.isSkeleton(info.themeId) && xml.indexOf("version=\"2.0\"") == -1) {
			const end = xml.indexOf(">", xml.indexOf("<cc_char"));
			xml = Buffer.concat([
				xml.subarray(0, end),
				Buffer.from(" version=\"2.0\""),
				xml.subarray(end)
			]);
		}

		// save the file
		fs.writeFileSync(path.join(this.folder, `${info.id}.xml`), xml);
		return info.id;
	}

	/**
	 * saves a character thumbnail
	 * @param id the character id
	 * @param thumb a thumbnail of the character in PNG format
	 */
	static saveThumb(id:string, thumb:Buffer) {
		fs.writeFileSync(path.join(this.folder, `${id}.png`), thumb);
	}

	/**
	 * checks if a character exists
	 * @returns does it exist?
	 */
	static exists(id:string): boolean {
		try {
			this.charXml(id);
			return true;
		} catch (err) {
			return false;
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
