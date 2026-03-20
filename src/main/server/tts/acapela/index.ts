import { Engine } from "../../interfaces/tts";
import https from "https";
import voices from "./voices.json";

export default {
	name: "Acapela",
	limit: 3000,
	voices,
	generate: (voice, text) => {
		return new Promise((resolve, reject) => {
			const query = new URLSearchParams({
				voice: voice.arg,
				text: text,
				output: "stream",
				type: "mp3",
				samplerate: "22050",
				token: "bd8b22e3e5ebbaa05ea0055aec4e16c357c29486"
			}).toString();
			const req = https.get(
				{
					hostname: "www.acapela-cloud.com",
					path: `/api/command/?${query}`,
				},
				(res) => {
					try {
						if (res.statusCode != 200) {
							return reject("Acapela error occurred");
						}
						resolve(res);
					} catch (e) {
						reject(e);
					}
				}
			)
			req.on("error", reject);
		});
	}
} as Engine;
