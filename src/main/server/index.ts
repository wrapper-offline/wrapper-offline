import http from "http";
import httpz from "@octanuary/httpz";
import reqBody from "./middlewares/req.body";
import resLog from "./middlewares/res.log";
import routes from "./routes/index";
import staticServer from "./staticServer";

/**
 * starts the servers
 */
export function startAll() {
	startStaticServer();
	startAPIServer();
};

/**
 * Starts the API server.
 */
export function startAPIServer() {
	const server = new httpz.Server();
	server.add(reqBody);
	server.add(resLog);
	server.add(routes);
	server.listen(process.env.API_SERVER_PORT, () => {
		console.log(`API server has started! Listening on port ${process.env.API_SERVER_PORT}`);
	});
	return server;
};

/**
 * Starts the static server.
 */
export function startStaticServer() {
	const server = http.createServer(staticServer);
	server.listen(process.env.STATIC_SERVER_PORT, () => {
		console.log(`Static server has started! Listening on port ${process.env.STATIC_SERVER_PORT}`);
	});
};
