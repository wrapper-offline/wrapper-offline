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

export default function useListStore() {
	return {
		pendingRefresh,
		search
	};
};
