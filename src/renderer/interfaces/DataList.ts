import type { Ref } from "vue";
import DataListRow from "../components/list/rows/DataListRow.vue";
import DataListOptions from "../components/list/options/DataListOptions.vue";

export type DataListRow2<E extends DataListEntry> = typeof DataListRow<E> & {
	optionsComponent: typeof DataListOptions<E>
};

/** required values in a list entry */
export type DataListEntry = {
	id: string,
	title: string
};
/** column to be displayed on a list */
export interface ListFieldColumn<T extends DataListEntry> {
	id: FieldId<T>,
	width: Ref<number>,
};
/* field id of a list entry */
export type FieldId<T extends DataListEntry> = keyof T | "index";

export interface SelectedListSort<T extends DataListEntry> {
	id: FieldId<T>,
	descending: boolean,
};

export enum ViewMode {
	Grid,
	List
};
