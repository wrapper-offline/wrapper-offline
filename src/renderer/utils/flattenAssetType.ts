export function flattenAssetType(type:string, subtype:string, ptype?:string): string {
	switch (type) {
		case "bg": {
			return type;
		}
		case "sound": {
			return subtype;
		}
		case "prop": {
			if (subtype == "video") {
				return subtype;
			}
			return ptype;
		}
	}
};
