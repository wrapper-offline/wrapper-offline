/*
start wrapper: offline's server
*/
const fs = require("fs");
const handler = require("serve-handler");
const httpz = require("@octanuary/httpz");
const jsonRoutes = require("../staticInfo/routes.json");
const reqBody = require("./middlewares/req.body.js");
const resRender = require("./middlewares/res.render.js");
const resTime = require("./middlewares/res.time.js");
const routes = require("./routes/index.js");

/**
 * Starts the API server.
 */
module.exports = function startServer() {
	const server = new httpz.Server();

	server.add(reqBody);
	server.add(resRender);
	server.add(resTime);
	server.add(routes);
	// handle 404s
	server.route("*", "*", (req, res) => {
		const methodLinks = jsonRoutes[req.method] || {};
		const combLinks = Object.assign(jsonRoutes["*"], methodLinks);
		for (let linkIndex in combLinks) {
			// find a url match
			const regex = new RegExp(linkIndex);
			if (regex.test(req.parsedUrl.pathname)) {
				const route = combLinks[linkIndex];
				const link = req.parsedUrl.pathname;
				const headers = route.headers || {};
				const path = `./${link}`;
	
				try {
					for (const headerName in headers) {
						res.setHeader(headerName, headers[headerName]);
					}
					res.statusCode = route.statusCode || 200;
					if (route.content !== undefined)
						res.end(route.content);
					else if (fs.existsSync(path))
						fs.createReadStream(path).pipe(res);
					else throw null;
				} catch (e) {
					break;
				}
				return;
			}
		}
		// still no match, try serving a static file
		if (!res.writableEnded) {
			handler(req, res, {public:"server"});
		}
	});
	server.listen(process.env.SERVER_PORT);
	
	return server;
};
