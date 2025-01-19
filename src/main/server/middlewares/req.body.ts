import formidable from "formidable";
import type { Request, Response } from "@octanuary/httpz";

/**
 * request body parser
 */
export default async function reqBody(
	req:Request,
	res:Response,
	next:() => Promise<void>
) {
	req.body = {};
	if (req.method == "POST")
		await new Promise((resolve, reject) =>
			new formidable.IncomingForm().parse(req, async (e, f, files) => {
				req.body = f;
				req.files = files;
				resolve(null);
			}
		));
	res.setHeader("Access-Control-Allow-Origin", "*");
	next();
};
