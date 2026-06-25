/*
feel so clean like a money machine
*/

import type { Asset, Prop } from "../models/asset";
import AssetModel from "../models/asset";
import { extensions, FileExtension, fromBuffer, fromFile, mimeTypes } from "file-type";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "@derhuerst/ffprobe-static";
import { File } from "formidable";
import fileTypes from "../data/allowed_file_types.json";
import fileUtil from "../utils/fileUtil";
import fs from "fs";
import httpz from "@octanuary/httpz";
import MovieModel, { Starter } from "../models/movie";
import { once } from "events";
import path from "path";
import { Readable } from "stream";
import { spawn } from "child_process";
import tempfile from "tempfile";

const group = new httpz.Group();

/*
delete
*/
group.route("POST", "/api_v2/asset/delete/", (req, res) => {
	const id = req.body.data.id || req.body.data.starter_id;
	if (typeof id == "undefined") {
		return res.status(400).json({ status:"error" });
	}

	try {
		const asset = AssetModel.getInfo(id) as Asset | Starter;
		if (asset.type == "movie") {
			MovieModel.delete(id);
		} else {
			AssetModel.delete(id);
		}
		res.json({ status:"ok" });
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({ status:"error" });
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({ status:"error" });
	}
});

/*
list
*/
group.route("GET", "/api/asset/list", (req, res) => {
	const filter = {
		type: ["bg", "prop", "sound"] as any as Asset["type"]
	};
	res.json(AssetModel.list(filter, false));
});
group.route("POST", "/api_v2/assets/imported", (req, res) => {
	if (!req.body.data.type) {
		return res.status(400).json({msg:"Expected data.type on request body."});
	}
	// filter out video props
	if (req.body.data.type == "prop") {
		req.body.data.subtype ||= "0";
	}

	const filters:Partial<Asset> = {
		type: req.body.data.type
	};
	if (
		req.body.data.subtype && 
		(filters.type == "prop" || filters.type == "sound")
	) filters.subtype = req.body.data.subtype;

	// what's even the point of this if it still uses an xml
	// it's dumb
	res.json({
		status: "ok",
		data: {
			xml: AssetModel.list(filters, true)
		}
	});
});
group.route("POST", "/goapi/getUserAssetsXml/", (req, res) => {
	if (req.body.type !== "char") {
		res.status(307).setHeader("Location", "/api_v2/assets/imported")
		return res.end();
	} else if (!req.body.themeId) {
		return res.status(400).end("1<error><code>malformed</code><message/></error>");
	}

	let themeId:string;
	switch (req.body.themeId) {
		case "custom":
			themeId = "family";
			break;
		case "action":
		case "animal":
		case "space":
		case "vietnam":
			themeId = "cc2";
			break;
		default:
			themeId = req.body.themeId;
	}
	const filters:Partial<Asset> = {
		themeId,
		type: "char"
	};
	// just a little workaround i did for getting character info when i was implementing the cc embed in the vm
	if (req.body.assetId && req.body.assetId !== "null") filters.id = req.body.assetId;

	res.setHeader("Content-Type", "application/xml");
	res.end(AssetModel.list(filters, true));
});

/*
load
*/
group.route("*", /^\/(assets|goapi\/getAsset)\/([\S]*)$/, (req, res, next) => {
	let id:string | void;
	switch (req.method) {
		case "GET":
			id = req.matches[2];
			break;
		case "POST":
			id = req.body.assetId;
			break;
		default:
			next();
			return;
	}
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
		const readStream = AssetModel.load(id, false);
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

/*
info
*/
// get
group.route("POST", "/api_v2/asset/get", (req, res) => {
	const id = req.body.data?.id ?? req.body.data?.starter_id;
	if (!id) {
		return res.status(404).json({status:"error"});
	}

	try {
		const info = AssetModel.getInfo(id);
		// add stuff that will never be useful in an offline lvm clone because the lvm needs it
		const extraInfo = {
			share: {type:"none"},
			published: ""
		}
		res.json({
			status: "ok",
			data: Object.assign(info, extraInfo),
		});
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({status:"error"});
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
	}
});
group.route("POST", "/goapi/getAssetTags", (_, r) => r.json([]));
group.route("POST", "/goapi/getLatestAssetId", (_, r) => r.end(0));
// update
group.route("POST", "/api_v2/asset/update/", (req, res) => {
	const id = req.body.data?.id ?? req.body.data?.starter_id ?? null;
	const title = req.body.data?.title ?? null;
	const tags = req.body.data?.tags ?? null;
	if (!id || title === null) {
		return res.status(400).json({status:"error"});
	}

	const update:Partial<Asset> = {
		title: title
	};
	if (tags) {
		update.tags = tags;
	}

	try {
		AssetModel.updateInfo(id, update);
		res.json({status:"ok"});
	} catch (e) {
		if (e == "404") {
			return res.status(404).json({status:"error"});
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({status:"error"});
	}
});

/*
save
*/
group.route("POST", "/api/asset/upload", async (req, res) => {
	if (ffprobePath === null || ffmpegPath === null) {
		return res.status(500).json({ msg:"FFmpeg could not be found" })
	}

	const file = req.files.import;
	if (
		typeof file == "undefined" ||
		typeof req.body.type == "undefined" ||
		typeof req.body.subtype == "undefined"
	) {
		return res.status(400).json({ msg:"Missing required parameters" });
	}

	const { filepath, originalFilename } = file;
	const filename = originalFilename ? path.parse(originalFilename).name : "Untitled";
	const ext = (await fromFile(filepath))?.ext;
	if (typeof ext === "undefined") {
		return res.status(400).json({ msg:"File type could not be determined" });
	}

	const asset:Partial<Asset> = {
		type: req.body.type,
		title: req.body.name || filename
	};

	try {
		if (
			asset.type == "prop" &&
			(asset.subtype = req.body.subtype) == "video"
		) {
			if (fileTypes.video.indexOf(ext) < 0) {
				throw 1;
			}

			const ffprobe = spawn(
				ffprobePath,
				[
					"-v", "quiet",
					"-print_format", "json",
					"-show_streams",
					filepath
				]
			);
			let data = "";
			ffprobe.stdout.on("data", (c) => {
				data += c;
			});
			ffprobe.stderr.on("data", (c) => {
				console.log("Error occurred using FFprobe:", c.toString());
				throw c.toString();
			});
			await once(ffprobe, "close");
			const fileInfo = JSON.parse(data);

			for (const stream of fileInfo.streams) {
				if (stream.width) {
					asset.width = stream.width;
				}
				if (stream.height) {
					asset.height = stream.height;
				}
				if (asset.width && asset.height) {
					break;
				}
			}

			const tempVidPath = tempfile(".flv");
			const tempThumbPath = tempfile(".png");
			const ffmpeg = spawn(
				ffmpegPath,
				[
					"-v", "error",
					"-i", filepath,
					tempVidPath,
					"-update", "true",
					"-frames:v", "1",
					"-vf", "scale=300:300:force_original_aspect_ratio=increase",
					tempThumbPath
				]
			);
			data = "";
			ffmpeg.stdout.on("data", (c) => {
				data += c;
			});
			await once(ffmpeg, "exit");
			if (data.length > 0) {
				console.log("Error occurred during video conversion:", data);
				throw data;
			}

			asset.id = await AssetModel.save(tempVidPath, "flv", asset);
			await AssetModel.saveThumb(tempThumbPath, asset.id, "png");

			fs.unlinkSync(tempVidPath);
			fs.unlinkSync(tempThumbPath);
		} else if (asset.type == "prop" || asset.type == "bg") {
			if (fileTypes.image.indexOf(ext) < 0) {
				throw 1;
			}

			if (asset.type == "prop") {
				const { ptype } = req.body;
				switch (ptype) {
					case "placeable":
					case "wearable":
					case "holdable":
						(asset as Prop).ptype = ptype;
					default:
						(asset as Prop).ptype = "placeable";
				}
			}

			if (ext == "swf") {
				asset.id = await AssetModel.save(filepath, ext, asset);
			} else {
				const args = ["-v", "error"];

				let toExt = "png";
				if (ext == "gif") {
					toExt = "swf";
				} else {
					args.push("-f", "image2");
				}

				args.push("-i", filepath);
				if (asset.type == "bg") {
					args.push("-vf", "scale=550:354:force_original_aspect_ratio=increase,crop=550:354");
				}
				const tempPath = tempfile("." + toExt);
				args.push(tempPath);

				const ffmpeg = spawn(ffmpegPath, args);
				let data = "";
				ffmpeg.stdout.on("data", (c) => {
					data += c;
				});
				await once(ffmpeg, "exit");
				if (data.length > 0) {
					console.log("Error occurred during image conversion:", data);
					throw data;
				}

				asset.id = await AssetModel.save(tempPath, toExt, asset);
				fs.unlinkSync(tempPath);
			}
		} else if (asset.type == "sound") {
			if (
				fileTypes.sound.indexOf(ext) < 0 &&
				fileTypes.video.indexOf(ext) < 0
			) {
				throw 1;
			}

			asset.subtype = req.body.subtype;
			if (ext != "mp3") {
				const temppath = tempfile(".mp3");
				await fileUtil.convertToMp3(filepath, ext, temppath);
				asset.duration = await fileUtil.mediaDuration(temppath) * 1e3;
				asset.id = await AssetModel.save(temppath, "mp3", asset);
				fs.unlinkSync(temppath);
			} else {
				asset.duration = await fileUtil.mediaDuration(filepath) * 1e3;
				asset.id = await AssetModel.save(filepath, "mp3", asset);
			}	
		}		
		res.json(asset);
	} catch (e) {
		if (e == 1) {
			return res.status(400).json({ msg:"Invalid file type" });
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({ status:"error" });
	}
})
group.route("POST", "/goapi/saveSound/", async (req, res) => {
	const bytes = req.body.bytes;
	if (
		(typeof bytes == "undefined" &&
			typeof req.files.Filedata == "undefined") ||
		typeof req.body.subtype == "undefined"
	) {
		return res.status(400).json({ msg:"Missing required parameters" });
	}

	let input:Buffer | string,
		ext:FileExtension | undefined;
	if (bytes) {
		input = Buffer.from(bytes, "base64");
		ext = (await fromBuffer(input))?.ext;
	} else {
		input = (req.files.Filedata as File).filepath;
		ext = (await fromFile(input))?.ext;
	}
	if (typeof ext === "undefined") {
		return res.status(400).json({ msg:"File type could not be determined" });
	}

	const asset:Partial<Asset> = {
		type: "sound",
		subtype: req.body.subtype,
		title: req.body.title
	};

	try {
		const ffInput = typeof input != "string" ?
			Readable.from(input) : input;
		let id: string;
		if (ext != "mp3") {
			const temppath = tempfile(".mp3");
			await fileUtil.convertToMp3(ffInput, ext, temppath);
			asset.duration = await fileUtil.mediaDuration(temppath) * 1e3;
			id = await AssetModel.save(temppath, "mp3", asset);
			fs.unlinkSync(temppath);
		} else {
			asset.duration = await fileUtil.mediaDuration(ffInput) * 1e3;
			id = await AssetModel.save(input, "mp3", asset);
		}
		res.end(
			`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>${asset.subtype}</subtype><title>${asset.title}</title><published>0</published><tags></tags><duration>${asset.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`
		);
	} catch (e) {
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
		res.status(500).json({ status:"error" });
		return;
	}
});

export default group;
