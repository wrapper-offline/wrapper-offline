import httpz from "@octanuary/httpz";
import Settings from "../../storage/settings";

const group = new httpz.Group();

/*
list
*/
group.route("GET", "/api/settings/list", (req, res) => {
	res.log("Retrieving settings...");
	res.json(Settings.getAllSettings());
	res.log("Success!");
});

/*
update
*/
group.route("POST", "/api/settings/update", (req, res) => {
	const name:string = req.body.setting;
	if (!name) {
		return res.status(400).json({msg:"Expected parameter 'setting' on the request body."});
	}
	if (!req.body.value) {
		return res.status(400).json({msg:"Expected parameter 'value' on the request body."});
	}
	// convert true or false to a boolean, or use the original value if it's neither
	const value:string|boolean = req.body.value == "true" ? true : 
		req.body.value == "false" ? false : req.body.value;

	// check if the setting exists
	// this miight be a bad way to program it but i like how it looks
	const setting = (Settings.getAllSettings() as Record<string, any>)[name];
	if (typeof setting == "undefined") {
		console.warn(`r.settings: Attempted #update on invalid setting '${name}'.`);
		return res.status(400).json({msg:`Expected parameter 'value' for setting '${name}' to have type '${typeof setting}'.`});
	}
	if (typeof setting != typeof value) {
		console.warn(`r.settings: Attempted #update on setting '${name}' with type '${typeof value}'. Expected '${typeof setting}'.`);
		return res.status(400).json({msg:`Expected parameter 'value' for setting '${name}' to have type '${typeof setting}'.`});
	}
	//@ts-ignore
	Settings[name as keyof Settings.getAllSettings] = value;

	res.end();
});

export default group;
