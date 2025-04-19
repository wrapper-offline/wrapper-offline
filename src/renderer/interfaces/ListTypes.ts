import type { Ref } from "vue";

/** required values in a list entry */
export type GenericListEntry = {
	id: string
};
/** column to be displayed on a list */
export interface ListFieldColumn<T extends GenericListEntry> {
	id: FieldIdOf<T>,
	width: Ref<number>,
};
/* field id of a list entry */
export type FieldIdOf<T extends GenericListEntry> = keyof T;

export interface SelectedListSort<T extends GenericListEntry> {
	id: FieldIdOf<T>,
	descending: boolean,
};
