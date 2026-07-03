import { accountStats, authenticate } from "../tts/voiceforge";
import AssetModel, { Asset } from "../models/asset";
import { engines, JOEY_ID, voiceList } from "../tts";
import { Entry } from "@napi-rs/keyring";
import fileUtil from "../utils/fileUtil";
import fs from "fs";
import httpz from "@octanuary/httpz";
import { Readable } from "stream";
import Settings from "../../storage/settings";
import tempfile from "tempfile";
import { once } from "events";

const group = new httpz.Group();

group.route("POST", "/goapi/getTextToSpeechVoices/", (req, res) => {
	res.setHeader("Content-Type", "text/xml; charset=UTF-8");
	res.end(voiceList);
});

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
	if (!engine) {
		return res.status(400).end("1<error><code>ERR_ASSET_404</code><message>Engine does not exist.</message><text></text></error>");
	}
	const voice = engine.voices.find((v) => v.name == voiceName);
	if (!voice) {
		return res.status(400).end("1<error><code>ERR_ASSET_404</code><message>Voice does not exist.</message><text></text></error>");
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
			name: `[${voiceName}] ${text}`
		};
		const id = await AssetModel.save(filepath, "mp3", meta);
		fs.unlinkSync(filepath);
		res.end(`0<response><asset><id>${id}</id><enc_asset_id>${id}</enc_asset_id><type>sound</type><subtype>tts</subtype><title>${meta.name}</title><published>0</published><tags></tags><duration>${meta.duration}</duration><downloadtype>progressive</downloadtype><file>${id}</file></asset></response>`);
	} catch (e) {
		res.log("Failed to generate TTS! " + e);
		res.end(`1<error><code>ERR_ASSET_404</code><message>${e}</message><text></text></error>`);
	}
});

group.route("POST", "/api/tts/voiceforge/sign_in", async (req, res) => {
	const email = req.body.email as string | undefined;
	const password = req.body.password as string | undefined;
	if (!email || !password) {
		Settings.voiceforgeEmail = "";
		return res.json({ msg:"Reset" });
	}

	const entry = new Entry("voiceforge", email);
	Settings.voiceforgeEmail = email;
	entry.setPassword(password);

	try {
		await authenticate();
		res.end();
	} catch (e) {
		Settings.voiceforgeEmail = "";
		entry.deleteCredential();
		res.log("Failed to authenticate: " + e);
		res.status(400).json({ msg:"Failed to authenticate" });
	}
});

group.route("GET", "/api/tts/voiceforge/status", async (req, res) => {
	if (!Settings.voiceforgeEmail) {
		return res.json({ status:"no_account" })
	}
	try {
		const stats = await accountStats();
		res.json({
			status: "success",
			legacyAllowed: stats.canUseLegacyVoices,
			nextResetDate: stats.nextResetDate,
			tier: stats.tier,
			synthesisUsed: stats.synthesisUsed,
			synthesisLimit: stats.synthesisLimit,
		});
	} catch (e) {
		res.log("Failed to authenticate: " + e);
		res.status(500).json({ status:"failure", msg:"Failed to authenticate" });
	}
});

export default group;
