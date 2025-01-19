import handler from "serve-handler";
import http from "http";
import httpz from "@octanuary/httpz";
import reqBody from "./middlewares/req.body";
import resLog from "./middlewares/res.log";
import routes from "./routes/index";
import path from "path";

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
	const path2 = path.join(__dirname, "../resources/static");
	const server = http.createServer(async (req, res) => {
		await handler(req, res, {
			public: path2,
			headers: {
				"Cache-Control": "no-store"
			}
		});
	});
	server.listen(process.env.STATIC_SERVER_PORT, () => {
		console.log(`Static server has started! Listening on port ${process.env.STATIC_SERVER_PORT}`);
	});
};
