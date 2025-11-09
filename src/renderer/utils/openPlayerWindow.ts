/**
 * opens a video player window
 */
export default function openPlayerWindow(movieId:string) {
	const width = screen.width > 1280 ? 1280 : 560;
	const height = screen.height > 720 ? 720 : 315;
	window.open(
		`?redirect=/movies/play/${movieId}`,
		"MsgWindow",
		`width=${width},height=${height},left=${screen.width / 2 - 640},top=${screen.height / 2 - 360}`
	);
};
