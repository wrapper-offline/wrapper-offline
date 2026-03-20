import { Engine } from "../../interfaces/tts";
import https from "https";
import voices from "./voices.json";
import { once } from "events";

export default {
	name: "Cepstral",
	limit: 8000,
	voices,
	generate: (voice, text) => {
		return new Promise((resolve, reject) => {
			const req = https.get("https://www.cepstral.com/en/demos", (res) => {
				try {
					if (res.statusCode != 200) {
						return reject("Cepstral error occurred");
					}

					const cookie = res.headers["set-cookie"];
					const query = new URLSearchParams({
						voiceText: text,
						voice: voice.arg,
						createTime: "666",
						rate: "170",
						pitch: "1",
						sfx: "none"
					}).toString();

					const req = https.get(
						{
							hostname: "www.cepstral.com",
							path: `/demos/createAudio.php?${query}`,
							headers: { Cookie: cookie }
						},
						async (res) => {
							try {
								let body = "";
								res.on("data", (c) => body += c);
								await once(res, "end");
								const json = JSON.parse(body);
								const req = https.get(`https://www.cepstral.com${json.mp3_loc}`, resolve);
								req.on("error", reject)
							} catch (e) {
								reject("Cepstral error: " + e);
							}
						}
					);
					req.on("error", reject);
				} catch (e) {
					reject("Cepstral error: " + e);
				}
			});
			req.on("error", reject);
		});
	}
} as Engine;
