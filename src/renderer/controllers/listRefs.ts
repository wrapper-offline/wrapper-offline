import { reactive, ref } from "vue";

/** searcg box input */
export const search = ref("");
export function searchInput(newValue:string) {
	search.value = newValue.toLowerCase();
};
/** list view, grid or list */
export const view = ref(localStorage.getItem("list_view") || "list");
export function setView(newView:"list"|"grid") {
	view.value = newView;
	localStorage.setItem("list_view", view.value);
};
/** size of list elements */
export const zoomLevel = ref(localStorage.getItem("list_zoomLevel") || "60px");
export function setZoomLevel(newZoom:number) {
	zoomLevel.value = newZoom + "px";
	localStorage.setItem("list_zoomLevel", zoomLevel.value);
};
/** list needs to be refreshed */
export const pendingRefresh = reactive({
	value: false,
	set(newValue: boolean) {
		this.value = newValue;
	}
});
