export function HSVtoRGB(hsv:[number, number, number]) {
	const h = hsv[0];
	const s = hsv[1] / 100;
	const v = hsv[2] / 100;
	const f = (n:number, k=(n + h / 60) % 6) => v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
	return [f(5), f(3), f(1)].map(v => v * 255) as [number, number, number];
};

export function RGBToDecimal(rgb:[number, number, number]) {
	rgb = rgb.map(v => Math.round(v)) as [number, number, number];
	return (rgb[0] << 16) + (rgb[1] << 8) + rgb[2];
};

export function RGBtoHex(rgb:[number, number, number]) {
	return RGBToDecimal(rgb).toString(16).padStart(6, "0").toUpperCase();
};

export function decimalToRGB(color:number): [number, number, number] { // TODO: there's a better way to do this
	const r = color >> 16;
	color = color - (r << 16);
	const g = color >> 8;
	color = color - (g << 8);
	const b = color;
	return [r, g, b];
};

export function RGBtoHSV(rgb:[number, number, number]) {
	const r = rgb[0] / 255;
	const g = rgb[1] / 255;
	const b = rgb[2] / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const chroma = max - min;
	let hue:number = 0;
	switch (max) {
		case min:
			hue = 0;
			break;
		case r:
			hue = 60 * (((g - b) / chroma) % 6);
			break;
		case g:
			hue = 60 * ((b - r) / chroma + 2);
			break;
		case b:
			hue = 60 * ((r - g) / chroma + 4);
			break;
	}
	if (hue < 0) hue = 360 + hue;
	const saturation = max == 0 ? 0 : chroma / max;
	return [hue, saturation * 100, max * 100];
};
