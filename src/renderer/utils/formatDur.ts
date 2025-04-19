/**
 * converts ms to a time string
 */
export function formatDur(ms:number) {
	const totalSecs = ms / 1000;
	const minutes = totalSecs / 60;
	const seconds = minutes % 1 * 60;
	return `${String(~~(minutes)).padStart(2, "0")}:${String(~~(seconds)).padStart(2, "0")}`;
};
