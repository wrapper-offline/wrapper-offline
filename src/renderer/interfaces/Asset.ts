export interface Asset {
	id: string,
	title: string,
	type: string,
	subtype: string,
	/** prop type, if the asset is a prop */
	ptype: string,
	/** duration in ms for sound assets */
	duration: number,
	/** width in px for video props */
	width: number,
	/** height in px for video props */
	height: number,
};
