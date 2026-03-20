import { Engine } from "../../interfaces/tts";
import https from "https";
import voices from "./voices.json";
import { once } from "events";

export default {
	name: "TikTok",
	limit: 200,
	voices,
	generate: (voice, text) => {
		return new Promise((resolve, reject) => {
			const query = new URLSearchParams({
				aid: "1233",
				req_text: text,
				region: voice.country,
				text_speaker: voice.arg,
			}).toString();
			const req = https.request(
				{
					hostname: "api16-normal-useast5.us.tiktokv.com",
					path: `/media/api/text/speech/invoke/?${query}`,
					method: "POST",
					headers: {
						"cache-control": "no-cache",
						"content-type": "application/json",
						"cookie": "sessionid=cc11cb1a8f38fd855aad30660349dd8a",
						"responsetype": "ResponseType.json",
						"sdk-version": "2",
						"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:98.0) Gecko/20100101 Firefox/98.0"
					}
				},
				async (res) => {
					try {
						let body = "";
						res.on("data", (c) => body += c);
						await once(res, "end");
						const json = JSON.parse(body);
						if (json.status_code != 0) {
							throw `${json.status_code} - ${json.message}`;
						}
						resolve(Buffer.from(json.data.v_str, "base64"));
					} catch (e) {
						reject("TikTok error: " + e);
					}
				}
			);
			req.on("error", reject);
			req.end();
		});
	}
} as Engine;
