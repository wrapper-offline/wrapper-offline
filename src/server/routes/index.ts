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
group.route("*", "*", (req, res) => {
	if (res.writableEnded) {
		return;
	}
	handler(req, res, {
		public: "src/server/public", 
		headers: {
			"Cache-Control": "no-store"
		}
	});
});

export default group;
