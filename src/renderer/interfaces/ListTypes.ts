import type { Ref } from "vue";

/** required values in a list entry */
export type EntryBase = {
	id: string
};
export interface ListFieldColumn<T extends EntryBase> {
	id: FieldIdOf<T>,
	title: string,
	width: Ref<number>,
};
/* field id of a list entry */
export type FieldIdOf<T extends EntryBase> = keyof T;

export interface SelectedListSort<T extends EntryBase> {
	id: FieldIdOf<T>,
	descending: boolean,
};
