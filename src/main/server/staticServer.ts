import handler from "serve-handler";
import { IncomingMessage, ServerResponse } from "http";
import path from "path";

const staticPath = path.join(__dirname, "../resources/static");

export default async function staticServer(
	req:IncomingMessage,
	res:ServerResponse
) {
	await handler(req, res, {
		public: staticPath,
		headers: {
			"Cache-Control": "no-store"
		}
	});
};
