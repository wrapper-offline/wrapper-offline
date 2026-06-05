<style>
.clp_dropdown {
	position: relative;
}

.clp_btn {
	background: #f00;
	border: 1px solid hsl(240 12% 76% / 1);
	border-radius: 3px;
	display: block;
	width: 60px;
	height: 32px;
}
.clp_btn:focus {
	outline: none;
}

.clp_picker {
	background: #fffc;
	box-shadow: 0 1px 2px #6664;
	border-radius: 5px;
	z-index: 10;
	position: absolute;
	margin-top: 4px;
	padding: 8px;
	width: 240px;
	height: 255px;
}

.color_fields {
	margin-bottom: 8px;
	display: flex;
}
.color_fields .sl_field {
	background-image: linear-gradient(#0000, #000), linear-gradient(90deg, #fff, #0000);
	border-radius: 8px;
	cursor: crosshair;
	flex-shrink: 0;
	margin-right: 7px;
	width: 200px;
	height: 200px;
}
.color_fields .sl_field .cursor {
	box-shadow: 0 2px 2px 1px #0005, inset 0 2px 2px 1px #0002;
	pointer-events: none;
	position: absolute;
}

.color_fields .h_slider {
	background: transparent;
	cursor: crosshair;
	transform: rotate(-90deg);
	flex-shrink: 0;
    margin-top: 92px;
	margin-left: -91px;
	width: 200px;
	height: 16px;
	-webkit-appearance: none;
	appearance: none;
}
.color_fields .h_slider:focus {
	outline: none;
}
.color_fields .h_slider::-webkit-slider-runnable-track {
	background: linear-gradient(90deg, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);
	border-radius: 7px;
	width: 100%;
	height: 16px;
	-webkit-appearance: none;
}
.color_fields .h_slider::-webkit-slider-thumb {
	margin-top: -2px;
	box-shadow: -2px 0 2px 1px #0005, inset -2px 0 2px 1px #0002;
	-webkit-appearance: none;
}

.color_fields .h_slider::-webkit-slider-thumb,
.cursor {
	background: #0000;
	border: 3px solid #fff;
	border-radius: 15px;
	cursor: inherit;
	width: 20px;
	height: 20px;
}
</style>

<script setup lang="ts">
import { onMounted, ref, useTemplateRef } from "vue";
import { decimalToRGB, HSVtoRGB, RGBtoHex, RGBtoHSV } from "../../utils/colorUtil";
import TextInput from "./TextInput.vue";

enum ColorSpace {
	HEX,
	RGB,
	HSV
};

const emit = defineEmits<{
	/** value as hsv */
	input: [[number, number, number]],
}>();
const props = defineProps<{
	align?: "left" | "right",
	/** tooltip text to display on the button */
	tooltip?: string,
}>();

const dropdown = useTemplateRef("dropdown");
const showDropdown = ref(false);
const slField = useTemplateRef("sl-field");
const toggle = useTemplateRef("toggle");
const hexDisplay = defineModel({
	set(displayed:string) {
		let color = Number("0x" + displayed.toLowerCase());
		if (displayed.length != 6 || Number.isNaN(color)) {
			return RGBtoHex(HSVtoRGB([hue.value, saturation.value, value.value]));
		}
		const [r, g, b] = decimalToRGB(color);
		const hsv = RGBtoHSV([r, g, b]);
		hue.value = hsv[0];
		saturation.value = hsv[1];
		value.value = hsv[2];
	},
	get: () => RGBtoHex(HSVtoRGB([hue.value, saturation.value, value.value]))
});
const hue = ref(0);
const saturation = ref(0);
const value = ref(0);

function toggle_click(e:MouseEvent) {
	if (showDropdown.value == true) {
		showDropdown.value = false;
		return;
	}
	setTimeout(() => {
		window.addEventListener("click", doc_click);
		// document.addEventListener("mouseleave", doc_click);
		showDropdown.value = true;
	}, 15);
}
function doc_click(e:MouseEvent) {
	if (dropdown.value.contains(e.target as HTMLElement)) {
		return;
	}
	window.removeEventListener("click", doc_click);
	// document.removeEventListener("mouseleave", doc_click);
	showDropdown.value = false;
}

function slField_mousedown() {
	const { x, y } = slField.value.getBoundingClientRect();
	const mousemove = (e:MouseEvent) => {
		const x2 = Math.max(0, Math.min(e.clientX - x, 200));
		const y2 = Math.max(0, Math.min(200 - (e.clientY - y), 200));
		saturation.value = x2 / 2;
		value.value = y2 / 2;
		doEmit();
	};
	window.addEventListener("mouseup", () => {
		window.removeEventListener("mousemove", mousemove);
	});
	window.addEventListener("mousemove", mousemove);
}

function doEmit() {
	emit("input", [hue.value, saturation.value, value.value]);
}

onMounted(() => {
	toggle.value?.addEventListener("click", toggle_click);
	slField.value?.addEventListener("mousedown", slField_mousedown);
});
</script>

<template>
	<div :class="{clp_dropdown:true, right:align == 'right'}" ref="dropdown">
		<button
			class="clp_btn"
			ref="toggle"
			v-tooltip="props.tooltip"
			:style="{
				background: `rgb(${HSVtoRGB([hue, saturation, value]).join(',')})`
			}"
		></button>
		<div class="clp_picker" v-show="showDropdown">
			<div class="color_fields">
				<div
					class="sl_field"
					ref="sl-field"
					:style="{
						backgroundColor: `hsl(${hue}, 100%, 50%)`
					}"
				>
					<div class="cursor" :style="{
						marginLeft: `${saturation * 2 - 10}px`,
						marginTop: `${200 - value * 2 - 10}px`
					}"></div>
				</div>
				<input class="h_slider" type="range" min="0" max="359" v-model="hue" @input="doEmit"/>
			</div>
			<div class="text_fields">
				<TextInput v-model="hexDisplay"/>
			</div>
		</div>
	</div>
</template>
