/*
start wrapper: offline's server
*/
import httpz from "@octanuary/httpz";
import reqBody from "./middlewares/req.body";
import resTime from "./middlewares/res.time";
import routes from "./routes/index";

/**
 * Starts the API server.
 */
export default function startServer() {
	const server = new httpz.Server();
	server.add(reqBody);
	server.add(resTime);
	server.add(routes);
	server.listen(process.env.SERVER_PORT);
	return server;
};
