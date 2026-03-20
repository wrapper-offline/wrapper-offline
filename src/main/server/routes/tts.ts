import AssetModel, { Asset } from "../models/asset";
import { engines, JOEY_ID, voiceList } from "../tts";
import fileUtil from "../utils/fileUtil";
import fs from "fs";
import httpz from "@octanuary/httpz";
import { Readable } from "stream";
import tempfile from "tempfile";
import { once } from "events";

const group = new httpz.Group();

/*
list
*/
group.route("POST", "/goapi/getTextToSpeechVoices/", (req, res) => {
	res.setHeader("Content-Type", "text/xml; charset=UTF-8");
	res.end(voiceList);
});

/*
load
*/
group.route("POST", "/goapi/convertTextToSoundAsset/", async (req, res) => {
	let { voice: id, text } = req.body as {
		voice: string,
		text: string
	};
	if (typeof id == "undefined" || typeof text == "undefined") {
		return res.status(400).end();
	}

	if (id == "joey") {
		id = JOEY_ID;
	}
	const [engineName, voiceName] = id.split("\\");
	const engine = engines.find((e) => e.name == engineName);
	const voice = engine.voices.find((v) => v.name == voiceName);
	if (!voice) {
		return res.status(400).end(`1<error><code>ERR_ASSET_404</code><message>Voice does not exist.</message><text></text></error>`);
	}
	text = text.trim().substring(0, engine.limit);

	const filepath = tempfile(".mp3");
	const writeStream = fs.createWriteStream(filepath);
	try {
		const data = await engine.generate(voice, text);
		if (typeof (data as Readable).on == "function") {
			(data as Readable).pipe(writeStream);
		} else {
			writeStream.end(data as Buffer);
		}

		await once(writeStream, "close");
		const duration = await fileUtil.mediaDuration(filepath) * 1e3;
		const meta:Partial<Asset> = {
			duration,
			type: "sound",
			subtype: "tts",
			title: `[${voiceName}] ${text}`
		};
		const id = await AssetModel.save(filepath, "mp3", meta);
		fs.unlinkSync(filepath);
		res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`);
	} catch (e) {
		res.log("Failed to generate TTS! " + e);
		res.end(`1<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
	}
});

export default group;
