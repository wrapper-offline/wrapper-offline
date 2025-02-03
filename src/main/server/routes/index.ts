import httpz from "@octanuary/httpz";
import asset from "./asset";
import char from "./char";
//// commented out because i'm waiting on the studio decomp
//// before doing any major things, like y'know, an exporter.
// const exporter = require("./exporter");
// const flash = require("./flash");
import handler from "serve-handler";
import movie from "./movie";
import settings from "./settings";
import theme from "./theme";
import tts from "./tts";
import watermark from "./watermark";
import waveform from "./waveform";

const group = new httpz.Group();
group.add(asset);
group.add(char);
// group.add(exporter);
// group.add(flash);
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

group.route("*", "*", async (req, res) => {
	if (res.writableEnded) {
		return;
	}
	await handler(req, res, {
		public: "dist/renderer", 
		headers: {
			"Cache-Control": "no-store"
		}
	});
});

export default group;
