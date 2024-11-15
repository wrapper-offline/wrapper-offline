/*
start wrapper: offline's server
*/
const httpz = require("@octanuary/httpz");
const reqBody = require("./middlewares/req.body.js");
const resTime = require("./middlewares/res.time.js");
const routes = require("./routes/index.js");

/**
 * Starts the API server.
 */
module.exports = function startServer() {
	const server = new httpz.Server();

	server.add(reqBody);
	server.add(resTime);
	server.add(routes);
	server.listen(process.env.SERVER_PORT);
	
	return server;
};
