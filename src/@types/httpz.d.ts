import type { IncomingMessage, ServerResponse } from "http";
import { Group, Request, Response, Server } from "@octanuary/httpz";
import { File } from "formidable";

declare module "@octanuary/httpz" {
	interface Request extends IncomingMessage {
		body: {[key: string]: any};
		files: {[key: string]: File | void};
	}
	interface Response<Request = IncomingMessage> extends ServerResponse<Request> {
		logged: boolean;
		log: (toLog:string) => void;
	}
}
