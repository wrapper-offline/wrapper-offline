/*
tts
*/
const brotli = require("brotli");
const fileUtil = require("../../utils/realFileUtil");
const fs = require("fs");
const https = require("https");
const http = require("http"); 	
const voices = require("../data/voices.json").voices;

/**
 * uses tts demos to generate tts
 * @param {string} voiceName voice name
 * @param {string} text text
 * @returns {Buffer}
 */
module.exports = function processVoice(voiceName, text) {
	return new Promise(async (resolve, rej) => {
		const voice = voices[voiceName];
		if (!voice) {
			return rej("Requested voice is not supported");
		}

		switch (voice.source) {
			case "polly": {
				text = text.substring(0, 181);
				const body = new URLSearchParams({
					msg: text,
					lang: voice.arg,
					source: "ttsmp3"
				}).toString();
				const req = https.request(
					{
						hostname: "ttsmp3.com",
						path: "/makemp3_new.php",
						method: "POST",
						headers: { 
							"Content-Length": body.length,
							"Content-type": "application/x-www-form-urlencoded"
						}
					},
					(r) => {
						let body = "";
						r.on("error", (e) => rej(e));
						r.on("data", (b) => body += b);
						r.on("end", () => {
							const json = JSON.parse(body);
							if (json["Error"] == 1) return rej(json.Text);

							https.get(json["URL"], (response) => {
								let chunks = [];
								response.on("error", (e) => rej(e));
								response.on("data", (c) => chunks.push(c));
								response.on("end", () => {
									resolve(Buffer.concat(chunks));
								});
							});
						});
						r.on("error", rej);
					}
				).on("error", (e) => rej(e));
				req.end(body);
				break;
			}
			case "readloud": {
				const body = new URLSearchParams({
					but1: text,
					butS: 0,
					butP: 0,
					butPauses: 0,
					butt0: "Submit",
				}).toString();
				const req = https.request(
					{
						hostname: "readloud.net",
						path: voice.arg,
						method: "POST",
						headers: { 
							"Content-Type": "application/x-www-form-urlencoded"
						}
					},
					(r) => {
						let buffers = [];
						r.on("error", (e) => rej(e));
						r.on("data", (b) => buffers.push(b));
						r.on("end", () => {
							const html = Buffer.concat(buffers);
							const beg = html.indexOf("/tmp/");
							const end = html.indexOf("mp3", beg) + 3;
							const sub = html.subarray(beg, end).toString();

							https.get(`https://readloud.net${sub}`, response => {
								let chunks = [];
								response.on("error", (e) => rej(e));
								response.on("data", (c) => chunks.push(c));
								response.on("end", () => {
									resolve(Buffer.concat(chunks));
								});
							});
						});
					}
				).on("error", (e) => rej(e));
				req.end(body);
				break;
			}
			case "voiceforge": {
				const queryString = new URLSearchParams({						
					msg: text,
					voice: voice.arg,
					email: "chopped@chin.com"
				}).toString();
				https.get(
					{
						hostname: "api.voiceforge.com",
						path: `/swift_engine?${queryString}`,
						headers: { 
							"User-Agent": "just_audio/2.7.0 (Linux;Android 14) ExoPlayerLib/2.15.0",
							"Connection": "keep-alive",
							"http_x_api_key": "8b3f76a8539",
							"Accept-Encoding": "gzip, deflate, br",
							"Icy-Metadata": "1",
							"host": "api.voiceforge.com",
						}
					}, (r) => {
						let chunks = [];
						r.on("error", (e) => rej(e));
						r.on("data", (c) => chunks.push(c));
						r.on("end", () => {
							console.log(Buffer.concat(chunks))
							console.log("bye")
							// resolve(Buffer.concat(chunks));
						});
						// fileUtil.convertToMp3(r, "wav").then(res).catch(rej);
					}
				);
				break;
			}
		}
	});
};
