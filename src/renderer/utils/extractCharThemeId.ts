/**
 * returns a theme id from a character xml
 * @param charXml character xml
 */
export default function extractCharThemeId(charXml:string) {
	const start = charXml.indexOf("theme_id=\"") + 10;
	const end = charXml.indexOf("\"", start);
	return charXml.substring(start, end);
};
