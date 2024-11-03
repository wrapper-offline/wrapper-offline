const { readFileSync } = require("fs");
const { join } = require("path");

/**
 * renders a view using eta
 * @param {import("@octanuary/httpz".Request)} req
 * @param {import("@octanuary/httpz".Response)} res
 * @param {() => Promise<void>} next
 */
module.exports = function resSendBase(req, res, next) {
	res.sendBase = async function sendBase() {
		const baseFile = readFileSync(
			join(__dirname, "../../staticInfo/base.html")
		).toString();
		res.end(baseFile.replace(
			/{{replace}}/,
			JSON.stringify({
				version: process.env.WRAPPER_VER
			})
		));
	};
	next();
};
