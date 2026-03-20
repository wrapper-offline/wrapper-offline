import { Engine } from "../../interfaces/tts";
import https from "https";
import voices from "./voices.json";

export default {
	name: "Nuance",
	limit: 380,
	voices,
	generate: (voice, text) => {
		return new Promise((resolve, reject) => {
			const query = new URLSearchParams({
				voice_name: voice.arg,
				speak_text: text,
			}).toString();

			const req = https.get(
				`https://voicedemo.codefactoryglobal.com/generate_audio.asp?${query}`,
				(res) => {
					try {
						if (res.statusCode != 200) {
							return reject("Nuance error occurred");
						}
						resolve(res);
					} catch (e) {
						reject(e);
					}
				}
			);
			req.on("error", reject);
		});
	}
} as Engine;
