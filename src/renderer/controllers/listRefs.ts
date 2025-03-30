import { ref, toValue } from "vue";

export const currentSortKey = Symbol() as InjectionKey<Ref<CurrentListSort<ListEntry>>>;
/** list view, grid or list */
export const view = ref(localStorage.getItem("list_view") || "list");
export function setView(newView:"list"|"grid") {
	view.value = newView;
	localStorage.setItem("list_view", toValue(view));
};
/** size of list elements */
export const zoomLevel = ref(localStorage.getItem("list_zoomLevel") || "60px");
export function setZoomLevel(newZoom:number) {
	zoomLevel.value = newZoom + "px";
	localStorage.setItem("list_zoomLevel", toValue(zoomLevel));
};
