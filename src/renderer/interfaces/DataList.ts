import type { Ref } from "vue";
import DataListRow from "../components/list/DataListRow.vue";
import GenericRowOptions from "../components/list/options/GenericRowOptions.vue";

export type DataListRow2<E extends GenericListEntry> = typeof DataListRow<E> & {
	optionsComponent: typeof GenericRowOptions<E>
};

/** required values in a list entry */
export type GenericListEntry = {
	id: string,
	title: string
};
/** column to be displayed on a list */
export interface ListFieldColumn<T extends GenericListEntry> {
	id: FieldId<T>,
	width: Ref<number>,
};
/* field id of a list entry */
export type FieldId<T extends GenericListEntry> = keyof T | "index";

export interface SelectedListSort<T extends GenericListEntry> {
	id: FieldId<T>,
	descending: boolean,
};
