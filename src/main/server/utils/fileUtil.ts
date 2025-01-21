import fs from "fs";
import Ffmpeg from "fluent-ffmpeg";
import nodezip from "node-zip";
import type { PassThrough, Readable, Writable } from "stream";
import { path as ffmpegPath } from "@ffmpeg-installer/ffmpeg";

Ffmpeg.setFfmpegPath(ffmpegPath);

export default {
	/**
	 * converts a readable stream to an mp3
	 * @param data readable stream
	 * @param fileExt file extension
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
