import { onMounted, onUnmounted, ref } from "vue";

export function useScreenWidth() {
	const width = ref(window.innerWidth);
	const cb = () => {
		width.value = window.innerWidth;
	};
	onMounted(() => {
		window.addEventListener("resize", cb);
	});
	onUnmounted(() => {
		window.removeEventListener("resize", cb);
	});
	return width;
};
