import { InjectionKey } from "vue";
import { zoomLevel } from "../controllers/listRefs";

const columnIdKey = Symbol();
/** list of list entry column ids to display */
export const genericColumnIdKey = <T>() => columnIdKey as InjectionKey<(keyof T)[]>;
/** size of list items */
export const zoomLevelKey = Symbol() as InjectionKey<typeof zoomLevel>;
