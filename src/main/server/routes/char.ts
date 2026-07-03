import CharModel, { Char } from "../models/char.js";
import Database from "../../storage/database";
import fs from "fs";
import httpz from "@octanuary/httpz";

const API_SERVER = `${process.env.API_SERVER_HOST}:${process.env.API_SERVER_PORT}`;
const base = Buffer.alloc(1, "0");
const group = new httpz.Group();

group.route("GET", "/api/char/list", (req, res) => {
	res.log("Retrieving character list...")
	let filter:Partial<Char> = {
		type: "char"
	};
	Object.assign(filter, req.query);
	const chars = Database
		.select("assets", filter)
		.map((c:any) => {
			c.thumbnail = `${API_SERVER}/assets/${c.id}.png`;
			return c;
		});
	return res.json(chars);
});

group.route("POST", "/goapi/getCcCharCompositionXml/", async (req, res) => {
	const id = req.body.assetId;
	if (typeof id == "undefined") {
		return res.status(400).end("Missing one or more fields.");
	}

	res.log(`Loading character #${id}...`);
	try {
		const buf = await CharModel.load(id);
		res.setHeader("Content-Type", "application/xml");
		res.end(Buffer.concat([base, buf]));
	} catch (e) {
		if (e instanceof RangeError) {
			res.log("But nobody came.");
			return res.status(404).end("1");
		}
		res.log("Failed to load character. Error:" + e);
		res.status(500).end("1");
	}
});

group.route("POST", "/goapi/saveCCCharacter/", (req, res) => {
	if (!req.body.body || !req.body.thumbdata || !req.body.themeId) {
		return res.status(400).end("Missing one or more fields.");
	}
	const body = Buffer.from(req.body.body);
	const thumb = Buffer.from(req.body.thumbdata, "base64");
	let name:string;
	if (req.body.name) {
		name = (req.body.name as string).trim().slice(0, 100);
	} else {
		name = "Untitled";
	}

	const meta = {
		type: "char" as const,
		title: name,
		theme: req.body.themeId as string
	};
	try {
		res.log("Saving character...");
		const id = CharModel.save(body, meta);
		CharModel.saveThumb(id, thumb);
		res.log("Successfully saved character #" + id);
		res.end("0" + id);
	} catch (e) {
		res.log("Error saving character: " + e);
	}
});

group.route("POST", "/goapi/saveCCThumbs/", (req, res) => {
	const id = req.body.assetId;
	if (typeof id == "undefined" || !req.body.thumbdata) {
		return res.status(400).end("1");
	}
	const thumb = Buffer.from(req.body.thumbdata, "base64");

	if (CharModel.exists(id)) {
		CharModel.saveThumb(id, thumb);
		res.end("0" + id);
	} else {
		res.end("1");
	}
});

group.route("POST", "/api/char/upload", (req, res) => {
	const file = req.files.import;
	if (!file) {
		return res.status(400).json({ msg:"No file" });
	} else if (file.mimetype !== "text/xml") {
		return res.status(400).json({ msg:"Character is not an XML" });
	}
	const origName = file.originalFilename?.trim()?.slice(0, 100);
	const path = file.filepath,
		buffer = fs.readFileSync(path);

	const meta = {
		type: "char" as const,
		name: origName || "Untitled",
		theme: CharModel.getThemeId(buffer)
	};
	try {
		CharModel.save(buffer, meta);
		fs.unlinkSync(path);
		const url = `/cc_browser?themeId=${meta.theme}`;
		res.redirect(url);
	} catch (e) {
		res.log("Error uploading character:" + e);
		res.status(500).end();
	}
});

export default group;
