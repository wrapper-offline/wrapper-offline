import { Engine } from "../../interfaces/tts";
import https from "https";
import voices from "./voices.json";
import { once } from "events";

export default {
	name: "ReadLoud",
	limit: 10000,
	voices,
	generate: (voice, text) => {
		return new Promise((resolve, reject) => {
			const req = https.request(
				{
					hostname: "readloud.net",
					path: voice.arg,
					method: "POST",
					headers: {
						"Content-Type": "application/x-www-form-urlencoded"
					}
				},
				async (res) => {
					try {
						if (res.statusCode != 200) {
							return reject("ReadLoud error occurred when generating audio");
						}
						let buffers = [];
						res.on("data", (b) => buffers.push(b));
						await once(res, "end");
						const html = Buffer.concat(buffers);
						const beg = html.indexOf("/tmp/");
						const end = html.indexOf("mp3", beg) + 3;
						const sub = html.subarray(beg, end).toString();
						const req = https.get(`https://readloud.net${sub}`, (res) => {
							try {
								if (res.statusCode != 200) {
									return reject("ReadLoud error occurred when retrieving audio");
								}
								resolve(res);
							} catch (e) {
								reject(e);
							}
						});
						req.on("error", reject);
					} catch (e) {
						reject(e);
					}
				}
			)
			req.on("error", reject);
			const body = new URLSearchParams({
				but1: text,
				butS: "0",
				butP: "0",
				butPauses: "0",
				butt0: "Submit",
			}).toString();
			req.end(body);
		});
	}
} as Engine;
