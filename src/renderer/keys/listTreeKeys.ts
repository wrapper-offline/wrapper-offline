import { InjectionKey } from "vue";
import { FieldId, GenericListEntry } from "../interfaces/DataList";

const columnIdKey = Symbol();
/** list of list entry column ids to display */
export const genericColumnIdKey = <T extends GenericListEntry>() => columnIdKey as InjectionKey<FieldId<T>[]>;
