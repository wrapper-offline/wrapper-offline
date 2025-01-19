import type { IncomingMessage, ServerResponse } from "http";

declare module "@octanuary/httpz" {
	interface Request extends IncomingMessage {
		body: {[key: string]: any};
		files: {[key: string]: any};
	}
	interface Response<Request = IncomingMessage> extends ServerResponse<Request> {
		logged: boolean;
		log: (toLog:string) => void;
	}
}
