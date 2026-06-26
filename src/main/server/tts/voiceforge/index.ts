import { Engine } from "../../interfaces/tts";
import { Entry } from "@napi-rs/keyring";
import fileUtil from "../../utils/fileUtil";
import https from "https";
import { once } from "events";
import { Readable } from "stream";
import Settings from "../../../storage/settings";
import voices from "./voices.json";

let localId:string | null = null;
let idToken:string | null = null;
let expiryDate:Date | null = null;

Settings.addListener("voiceforgeEmail", () => {
	localId = null;
	idToken = null;
	expiryDate = null;
});

export function authenticate(): Promise<void> {
	return new Promise((resolve, reject) => {
		if (localId && idToken && expiryDate && expiryDate > new Date()) {
			resolve();
		}
		const email = Settings.voiceforgeEmail;
		if (!email) {
			return reject("Not logged in");
		}
		const query = new URLSearchParams({
			key: "AIzaSyDfhiHjt374ubGYKz0Oit_5sKUoeC9tPWI"
		}).toString();
		const entry = new Entry("voiceforge", email);
		const body = JSON.stringify({
			clientType: "CLIENT_TYPE_WEB",
			email,
			password: entry.getPassword(),
			returnSecureToken: true
		});
		const req = https.request(
			{
				hostname: "identitytoolkit.googleapis.com",
				path: `/v1/accounts:signInWithPassword?${query}`,
				method: "POST"
			},
			async (res) => {
				try {
					if (res.statusCode != 200) {
						return reject("Failed to authenticate with VoiceForge");
					}
					let body = "";
					res.on("data", (c) => body += c);
					await once(res, "end");
					const json = JSON.parse(body);
					const date = new Date();
					date.setSeconds(date.getSeconds() + Number(json.expiresIn));
					expiryDate = date;
					localId = json.localId;
					idToken = json.idToken;
					resolve();
				} catch (e) {
					reject(e);
				}
			}
		);
		req.on("error", () => {
			reject("Failed to authenticate with VoiceForge");
		})
		req.end(body);
	});
}

export function accountStats(): Promise<any> {
	return new Promise(async (resolve, reject) => {
		try {
			await authenticate();
		} catch (e) {
			return reject(e);
		}
		const email = Settings.voiceforgeEmail;
		const body = JSON.stringify({
			firebaseUid: localId,
			email
		});
		const req = https.request(
			{
				hostname: "www.voiceforge.com",
				path: "/api/user/stats",
				method: "POST",
				headers: {
					authorization: "Bearer " + idToken,
					"content-type": "application/json",
					origin: "https://www.voiceforge.com",
					priority: "u=1, i",
					"sec-ch-ua": '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
					"sec-ch-ua-mobile": "?0",
					"sec-ch-ua-platform": '"Linux"',
					"sec-fetch-dest": "empty",
					"sec-fetch-mode": "cors",
					"sec-fetch-site": "same-origin",
					"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
				}
			},
			async (res) => {
				try {
					if (res.statusCode != 200) {
						return reject("Failed to check VoiceForge stats");
					}
					let body = "";
					res.on("data", (c) => body += c);
					await once(res, "end");
					const json = JSON.parse(body);
					resolve(json);
				} catch (e) {
					reject("VoiceForge stats error: " + e);
				}
			}
		);
		req.on("error", reject);
		req.end(body);
	});
}

export default {
	name: "VoiceForge",
	limit: 500,
	voices,
	generate: (voice, text) => {
		return new Promise(async (resolve, reject) => {
			try {
				await authenticate();
				const stats = await accountStats();
				if (stats.synthesisUsed >= stats.synthesisLimit) {
					return reject(`Maximum allowed syntheses reached (${stats.synthesisLimit})`);
				}
			} catch (e) {
				return reject(e);
			}
			const body = JSON.stringify({
				text: text,
				voice: voice.arg,
				soundEffect: "none",
				firebaseUid: localId
			});
			const req = https.request(
				{
					hostname: "www.voiceforge.com",
					path: "/api/generate-speech",
					method: "POST",
					headers: {
						authorization: "Bearer " + idToken,
						"content-type": "application/json",
						origin: "https://www.voiceforge.com",
						priority: "u=1, i",
						"sec-ch-ua": '"Chromium";v="148", "Google Chrome";v="148", "Not/A)Brand";v="99"',
						"sec-ch-ua-mobile": "?0",
						"sec-ch-ua-platform": '"Linux"',
						"sec-fetch-dest": "empty",
						"sec-fetch-mode": "cors",
						"sec-fetch-site": "same-origin",
						"user-agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36"
					}
				},
				async (res) => {
					try {
						if (res.statusCode != 200) {
							return reject("VoiceForge error occurred");
						}
						let buffers:Buffer[] = [];
						res.on("data", (c) => buffers.push(c));
						await once(res, "end");
						const wav = Buffer.concat(buffers);
						const stream = Readable.from(wav);
						resolve(await fileUtil.convertToMp3(stream, "wav", "-") as Readable);
					} catch (e) {
						reject("VoiceForge error: " + e);
					}
				}
			);
			req.on("error", reject);
			req.end(body);
		});
	}
} as Engine;

