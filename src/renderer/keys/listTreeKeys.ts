import { InjectionKey } from "vue";
import { FieldId, DataListEntry, ViewMode } from "../interfaces/DataList";

const columnIdKey = Symbol();
/** list of list entry column ids to display */
export const genericColumnIdKey = <T extends DataListEntry>() => columnIdKey as InjectionKey<FieldId<T>[]>;
/** which view mode to use */
export const modeKey = Symbol() as InjectionKey<() => ViewMode>;
