import { Engine } from "../../interfaces/tts";
import https from "https";
import voices from "./voices.json";
import { once } from "events";

export default {
	name: "Streamlabs",
	limit: 400,
	voices,
	generate: (voice, text) => {
		return new Promise((resolve, reject) => {
			const query = new URLSearchParams({
				voice: voice.arg,
				text: text,
			}).toString();
			const req = https.get(
				{
					hostname: "streamlabs.com",
					path: `/polly/speak?${query}`,
					method: "POST",
					headers: {
						"referer": "https://streamlabs.com"
					}
				},
				async (res) => {
					try {
						let body = "";
						res.on("data", (d) => body += d);
						await once(res, "end");
						const json = JSON.parse(body);
						if (!json.success) {
							return reject("Streamlabs error: " + json.message);
						}
						const url = json.speak_url;
						const req = https.get(url, (res) => {
							try {
								if (res.statusCode != 200) {
									return reject("Streamlabs error occurred when retrieving audio");
								}
								resolve(res);
							} catch (e) {
								reject(e);
							}
						});
						req.on("error", reject);
					} catch (e) {
						reject("Streamlabs error: " + e);
					}
				}
			);
			req.on("error", reject);
		});
	}
} as Engine;
