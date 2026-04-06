import ffmpegPath from "ffmpeg-static";
import ffprobePath from "@derhuerst/ffprobe-static";
import { once } from "events";
import type { Readable } from "stream";
import { spawn } from "child_process";

export default {
	/**
	 * converts an audio input to an mp3
	 * @param input audio stream or file path
	 * @param inExt input file extension
	 * @param outPath output path, returns nothing OR "-", returns out stream
	 */
	convertToMp3(input:Readable | string, inExt:string, outPath:string | "-"): Promise<void | Readable> {
		const usePath = typeof input == "string";
		return new Promise(async (res, rej) => {
			const ffmpeg = spawn(
				ffmpegPath,
				[
					"-v", "error",
					"-f", inExt,
					"-i", usePath ? input : "-",
					"-codec:a", "libmp3lame",
					"-qscale:a", "2",
					"-f", "mp3",
					outPath
				]
			);
			if (!usePath) {
				input.pipe(ffmpeg.stdin);
			}
			if (outPath == "-") {
				return res(ffmpeg.stdout);
			}
			let data = "";
			ffmpeg.stdout.on("data", (c) => {
				data += c;
			});
			await once(ffmpeg, "exit");
			if (data.length > 0) {
				console.log("Error occurred during audio conversion:", data);
				return rej(data);
			}
			res();
		});
	},

	/**
	 * returns the duration of a media file in seconds using ffprobe
	 * @param input path of the media file
	 */
	mediaDuration(input:Readable | string): Promise<number> {
		const usePath = typeof input == "string";
		return new Promise((res, rej) => {
			const ffprobe = spawn(
				ffprobePath,
				[
					"-v", "quiet",
					"-print_format", "compact=nk=1:p=0",
					"-show_entries", "format=duration",
					usePath ? input : "pipe:0"
				]
			);
			ffprobe.stdout.on("data", (c) => {
				res(Number(c));
			});
			ffprobe.stderr.on("data", (c) => {
				console.log("Error occurred getting duration:", c.toString());
				rej(c.toString());
			});
			if (!usePath) {
				input.pipe(ffprobe.stdin);
			}
		});
	}
};
