import { app } from "electron";
import httpz from "@octanuary/httpz";
import { join } from "path";
import asset from "./asset";
import char from "./char";
import handler from "serve-handler";
import movie from "./movie";
import settings from "./settings";
import theme from "./theme";
import tts from "./tts";
import watermark from "./watermark";
import waveform from "./waveform";

const IS_DEV = app.commandLine.getSwitchValue("dev").length > 0;
const group = new httpz.Group();
group.add(asset);
group.add(char);
group.add(movie);
group.add(theme);
group.add(settings);
group.add(tts);
group.add(watermark);
group.add(waveform);

group.route("POST", "/goapi/getCCPreMadeCharacters", (_, r) => {
	r.end();
});
group.route("POST", "/api_v2/team/members", (_, r) => {
	r.json({status:"ok", data:[]});
});
group.route("GET", "/goapi/getAssetTags", (_, r) => {
	r.json([]);
});
group.route("POST", "/goapi/getUserFontList/", (_, r) => {
	r.json({status:"ok"})
});
group.route("POST", "/api_v2/studio_preference/get", (_, r) => {
	r.json({status:"ok", data:[]})
});
group.route("POST", "/api_v2/text_component/get_list", (_, r) => {
	r.json({status:"ok", data:[]})
});
group.route("POST", "/api_v2/text_component/add", (_, r) => {
	r.json({status:"ok", data:[]})
});

group.route("OPTIONS", "*", (req, res) => {
	const origin = req.headers.origin;
	if (
		!origin.includes("127.0.0.1") &&
		!(origin.includes("localhost") && !origin.includes("."))
	) {
		return res.status(400).end();
	}
	res.writeHead(200, {
		"access-control-allow-headers": "*",
		"access-control-allow-origin": "*",
	}).end();
});

if (!IS_DEV) {
	group.route("*", "*", async (req, res) => {
		if (res.writableEnded) {
			return;
		}
		await handler(req, res, {
			public: join(__dirname, "renderer"),
			headers: {
				"Cache-Control": "no-store"
			}
		});
	});
}

export default group;
