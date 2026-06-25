<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";

const props = defineProps<{
	openWithHover?: boolean,
	align?: "left" | "right",
}>();

const toggle = useTemplateRef("toggle");
const showDropdown = ref(false);

function show(e:MouseEvent) {
	showDropdown.value = false;
	setTimeout(() => {
		window.addEventListener("click", hide);
		document.addEventListener("mouseleave", hide);
		showDropdown.value = true;
	}, 15);
}

function hide(e:MouseEvent) {
	window.removeEventListener("click", hide);
	document.removeEventListener("mouseleave", hide);
	if (e.target == toggle.value) {
		return;
	}
	showDropdown.value = false;
}

onMounted(() => {
	toggle.value?.addEventListener(props.openWithHover ? "mouseover" : "click", show);
});
</script>

<template>
	<div :class="{dropdown:true, right:align == 'right'}">
		<div class="dropdown_toggle" ref="toggle">
			<slot name="toggle">what</slot>
		</div>
		<Transition appear name="dropdown">
			<div class="dropdown_content" v-show="showDropdown" ref="content">
				<slot></slot>
			</div>
		</Transition>
	</div>
</template>

<style lang="css">
.dropdown {
	position: relative;
}
.dropdown .dropdown_toggle:hover {
	cursor: pointer;
}
.dropdown .dropdown_content {
	background: #fcfcfd;
	border: 1px solid #a09f9f;
	box-shadow: 0 2px 6px #0006;
	border-radius: 4px;
	z-index: 10;
	position: absolute;
	margin: -1px 0 0 5px;
	padding: 5px 0;
	width: max-content;
}
.dropdown.right .dropdown_content {
	right: 0;
}
.dropdown-enter-from {
	opacity: 0;
}
.dropdown-enter-active {
	transition: opacity 300ms linear;
}
</style>
