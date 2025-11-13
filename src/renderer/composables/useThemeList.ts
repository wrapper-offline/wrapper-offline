import { apiServer } from "../utils/AppInit";

export type Theme = {
	id: string,
	name: string,
	cc_theme_id?: string,
};

function getThemeList(): any {
	return new Promise((res, rej) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			const themes = JSON.parse(this.responseText);
			res(themes);
		};
		xhttp.open("GET", `${apiServer}/api/theme/list`, true);
		xhttp.send();
	});
}

/**
 * returns the unsorted themelist
 * @param ccFilter return only cc themes
 * @returns list of themes
 */
export async function useThemeList(ccFilter = false) : Promise<Theme[]> {
	const themes = await getThemeList();
	let returnArray = [];
	for (const theme of themes) {
		if (ccFilter && !theme.cc_theme_id) {
			continue;
		}
		returnArray.push(theme);
	}
	return returnArray;
};

/**
 * returns the themelist sorted by column
 * @param ccFilter return only cc themes
 * @returns list of theme columns
 */
export async function useSortedList(ccFilter = false) : Promise<Theme[][]> {
	const themes = await getThemeList();
	let returnArray:Theme[][] = [];
	for (const theme of themes) {
		if (ccFilter && !theme.cc_theme_id) {
			continue;
		}
		const column = ccFilter ? 0 : Number(theme.col) - 1;
		if (typeof returnArray[column] == "undefined") {
			returnArray[column] = [];
		}
		returnArray[column].push(theme);
	}
	return returnArray;
};
