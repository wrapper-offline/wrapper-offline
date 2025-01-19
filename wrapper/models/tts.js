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
				const q = new URLSearchParams({
					voice: voice.arg,
					text: text,
				}).toString();

				https
					.get(`https://api.streamelements.com/kappa/v2/speech?${q}`, resolve)
					.on("error", rej);
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
			case "svox2": {
				const q = new URLSearchParams({
					speed: 0,
					apikey: "38fcab81215eb701f711df929b793a89",
					text: text,
					action: "convert",
					voice: voice.arg,
					format: "mp3",
					e: "audio.mp3"
				}).toString();

				https
					.get(`https://api.ispeech.org/api/rest?${q}`, resolve)
					.on("error", rej);
				break;
			}
			case "vocalware": {
				const [EID, LID, VID] = voice.arg;
				const q = new URLSearchParams({
					EID,
					LID,
					VID,
					TXT: text,
					EXT: "mp3",
					FNAME: "",
					ACC: 15679,
					SceneID: 2703396,
					HTTP_ERR: "",
				}).toString();

				console.log(`https://cache-a.oddcast.com/tts/genB.php?${q}`)
				https
					.get(
						{
							hostname: "cache-a.oddcast.com",
							path: `/tts/genB.php?${q}`,
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
						}, resolve
					)
					.on("error", rej);
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
							console.log("bye");
							fileUtil.convertToMp3(r, "wav").then(res).catch(rej);
							// resolve(Buffer.concat(chunks));
						});
						// fileUtil.convertToMp3(r, "wav").then(res).catch(rej);
					}
				);
				break;
			}
			case "acapela": {
				let acapelaArray = [];
				for (let c = 0; c < 15; c++) acapelaArray.push(~~(65 + Math.random() * 26));
				const email = `${String.fromCharCode.apply(null, acapelaArray)}@gmail.com`;

				let req = https.request(
					{
						hostname: "acapelavoices.acapela-group.com",
						path: "/index/getnonce",
						method: "POST",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
					},
					(r) => {
						let buffers = [];
						r.on("data", (b) => buffers.push(b));
						r.on("end", () => {
							const nonce = JSON.parse(Buffer.concat(buffers)).nonce;
							let req = https.request(
								{
									hostname: "h-ir-ssd-1.acapela-group.com",
									path: "/Services/Synthesizer",
									method: "POST",
									headers: {
										"Content-Type": "application/x-www-form-urlencoded",
									},
								},
								(r) => {
									let buffers = [];
									r.on("data", (d) => buffers.push(d));
									r.on("end", () => {
										const html = Buffer.concat(buffers);
										const beg = html.indexOf("&snd_url=") + 9;
										const end = html.indexOf("&", beg);
										const sub = html.subarray(beg, end).toString();
										if (sub.includes("err_code"))
										{
										rej("An error occured during generation.");
										return;
										}
										https
											.get(sub, resolve)
											.on("error", rej);
									});
									r.on("error", rej);
								}
							).on("error", rej);
							req.end(
								new URLSearchParams({
									cl_vers: "1-30",
									req_text: text,
									cl_login: "AcapelaGroup",
									cl_app: "AcapelaGroup_WebDemo_Android",
									req_comment: `{"nonce":"${nonce}","user":"${email}"}`,
									prot_vers: 2,
									cl_env: "ACAPELA_VOICES",
									cl_pwd: "",
									req_voice: voice.arg,
									req_echo: "ON",
								}).toString()
							);
						});
					}
				).on("error", rej);
				req.end(
					new URLSearchParams({
						json: `{"googleid":"${email}"`,
					}).toString()
				);
				break;
			}
		}
	});
};
