export default function unwrapJson(text:string | null, fallback:any) {
	if (text !== null) {
		try {
			return JSON.parse(text);
		} catch (e) {
		}
	}
	return fallback;
};
