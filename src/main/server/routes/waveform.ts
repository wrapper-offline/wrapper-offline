import httpz from "@octanuary/httpz";
import WfModel from "../models/waveform.js";

const group = new httpz.Group();

/*
load
*/
group.route("POST", "/goapi/getWaveform/", async (req, res) => {
	const id = req.body.wfid;
	if (!id) {
		return res.status(500).end("Missing one or more fields.");
	}

	try {
		const waveform = WfModel.load(id);
		waveform ?
			res.status(200).end(waveform) :
			res.status(404).end();
	} catch (err) {
		if (err == "404") {
			return res.status(404).end();
		}
		console.log(req.parsedUrl.pathname, "failed. Error:", err);
		res.status(500).end();
	}
});

/*
save
*/
group.route("POST", "/goapi/saveWaveform/", (req, res) => {
	const { waveform } = req.body;
	const id = req.body.wfid;
	if (!id) {
		return res.status(500).end("Missing one or more fields.");
	}

	try {
		WfModel.save(waveform, id);
		res.end("0");
	} catch (e) {
		if (e == "404") {
			return res.status(404).end("1");
		}
		console.error(req.parsedUrl.pathname, "failed. Error:", e);
	}
});

export default group;
