import { apiServer } from "../controllers/AppInit";

export type Theme = {
	id: string,
	name: string,
	cc_theme_id?: string
};

export function useThemeList(ccFilter = false) : Promise<Theme[]> {
	return new Promise((res, rej) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			const themes = JSON.parse(this.responseText);
			let returnArray = [];
			for (const theme of themes) {
				if (ccFilter && !theme.cc_theme_id) {
					continue;
				}
				returnArray.push(theme);
			}
			res(returnArray);
		};
		xhttp.open("GET", `${apiServer}/api/theme/list`, true);
		xhttp.send();
	});
}
