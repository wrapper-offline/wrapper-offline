import { Engine } from "../../interfaces/tts";
import fileUtil from "../../utils/fileUtil";
import https from "https";
import { once } from "events";
import { Readable } from "stream";
import voices from "./voices.json";

export default {
	name: "CereProc",
	limit: 500,
	voices,
	generate: (voice, text) => {
		return new Promise((resolve, reject) => {
			const req = https.request(
				{
					hostname: "app.cereproc.com",
					path: "/live-demo?ajax_form=1&_wrapper_format=drupal_ajax",
					method: "POST",
					headers: {
						"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
						"origin": "https://app.cereproc.com",
						"referer": "https://app.cereproc.com/live-demo",
						"x-requested-with": "XMLHttpRequest"
					},
				},
				async (res) => {
					try {
						if (res.statusCode != 200) {
							return reject("CereProc error occurred");
						}
						let data = "";
						res.on("data", (d) => data += d);
						await once(res, "end");
						const array = JSON.parse(data);
						const resultElem = array.find((c) => {
							return c.selector && c.selector == "#live-demo-result"
						});
						const start = resultElem.data.indexOf("https://cerevoice.s3.amazonaws.com");
						const end = resultElem.data.indexOf(".wav", start) + 4;
						const url = resultElem.data.slice(start, end);
						https.get(url, async (r) => {
							try {
								if (r.statusCode != 200) {
									return reject("CereProc error occurred");
								}
								resolve(await fileUtil.convertToMp3(r, "wav") as Readable);
							} catch (e) {
								reject(e);
							}
						});
					} catch (e) {
						reject(e);
					}
				}
			)
			req.on("error", reject);
			req.end(new URLSearchParams({
				text,
				voice: voice.arg,
				form_id: "live_demo_form",	
			}).toString());
		});
	}
} as Engine;
