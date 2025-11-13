import { InjectionKey } from "vue";

const columnIdKey = Symbol();
/** list of list entry column ids to display */
export const genericColumnIdKey = <T>() => columnIdKey as InjectionKey<(keyof T)[]>;
