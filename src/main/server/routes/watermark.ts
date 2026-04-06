import { unlinkSync } from "fs";
import Database from "../../storage/database.js";
import fileTypes from "../data/allowed_file_types.json";
import { extensions, FileExtension, fromFile, mimeTypes } from "file-type";
import { Group } from "@octanuary/httpz";
import MovieModel from "../models/movie.js";
import Settings from "../../storage/settings.js";
import WatermarkModel from "../models/watermark.js";
import tempfile from "tempfile";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";
import { once } from "events";

const APP_WATERMARK_ID = "0vTLbQy9hG7k";
const NO_WATERMARK_ID = "0dhteqDBt5nY";
const url = `${process.env.API_SERVER_HOST}:${process.env.API_SERVER_PORT}`;
const XML_HEADER = process.env.XML_HEADER;
const group = new Group();

/*
assign
*/
group.route("POST", /\/goapi\/assignwatermark\/movie\/([\S]+)\/([\S]+)/, (req, res) => {
	const mId = req.matches[1];
	let wId = req.matches[2];

	if (wId == NO_WATERMARK_ID) { // reset the wm if it's the none id
		wId = undefined;
	} else if (wId != APP_WATERMARK_ID && !WatermarkModel.exists(wId)) {
		return res.status(404).end("1Watermark does not exist");
	}

	if (MovieModel.setWatermark(mId, wId)) {
		res.end("0");
		res.log(`Watermark #${wId} assigned to movie #${mId}`);
	} else {
		res.status(404).end("1Movie does not exist");
	}
});
group.route("POST", "/api/watermark/set_default", (req, res) => {
	let id = req.body.id;

	if (typeof id == "undefined") {
		id = "none";
	} else if (id != APP_WATERMARK_ID && !WatermarkModel.exists(id)) {
		return res.status(404).json({ msg:"watermark not exist!" });
	}

	Settings.defaultWatermark = id;
	res.end();
	res.log("Default watermark set to #" + id);
});

/*
list
*/
group.route("GET", "/api/watermark/list", (req, res) => {
	const list = WatermarkModel.list().map((w:any) => {
		w.thumbnail = `${url}/watermarks/${w.id}`;
		return w;
	});
	res.json(list);
});
group.route("POST", "/goapi/getUserWatermarks/", (req, res) => {
	let wId = null;
	const mId = req.body.movieId;
	if (mId) {
		const movie = Database.get("movies", mId);
		if (!movie) {
			return res.status(404).end();
		}
		wId = movie.data.watermark;
	} else {
		const { defaultWatermark } = Settings;
		wId = defaultWatermark ? defaultWatermark : null;
	}

	const list = WatermarkModel.list();
	res.setHeader("Content-Type", "application/xml");
	res.end(`${XML_HEADER}<watermarks>${
		list.map((w) => `<watermark id="${w.id}" thumbnail="${url}/watermarks/${w.id}"/>`).join("")
	}${wId !== null ? `<preview>${wId}</preview>` : ""}</watermarks>`);
});

/*
load
*/
group.route("GET", /^\/watermarks\/([\S]*)$/, (req, res) => {
	let id = req.matches[1];
	if (!id) {
		return res.status(400).end();
	}

	try {
		const ext = (id.split(".")[1] || "xml") as FileExtension;
		const extensionIndex = [...extensions].indexOf(ext);
		if (extensionIndex < 0) {
			return res.status(400).end();
		}
		const mime = [...mimeTypes][extensionIndex];
		const readStream = WatermarkModel.load(id);
		res.setHeader("Content-Type", mime);
		readStream.pipe(res);
	} catch (e) {
		if (e == "404") {
			return res.status(404).end();
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).end();
	}
});
group.route("POST", "/goapi/getMovieInfo/", (req, res) => {
	const mId = req.body.movieId;
	const movie = Database.get("movies", mId);
	if (!movie) {
		return res.status(400).end("1Movie not found.");
	}

	const wId = movie.data.watermark;
	res.setHeader("Content-Type", "application/xml");
	res.end(`${XML_HEADER}<watermarks>${
		typeof wId == "undefined" ?
			// no watermark
			`<watermark style="octanuary"/>` : wId == APP_WATERMARK_ID ?
				// default watermark
				"" :
				// custom watermark
				`<watermark>${url}/watermarks/${wId}</watermark>`
	}</watermarks>`);
});

/*
save
*/
group.route("POST", "/api/watermark/save", async (req, res) => {
	if (WatermarkModel.list().length >= 20) {
		return res.status(400).json({ msg:"Maximum # of watermarks reached" });
	}

	const file = req.files.image;
	if (typeof file === "undefined") {
		return res.status(400).json({ msg:"Missing required parameters" });
	}

	let id = req.body.id;
	const { filepath } = file;
	const ext = (await fromFile(filepath))?.ext;
	if (typeof ext === "undefined") {
		return res.status(400).json({ msg:"File type could not be determined" });
	}

	if (fileTypes.image.indexOf(ext) < 0) {
		return res.status(400).json({ msg:"Invalid file type" });
	}

	if (ext == "swf") {
		id = await WatermarkModel.save(filepath, ext, id);
	} else {
		let toExt = "png";
		if (ext == "gif") {
			toExt = "swf";
		}

		const args = ["-v", "error", "-i", filepath];
		const tempPath = tempfile("." + toExt);
		args.push(tempPath);

		const ffmpeg = spawn(ffmpegPath, args);
		let data = "";
		ffmpeg.stdout.on("data", (c) => {
			data += c;
		});
		await once(ffmpeg, "exit");
		if (data.length > 0) {
			console.log("Error occurred during video conversion:", data);
			throw data;
		}

		id = await WatermarkModel.save(tempPath, toExt, id);
		unlinkSync(tempPath);
	}

	res.log("Saved watermark #" + id);
	res.json({
		id,
		thumbnail: `${url}/watermarks/${id}`
	});
});

/*
delete
*/
group.route("POST", "/api/watermark/delete", (req, res) => {
	const id = req.body.id;
	if (typeof id == "undefined") {
		return res.status(404).json({ msg:"Missing required fields" });
	}

	if (Settings.defaultWatermark == id) {
		Settings.defaultWatermark = "none";
	}

	WatermarkModel.delete(id);
	res.end();
	res.log("Deleted watermark #" + id);
});

export default group;
