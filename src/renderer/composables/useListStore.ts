import { reactive } from "vue";

/** list needs to be refreshed */
const pendingRefresh = reactive({
	value: false,
	set(newValue: boolean) {
		this.value = newValue;
	}
});

/** searcg box input */
const search = reactive({
	value: "",
	set(newValue: string) {
		this.value = newValue.toLowerCase();
	}
});

/** list view, grid or list */
const viewMode = reactive({
	value: localStorage.getItem("list_view") || "list",
	set(newValue: "list"|"grid") {
		this.value = newValue;
		localStorage.setItem("list_view", this.value);
	}
});

/** size of list elements */
const zoomLevel = reactive({
	value: localStorage.getItem("list_zoomLevel") || "60",
	set(newValue: number) {
		this.value = newValue.toString();
		localStorage.setItem("list_zoomLevel", this.value);
	},
	get() {
		return Number(this.value);
	},
	css() {
		return this.value + "px";
	}
});

export default function useListStore() {
	return {
		pendingRefresh,
		search,
		viewMode,
		zoomLevel
	};
};
