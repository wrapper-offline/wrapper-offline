import brotli from "brotli";
import https from "https";
import voiceList from "../data/voices.json";
import { Readable } from "stream";

/**
 * uses tts demos to generate tts
 * @param voiceName voice name
 * @param text text
 */
export default function processVoice(
	voiceName:string,
	text:string
): Promise<Buffer | Readable> {
	return new Promise(async (resolve, rej) => {
		const voice = voiceList.voices[voiceName];
		if (typeof voice == "undefined") {
			return rej("Requested voice is unavailable");
		}

		try {
			switch (voice.source) {
				case "acapela": {
					text = text.trim().slice(0, 2999);
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
						(r) => {
							try {
								if (r.statusCode != 200) {
									return rej("Acapela error occurred");
								}
								resolve(r);
							} catch (e) {
								rej(e);
							}
						}
					)
					req.on("error", rej);
					break;
				}
	
				case "cepstral": {
					https.get("https://www.cepstral.com/en/demos", async (r) => {
						r.on("error", (e) => rej(e));
						const cookie = r.headers["set-cookie"];
						const q = new URLSearchParams({
							voiceText: text,
							voice: voice.arg,
							createTime: "666",
							rate: "170",
							pitch: "1",
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

				case "streamlabs": {
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
						}, (r) => {
							let body = "";
							r.on("data", (d) => body += d);
							r.on("end", () => {
								try {
									const json = JSON.parse(body);
									if (!json.success) {
										return rej("Streamlabs error: " + json.message);
									}
									const url = json.speak_url;
									https.get(url, resolve);
								} catch (e) {
									return rej(e);
								}
							});
						}
					);
					req.on("error", (e) => rej(e));
					break;
				}

				case "readloud": {
					const body = new URLSearchParams({
						but1: text,
						butS: "0",
						butP: "0",
						butPauses: "0",
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
						speed: "0",
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
					text = text.trim().slice(0, 199);
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
						(r) => {
							let body = "";
							r.on("error", (e) => rej(e));
							r.on("data", (c) => body += c);
							r.on("end", () => {
								try {
									const json = JSON.parse(body);
									if (json.status_code != 0) {
										return rej(`TikTok error: ${json.status_code} - ${json.message}`);
									}
									resolve(Buffer.from(json.data.v_str, "base64"));
								} catch (e) {
									return rej(e);
								}
							});
						}
					);
					req.on("error", (e) => rej(e));
					req.end();
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
						ACC: "15679",
						SceneID: "2703396",
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
						speed: "0",
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
	
				default: {
					return rej("Not implemented");
				}
			}
		} catch (e) {
			return rej(e);
		}
	});
};

/**
 * converts the waaa's to make it sound old (voicehub method)
 * @param text text input
 * @param voiceArg voice argument
 */
async function convertVoiceforgeText(
	text:string,
	voiceArg:string
): Promise<string> {
	return new Promise((resolve) => {
		let inputText = text.toLowerCase();
		// still gotta thank Jyvee for the actual method
		// theres also a reason why Jyvee randomly shared the method but its a personal reason
		if (!inputText.includes("aaaaa")) {
			return resolve(text);
		}
		let pattern = /(?:gr|[a-z])a{2,}([a-z]?)/g;
		let question = /\?/g;
		let matches = inputText.match(pattern);
		for (const match of matches) {
			let voiceValues = ["aa"];
			const initialChar = match.charAt(0);
			switch (initialChar) {
				case "a": {
					voiceValues.pop();
					voiceValues.unshift("a1");
					voiceValues.unshift("ah");
					break;
				}
				case "c": {
					voiceValues.unshift("k");
					break;
				}
				case "j": {
					voiceValues.unshift("jh");
					break;
				}
				case "u": {
					voiceValues.unshift("uh1");
					break;
				}
				case "v": {
					voiceValues.unshift("v1");
					break;
				}
				case "w": {
					if (voiceArg == "Dallas") {
						voiceValues.unshift("w");
					}
					else {
						voiceValues.unshift("w1");
					}
					break;
				}
				case "x": {
					voiceValues.unshift("eh1");
					voiceValues.unshift("z");
					break;
				}
				case "y": {
					voiceValues.unshift("a");
					voiceValues.unshift("j");
					break;
				}
				case "z": {
					voiceValues.unshift("aa1");
					voiceValues.unshift("z");
					break;
				}
				default: {
					if (match.startsWith("gr")) {
						if (voiceArg == "French-fry") {
							voiceValues.pop();
							voiceValues.unshift("r")
							voiceValues.unshift("g1")
						}
						else {
							voiceValues.pop();
							voiceValues.unshift("r");
							voiceValues.unshift("g");
						}
						break;
					} else if (match.includes("ga")) {
						voiceValues.unshift("g1");
						break;
					}
					voiceValues.unshift(initialChar);
				}
			}
			let consecutiveAs = match.length - 1;
			for (let i = 0; i < consecutiveAs; i++) {
				voiceValues.push("ah");
			}
			if (!match.includes("ah") && match.charAt(0) != "a" && !match.includes("ay")) {
				switch (voiceArg) {
					case "Belle":
					case "Charlie":
					case "Designer":
					case "Duchess": 
					case "Evilgenius":
					case "Frank":
					case "French-fry":
					case "Jerkface":
					case "JerseyGirl":
					case "Kayla":
					case "Kevin":
					case "Susan":
					case "Tamika":
					case "TopHat":
					case "Vixen":
					case "Vlad":
					case "Warren": {
						voiceValues.push("aa1");
						voiceValues.push("a");
						break;
					}
					case "Conrad":
					case "Wiseguy": {
						voiceValues.push("aa1");
						voiceValues.push("aa1");
						break;
					}
					case "Kidaroo": {
						voiceValues.push("aa");
						voiceValues.push("ah");
						break;
					}
					case "Zach": {
						voiceValues.push("aa1");
						voiceValues.push("aa");
						break;
					}
					case "RansomNote": {
						voiceValues.push("aa");
						voiceValues.push("aa");
						voiceValues.push("ay");
						break;
					}
					case "Gregory": {
						voiceValues.push("a1");
						voiceValues.push("aa");
						break;
					}
					case "Diesel":
					case "Princess": {
						voiceValues.push("aa1");
						voiceValues.push("a");
						break;
					}
					case "Dallas": {
						voiceValues.push("ah1");
						break;
					}
					default: {
						voiceValues.push("ah");
						voiceValues.push("a");
					}
				}
				if (match == "h") {
					if (voiceArg == "RansomNote") {
						voiceValues.pop();
						voiceValues.pop();
						voiceValues.pop();
					}
					else {
						voiceValues.pop();
						voiceValues.pop();
					}
					voiceValues.push("aa1");
					if (voiceArg == "Dallas") {
						voiceValues.pop();
					}
				}
			}
			else if (match.includes("ay")) {
				voiceValues.push("ey1");
				voiceValues.push("ey1");
			}
			else if (match.includes("ah")) {
				switch (voiceArg) {
					case "Frank":
					case "Kayla": {
						voiceValues.push("ah1");
						voiceValues.push("a");
						voiceValues.push("ah");
						break;
					}
					case "Belle": {
						voiceValues.push("aa1");
						voiceValues.push("ah");
						break;
					}
					case "Designer": {
						voiceValues.push("ah");
						voiceValues.push("a");
						voiceValues.push("ah");
						break;
					}
					default: {
						voiceValues.push("aa");
						voiceValues.push("ah");
					}
				}
			}
			else {
				return resolve(text);
			}
			let xmlText = `<phoneme ph="${voiceValues.join(" ")}">Cepstral</phoneme>`;
			let modifiedText = inputText.replace(match, xmlText);
			let modifiedExclimation = modifiedText.replace("!", "! ,");
			let modifiedQuestion = modifiedExclimation.replace(question, "? ,");
			let modifiedComma = modifiedQuestion.replace(",", ", ;");
			let modifiedPeriod = modifiedComma.replace(".", ". ,");
			text = modifiedPeriod;
			return resolve(text);
		}
	})
}
