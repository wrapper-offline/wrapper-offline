import Ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobePath from "@derhuerst/ffprobe-static";
import fs from "fs";
import nodezip from "node-zip";
import type { PassThrough, Readable, Writable } from "stream";
import { spawn } from "child_process";

Ffmpeg.setFfmpegPath(ffmpegPath);

export default {
	/**
	 * converts a readable stream to an mp3
	 * @param data readable stream
	 * @param fileExt input file extension
	 * @returns returns a passthrough stream
	 */
	convertToMp3(data:Readable, fileExt:string): Promise<PassThrough | Writable> {
		return new Promise((res, rej) => {
			const command = Ffmpeg(data)
				.inputFormat(fileExt)
				.toFormat("mp3")
				.audioBitrate(4.4e4)
				.on("error", (err) => rej(err));
			res(command.pipe());
		});
	},

	/**
	 * returns the duration of a media file in seconds using ffprobe
	 * @param filepath path of the media file
	 */
	mediaDuration(filepath:string): Promise<number> {
		return new Promise((res, rej) => {
			const ffprobe = spawn(
				ffprobePath,
				[
					"-v", "quiet",
					"-print_format", "compact=nk=1:p=0",
					"-show_entries", "format=duration",
					filepath
				]
			);
			ffprobe.stdout.on("data", (c) => {
				console.log(c);
				res(Number(c));
			});
			ffprobe.stderr.on("data", (c) => {
				console.log("Error occurred getting duration:", c);
				rej(c);
			});
		});
	},

	/**
	 * creates a new zip with a file inside it
	 * @param fileName path to the actual file
	 * @param zipName file path within the zip
	 */
	zippy(fileName:string, zipName:string) {
		if (!fs.existsSync(fileName)) {
			throw new Error(`Directory '${fileName}' doesn't exist.`);
		}
		const buffer = fs.readFileSync(fileName);
		const zip = nodezip.create();
		this.addToZip(zip, zipName, buffer);
		return zip.zip();
	},

	/**
	 * @param zip nodezip zipfile instance
	 * @param zipName file path within the zip
	 * @param buffer file contents
	 */
	addToZip(zip:nodezip.ZipFile, zipName:string, buffer:Buffer) {
		zip.add(zipName, buffer);
		if (zip[zipName].crc32 < 0)
			zip[zipName].crc32 += 4294967296;
	},
};
