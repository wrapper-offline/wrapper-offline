import type { Request, Response } from "@octanuary/httpz";

/**
 * logs to the console
 */
export default async function resLog(
	req:Request,
	res:Response,
	next:() => Promise<void>
) {
	console.log(`${req.method} [${(new Date()).toISOString()}] ${req.parsedUrl.pathname}`);
	res.log = (toLog) => {
		console.log(`${" ".repeat(req.method.length - 2)} * [${(new Date()).toISOString()}] ${toLog}`);
	};
	await next();
};
