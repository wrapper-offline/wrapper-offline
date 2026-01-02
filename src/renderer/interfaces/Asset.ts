// export interface Asset {
// 	id: string,
// 	title: string,
// 	type: string,
// 	subtype: string,
// 	/** prop type, if the asset is a prop */
// 	ptype: string,
// 	/** duration in ms for sound assets */
// 	duration: number,
// 	/** width in px for video props */
// 	width: number,
// 	/** height in px for video props */
// 	height: number,
// };

export interface Base {
	id: string,
	title: string,
	tags?: string,
	type: string,
};

export interface Char extends Base {
	type: "char",
	themeId: string,
};

export interface ImageProp extends Base {
	type: "prop",
	subtype: "0",
	ptype: "placeable" | "headable" | "holdable" | "wearable",
	/** duration in ms for sound assets */
	duration: number,
	/** width in px for video props */
	width: number,
	/** height in px for video props */
	height: number,
};

export interface VideoProp extends Base {
	type: "prop",
	subtype: "video",
	/** duration in ms for sound assets */
	duration: number,
	/** width in px for video props */
	width: number,
	/** height in px for video props */
	height: number,
};

export type Prop = ImageProp | VideoProp;

export interface Background extends Base {
	type: "bg",
};

export interface Sound extends Base {
	type: "sound",
	subtype: "bgmusic" | "soundeffect" | "voiceover" | "tts",
	duration: number,
};

export type Asset = Prop | Background | Sound;
