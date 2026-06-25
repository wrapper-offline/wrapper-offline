<script setup lang="ts">
import { computed } from "vue";
import DropdownItem from "./DropdownItem.vue";
import DropdownMenu from "./DropdownMenu.vue";

const { align, options } = defineProps<{
	align?: "left" | "right",
	options: Record<any, string>
}>();
const model = defineModel<any>();

/**
 * updates the model with the clicked option's value
 * @param value 
 */
function option_click(value:any) {
	model.value = value;
}

const selectedText = computed(() => options[model.value] ?? model.value);
</script>

<template>
	<DropdownMenu :align="align">
		<template #toggle>
			<div class="select_button">
				<span>{{ selectedText }}</span>
				<div class="down_ico">&#9013;</div>
			</div>
		</template>
		<DropdownItem v-for="(desc, value) in options" :key="value" @click="option_click(value)">
			{{ desc }}
		</DropdownItem>
	</DropdownMenu>
</template>

<style scoped>
.select_button {
	background: #fff;
	border: 1px solid #cacad4;
	box-shadow: inset 0 1px 1px #0000001f;
	border-radius: 3px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 5px;
	height: 32px;
}
.select_button span {
	font-weight: bold;
	padding-right: 15px;
}
.select_button .down_ico {
	color: hsl(211, 92%, 63%);
	font-size: 20px;
	height: 5px;
	line-height: 0;
}

html.dark .select_button {
	background: hsl(250deg 11% 20%);
	border-color: hsl(250deg 11% 24%);
}
</style>
