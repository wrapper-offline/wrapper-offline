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

		try {
			switch (voice.source) {
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
											if (sub.includes("err_code")) {
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
	
				case "cepstral": {
					https.get("https://www.cepstral.com/en/demos", async (r) => {
						r.on("error", (e) => rej(e));
						const cookie = r.headers["set-cookie"];
						const q = new URLSearchParams({
							voiceText: text,
							voice: voice.arg,
							createTime: 666,
							rate: 170,
							pitch: 1,
							sfx: "none"
						}).toString();
	
						https.get(
							{
								hostname: "www.cepstral.com",
								path: `/demos/createAudio.php?${q}`,
								headers: { Cookie: cookie }
							},
							(r2) => {
								let body = "";
								r2.on("error", (e) => rej(e));
								r2.on("data", (c) => body += c);
								r2.on("end", () => {
									const json = JSON.parse(body);
									https.get(`https://www.cepstral.com${json.mp3_loc}`, (r3) => {
										r3.on("error", (e) => rej(e));
										resolve(r3);
									});
								});
							}
						);
					});
					break;
				}
	
				case "cereproc": {
					const req = https.request(
						{
							hostname: "www.cereproc.com",
							path: "/themes/benchpress/livedemo.php",
							method: "POST",
							headers: {
								"content-type": "text/xml",
								"accept-encoding": "gzip, deflate, br",
								origin: "https://www.cereproc.com",
								referer: "https://www.cereproc.com/en/products/voices",
								"x-requested-with": "XMLHttpRequest",
								cookie: "Drupal.visitor.liveDemoCookie=666",
							},
						},
						(r) => {
							var buffers = [];
							r.on("data", (d) => buffers.push(d));
							r.on("end", () => {
								const xml = String.fromCharCode.apply(null, brotli.decompress(Buffer.concat(buffers)));
								const beg = xml.indexOf("<url>") + 5;
								const end = xml.lastIndexOf("</url>");
								const loc = xml.substring(beg, end).toString();
								https.get(loc, resolve).on("error", rej);
							});
							r.on("error", rej);
						}
					).on("error", rej);
					req.end(
						`<speakExtended key='666'><voice>${voice.arg}</voice><text>${text}</text><audioFormat>mp3</audioFormat></speakExtended>`
					);
					break;
				}
	
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
	
								https.get(`https://readloud.net${sub}`, (r2) => {
									r2.on("error", (e) => rej(e));
									resolve(r2);
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
	
				case "tiktok": {
					const req = https.request(
						{
							hostname: "tiktok-tts.weilnet.workers.dev",
							path: "/api/generation",
							method: "POST",
							headers: {
								"Content-type": "application/json"
							}
						},
						(r) => {
							let body = "";
							r.on("error", (e) => rej(e));
							r.on("data", (b) => body += b);
							r.on("end", () => {
								const json = JSON.parse(body);
								if (json.success != true) {
									return rej(json.error);
								}
								resolve(Buffer.from(json.data, "base64"));
							});
							r.on("error", rej);
						}
					).on("error", (e) => rej(e));
					req.end(JSON.stringify({
						text: text,
						voice: voice.arg
					}));
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
				case "nuance": {
					const q = new URLSearchParams({
						voice_name: voice.arg,
						speak_text: text,
					}).toString();
	
					https
						.get(`https://voicedemo.codefactoryglobal.com/generate_audio.asp?${q}`, resolve)
						.on("error", rej);
					break;
				}
				case "svox": {
					const q = new URLSearchParams({
						speed: 0,
						apikey: "ispeech-listenbutton-betauserkey",
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
				// again thx unicom for this fix
				case "voiceforge": {
					const vUtil = require("../../utils/voiceUtil");
					// the people want this
					text = await vUtil.convertText(text, voice.arg);
					const queryString = new URLSearchParams({
						msg: text,
						voice: voice.arg,
						email: "chopped@chin.com"
					}).toString();
					const req = https.request(
						{
							hostname: "api.voiceforge.com",
							path: `/swift_engine?${queryString}`,
							method: "GET",
							headers: {
								"Host": "api.voiceforge.com",
								"User-Agent": "just_audio/2.7.0 (Linux;Android 14) ExoPlayerLib/2.15.0",
								"Connection": "Keep-Alive",
								"Http_x_api_key": "8b3f76a8539",
								"Accept-Encoding": "gzip, deflate, br",
								"Icy-Metadata": "1",
							}
						}, (r) => {
							r.on("error", (e) => rej(e));
							fileUtil.convertToMp3(r, "wav")
								.then(stream => resolve(stream))
								.catch((e) => rej(e));
						}
					).on("error", (e) => rej(e));
					req.end();
					break;
				}
	
				default: {
					return rej("Not implemented");
				}
			}
		} catch (e) {
			return rej(e);
		}
	});
};
