import { Engine } from "../../interfaces/tts";
import https from "https";
import voices from "./voices.json";

export default {
	name: "Vocalware",
	limit: 600,
	voices,
	generate: (voice, text) => {
		return new Promise((resolve, reject) => {
			const [EID, LID, VID] = voice.arg;
			const query = new URLSearchParams({
				EID,
				LID,
				VID,
				TXT: text,
				EXT: "mp3",
				FNAME: "",
				ACC: "15679",
				SceneID: "2703396",
				HTTP_ERR: "",
			}).toString();

			const req = https.get(
				{
					hostname: "cache-a.oddcast.com",
					path: `/tts/genB.php?${query}`,
					headers: {
						"Host": "cache-a.oddcast.com",
						"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:107.0) Gecko/20100101 Firefox/107.0",
						"Accept": "*/*",
						"Accept-Language": "en-US,en;q=0.5",
						"Accept-Encoding": "gzip, deflate, br",
						"Origin": "https://www.oddcast.com",
						"DNT": 1,
						"Connection": "keep-alive",
						"Referer": "https://www.oddcast.com/",
						"Sec-Fetch-Dest": "empty",
						"Sec-Fetch-Mode": "cors",
						"Sec-Fetch-Site": "same-site"
					}
				},
				(res) => {
					try {
						if (res.statusCode != 200) {
							return reject("Vocalware error occurred");
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
