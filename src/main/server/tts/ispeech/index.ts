import { Engine } from "../../interfaces/tts";
import https from "https";
import voices from "./voices.json";

export default {
	name: "iSpeech",
	limit: 200,
	voices,
	generate: (voice, text) => {
		return new Promise((resolve, reject) => {
			const query = new URLSearchParams({
				speed: "0",
				apikey: voice.key ?
					"38fcab81215eb701f711df929b793a89" :
					"ispeech-listenbutton-betauserkey",
				text: text,
				action: "convert",
				voice: voice.arg,
				format: "mp3",
				e: "audio.mp3"
			}).toString();
			const req = https.get(`https://api.ispeech.org/api/rest?${query}`, (res) => {
				try {
					if (res.statusCode != 200) {
						return reject("iSpeech error occurred");
					}
					resolve(res);
				} catch (e) {
					reject(e);
				}
			});
			req.on("error", reject);
		});
	}
} as Engine;
