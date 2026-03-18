import Directories from "../../storage/directories";
import fileUtil from "../utils/fileUtil.js";
import fs from "fs";
import http from "http";
import httpz from "@octanuary/httpz";
import { join } from "path";
import settings from "../../storage/settings";
import { charThumb, readStockCCChars } from "../staticServer";
import { Char } from "../models/char";

const STATIC_SERVER_HOST = process.env.STATIC_SERVER_HOST;
const STATIC_SERVER_PORT = process.env.STATIC_SERVER_PORT;
const STORE_URL = process.env.STORE_URL;
const THEME_FOLDER = Directories.store;
const group = new httpz.Group();

/**
 * returns a json representation of the themelist
 */
function parseThemeList() {
	const { truncatedThemeList } = settings;
	const xmlPath = join(
		THEME_FOLDER,
		truncatedThemeList ? "themelist.xml" : "themelist-allthemes.xml"
	);
	const listXml = fs.readFileSync(xmlPath).toString();

	const themeNodes = listXml.split("<theme").slice(1, -1);
	let themes = [];
	for (let node of themeNodes) {
		node = node.trim().slice(0, -2);
		let theme = {};
		for (const regEx of node.matchAll(/(\S+)="(.+?)"/g)) {
			theme[regEx[1]] = regEx[2].replace("&amp;", "&");
		}
		themes.push(theme);
	}
	return themes;
}

/*
list
*/
group.route("GET", "/api/theme/list", (req, res) => {
	const themeList = parseThemeList();
	res.json(themeList);
});
group.route("POST", "/goapi/getThemeList/", async (req, res) => {
	const truncated = settings.truncatedThemeList;
	const filepath = truncated ? 
		"themelist.xml" : 
		"themelist-allthemes.xml";
	const xmlPath = join(THEME_FOLDER, filepath);
	const zip = await fileUtil.zippy(xmlPath, "themelist.xml");
	res.setHeader("Content-Type", "application/zip");
	res.end(zip);
});

/*
load
*/
group.route("POST", "/goapi/getTheme/", async (req, res) => {
	const id = req.body.themeId as string | null;
	if (!id) {
		return res.status(400).json({ msg:"Expected parameter 'themeId' on the request body." });
	}

	const host = `${STATIC_SERVER_HOST}:${STATIC_SERVER_PORT}`;
	const path = `${STORE_URL}/${id}/${id}.zip`;
	http.get(host + path, (staticRes) => {
		staticRes.pipe(res)
	});
});
group.route("GET", "/api/theme/get_chars", async (req, res) => {
	const themeId = req.query.id as string | null;
	if (!themeId) {
		return res.status(400).json({ msg:"Expected parameter 'themeId'" });
	}

	const themeList = parseThemeList();
	const ccThemeId = themeList.find((t) => t.id == themeId).cc_theme_id;

	const bareChars = readStockCCChars(themeId);
	const chars:Char[] = bareChars.map((c) => {
		return {
			type: "char",
			title: c.name || "Untitled",
			tags: `${ccThemeId},_free,_cat:${c.category || "Stock characters"}`,
			themeId: ccThemeId,
			thumbnail: charThumb(c.id),
			id: c.id.toString()
		};
	})
	res.json(chars);
});

export default group;
