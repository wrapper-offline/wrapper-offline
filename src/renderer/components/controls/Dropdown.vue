<style lang="css">
.dropdown_toggle:hover {
	cursor: pointer;
}
.dropdown_content {
	background: #fcfcfd;
	border: 1px solid #a09f9f;
	box-shadow: 0 2px 6px #0006;
	border-radius: 4px;
	position: absolute;
	padding: 5px 0;
	margin: -1px 0 0 5px;
}
.v-enter-from {
	opacity: 0;
}
.v-enter-active {
	transition: opacity 300ms linear;
}
</style>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";

const props = defineProps<{
	openWithHover?: boolean
}>();



const toggle = useTemplateRef("toggle");
const content = useTemplateRef("content");
const showDropdown = ref(false);

if (props.openWithHover) {
	onMounted(() => {
		toggle.value?.addEventListener("mouseover", show);
		function show(e:MouseEvent) {
			showDropdown.value = true;
			setTimeout(() => {
				window.addEventListener("click", clicked);
				document.addEventListener("mouseleave", clicked);
			}, 15);
		}
		function clicked(e:MouseEvent) {
			window.removeEventListener("click", clicked);
			document.removeEventListener("mouseleave", clicked);
			showDropdown.value = false;
		}
	});
} else {
	onMounted(() => {
		toggle.value?.addEventListener("click", show);
		function show(e:MouseEvent) {
			showDropdown.value = false;
			setTimeout(() => {
				window.addEventListener("click", clicked);
				document.addEventListener("mouseleave", clicked);
				showDropdown.value = true;
			}, 15);
		}
		function clicked(e:MouseEvent) {
			window.removeEventListener("click", clicked);
			document.removeEventListener("mouseleave", clicked);
			if (e.target == toggle.value) {
				return;
			}
			showDropdown.value = false;
		}
	});
}
</script>

<template>
	<div class="dropdown">
		<div class="dropdown_toggle" ref="toggle">
			<slot name="toggle">what</slot>
		</div>
		<Transition appear>
			<div class="dropdown_content" v-show="showDropdown" ref="content">
				<slot></slot>
			</div>
		</Transition>
	</div>
</template>