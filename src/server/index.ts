import httpz from "@octanuary/httpz";
import reqBody from "./middlewares/req.body";
import resTime from "./middlewares/res.time";
import routes from "./routes/index";

const ServerController = {
	/**
	 * starts the servers
	 */
	startAll() {
		this.startStaticServer();
		this.startAPIServer();
	},

	/**
	 * Starts the API server.
	 */
	startAPIServer() {
		const server = new httpz.Server();
		server.add(reqBody);
		server.add(resTime);
		server.add(routes);
		server.listen(process.env.SERVER_PORT);
		return server;
	},

	/**
	 * Starts the static server.
	 */
	startStaticServer() {
	
	},
};

ServerController.startAll();

export default ServerController;
