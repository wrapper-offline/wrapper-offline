import { staticPaths, staticServer } from "../../utils/AppInit";
import BodyShape from "./BodyShape";

export default class CCTheme {
	public id:string;
	public defaultBodyShape:string;
	public bodyShapes:Record<string, BodyShape>;

	constructor(themeId:string) {
		this.id = themeId;
		this.bodyShapes = {};
	}

	/**
	 * retrieves a theme xml from the asset server
	 */
	public async load(): Promise<void> {
		const storePath = `cc_store/${this.id}/cc_theme.xml`;
		const url = `${staticServer}${staticPaths.storeUrl}/${storePath}`;
		const res = await fetch(url);
		if (res.status != 200) {
			console.log("Failed to fetch theme " + this.id);
			return;
		}
		const parser = new DOMParser();
		const ccThemeXml = parser.parseFromString(await res.text(), "application/xml");
		await this.parse(ccThemeXml.children[0]);
	}

	/**
	 * loops through all the cc theme xml nodes
	 */
	public parse(ccThemeXml:Element): Promise<void> {
		return new Promise((res, rej) => {
			const nodes = ccThemeXml.children;
			for (const i in nodes) {
				const node = nodes[i];
				const tagName:string = node.tagName as string;
				switch (tagName) {
					case "bodyshape": {
						const bodyshape = new BodyShape();
						bodyshape.parse(node);
						if (!this.defaultBodyShape) {
							this.defaultBodyShape = bodyshape.id;
						}
						this.bodyShapes[bodyshape.id] = bodyshape;
						break;
					}
				}
			}
			res();
		});
	}
};
