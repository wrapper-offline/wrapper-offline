import fs from "fs";
import httpz from "@octanuary/httpz";
import Database from "../../../shared/storage/database.js";
import MovieModel from "../models/movie.js";
import nodezip from "node-zip";

const group = new httpz.Group();

/*
redirects
*/
// go_full (tutorial)
group.route("*", /\/videomaker\/full\/(\w+)\/tutorial$/, (req, res) => {
	const theme = req.matches[1];
	res.redirect(`/go_full?tray=${theme}&tutorial=0`);
});
// video list
group.route("GET", "/dashboard/videos", (req, res) => {
	res.redirect("/videos");
});

/*
thumbs
*/
group.route("*", /\/file\/movie\/thumb\/([^/]+)$/, (req, res) => {
	const id = req.matches[1];

	try {
		const readStream = MovieModel.thumb(id);
		res.setHeader("Content-Type", "image/png");
		readStream.pipe(res); 
	} catch (err) {
		if (err == "404") {
			return res.status(404).end();
		}
		console.log(req.parsedUrl.pathname, "failed. Error:", err);
		res.status(500).end();
	}
});

/*
info
*/
group.route("GET", "/api/movie/get_info", (req, res) => {
	const id = req.query.id;
	if (!id) {
		return res.status(400).json({msg:"Movie ID missing."});
	}

	const movie = Database.get("movies", id)
	if (movie) {
		res.json(movie.data);
	} else {
		res.status(404).json({msg:"Movie not found."});
	}
});

/*
list
*/
// movies
group.route("GET", "/api/movie/list", (req, res) => {
	if (!req.query.type) {
		return res.status(400).json({msg:"Expected type parameter"});
	}
	switch (req.query.type) {
		case "starter":
			return res.json(Database.select("assets", { type: "movie" }));
		case "movie":
		default:
			return res.json(Database.select("movies"));
	}
});

/*
delete
*/
group.route("GET", /\/api\/movie\/delete\/([^/]+)$/, async (req, res) => {
	const id = req.matches[1];
	console.log(`${req.parsedUrl.pathname}: Deleting movie #${id}...`);
	MovieModel.delete(id).then(() => {
		console.log(`${req.parsedUrl.pathname}: Successfully deleted movie #${id}.`);
		res.end();
	}).catch((err) => {
		if (err == "404") {
			return res.status(404).json({ msg: "Movie doesn't exist." });
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", err);
		res.status(500).json({ msg: "Internal server error." });
	});
});

/*
upload
*/
group.route("POST", "/api/movie/upload", (req, res) => {
	const file = req.files.import;
	const isStarter = req.body.is_starter;
	if (typeof file == "undefined") {
		return res.status(400).json({ msg: "No file." });
	}

	const path = file.filepath, buffer = fs.readFileSync(path);
	if (
		file.mimetype !== "application/x-zip-compressed" &&
		file.mimetype !== "application/zip" &&
		!buffer.subarray(0, 4).equals(
			Buffer.from([0x50, 0x4b, 0x03, 0x04])
		)
	) {
		return res.status(400).json({ msg: "Movie is not a zip." });
	}

	MovieModel.upload(buffer, isStarter).then((id) => {
		fs.unlinkSync(path);
		res.json({ id: id });
	}).catch((err) => {
		console.error("Controllers.movie#upload error:", err);
		res.status(500).json({ msg: null });
	});
});

/*
pack
*/
group.route(
	"*",
	/^\/file\/movie\/file\/([^/]+)|\/goapi\/getMovie\/$/,
	(req, res) => {
		const isPost = req.method == "POST";
		const id = req.body.movieId = isPost ?
			req.query.movieId :
			req.matches[1];
		if (typeof id == "undefined") {
			return res.status(400).end("ID not specified.");
		}

		MovieModel.packMovie(id).then((zipped) => {
			if (isPost) {
				zipped = Buffer.concat([Buffer.alloc(1, 0), zipped]);
			}
			res.setHeader("Content-Type", "application/zip");
			res.end(zipped);
		}).catch((err) => {
			if (err == "404") {
				return res.status(404).end("Movie doesn't exist.");
			}
			console.error("Controllers.movie#pack error:", err);
			res.status(500).end("Internal server error.");
		});
	}
);

/*
save
*/
group.route("POST", ["/goapi/saveMovie/", "/goapi/saveTemplate/"], (req, res) => {
	if (!req.body.body_zip) {
		return res.status(400).end("Expected body_zip field");
	}
	const trigAutosave = req.body.is_triggered_by_autosave;
	// make sure we're autosaving an existing movie
	if (trigAutosave && !req.body.movieId) {
		return res.end("0"); // lie
	}
	// check if there's a thumbnail in case this is a manual save
	if (!trigAutosave && !req.body.thumbnail_large) {
		return res.status(400).end("No is_triggered_by_autosave, expected thumbnail_large field");
	}
	
	const body = Buffer.from(req.body.body_zip, "base64");
	let thumb:Buffer | void;
	if (!trigAutosave) {
		thumb = Buffer.from(req.body.thumbnail_large, "base64");
	}
	// zip check
	if (!body.subarray(0, 4).equals(
		Buffer.from([0x50, 0x4b, 0x03, 0x04])
	)) {
		return res.status(400).end("Movie is not a zip.");
	}
	
	console.log(`Controllers.movie#save: Saving movie #${req.body.movieId || "<new movie>"}...`);
	// extract the xml from the BLANK ZIP YOU FUCKERS
	// YOU GOANIMATE HACKS
	// wow 2023 octanuary crash out
	const xmlStream = nodezip.unzip(body)["movie.xml"].toReadStream();
	let buffers = [];
	xmlStream.on("data", (c:Buffer) => buffers.push(c));
	xmlStream.on("end", () => {
		const movieXml = Buffer.concat(buffers);
		const saveAsStarter = req.parsedUrl.pathname == "/goapi/saveTemplate/";
		MovieModel.save(movieXml, thumb, req.body.movieId, saveAsStarter).then((id:string) => {
			console.log(`Controllers.movie#save: Successfully saved movie #${id}.`);
			res.end("0" + id);
		}).catch((err:Error|"404") => {
			if (err == "404") {
				return res.status(404).end("Specified movie doesn't exist.");
			}
			console.error("Controllers.movie#save error:", err);
			res.status(500).end("Internal server error.");
		});
	});
});

export default group;
