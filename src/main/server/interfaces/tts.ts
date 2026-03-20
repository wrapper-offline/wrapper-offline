import { Readable } from "stream";

/**
 * @param voice specified voice
 * @param text input text
 */
export type TTSGenerateFunc = (voice:Record<string, any> & Voice, text:string) => Promise<Buffer | Readable>;

export interface Voice {
	/** country the voice's accent comes from */
	country: string,
	/** code of the language the voice is for */
	lang: string,
	/** gender of the voice */
	gender: "M" | "F",
	/** name of the voice */
	name: string
};

export interface Engine {
	/** name of the TTS engine */
	name: string,
	/** maximum number of characters */
	limit: number,
	/** list of voice objects */
	voices: Voice[],
	/** generate function */
	generate: TTSGenerateFunc
};
