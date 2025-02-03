import AssetModel, { Asset } from "../models/asset";
import fs from "fs";
import httpz from "@octanuary/httpz";
import tempfile from "tempfile";
import mp3Duration from "mp3-duration";
import processVoice from "../models/tts";
import info from "../data/voices.json";
import { Readable } from "stream";

const group = new httpz.Group();

/*
generate the list
*/
const voices = info.voices, langs = {};
Object.keys(voices).forEach((i) => {
	const v = voices[i], l = v.language;
	langs[l] = langs[l] || [];
	langs[l].push(`<voice id="${i}" desc="${v.desc}" sex="${v.gender}" demo-url="" country="${v.country}" plus="N"/>`);
});
const xml = `${process.env.XML_HEADER}<voices>${
	Object.keys(langs).sort().map(i => {
		const v = langs[i], l = info.languages[i];
		return `<language id="${i}" desc="${l}">${v.join("")}</language>`;
	}).join("")}</voices>`;

/*
list
*/
group.route("POST", "/goapi/getTextToSpeechVoices/", (req, res) => {
	res.setHeader("Content-Type", "text/html; charset=UTF-8");
	res.end(xml);
});

/*
load
*/
group.route("POST", "/goapi/convertTextToSoundAsset/", async (req, res) => {
	const { voice, text:rawText } = req.body;
	if (!voice || !rawText) {
		return res.status(400).end();
	}

	const filepath = tempfile(".mp3");
	const writeStream = fs.createWriteStream(filepath);
	const text = rawText.substring(0, 320);
	processVoice(voice, text).then((data:any) => {
		if (typeof data.on == "function") {
			(data as Readable).pipe(writeStream);
		} else {
			writeStream.end(data as Buffer);
		}

		writeStream.on("close", async () => {
			const duration = await mp3Duration(filepath) * 1e3;
			const meta:Partial<Asset> = {
				duration,
				type: "sound",
				subtype: "tts",
				title: `[${voices[voice].desc}] ${text}`
			};
			const id = await AssetModel.save(filepath, "mp3", meta);
			res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.title}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`);
		});
	}).catch((e:Error) => {
		console.error("Error generating TTS:", e);
		res.end(`1<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
	});
});

export default group;
