<style>
.char_cell {
	user-select: none;
	display: inline-block;
	border: 1px solid hsl(252deg 16% 82%);
    border-radius: 4px;
    margin: 0 0 15px;
}
.char_cell .thumb {
	pointer-events: none;
	overflow: hidden;
	display: flex;
	width: 180px;
	height: 180px;
}
.char_cell .thumb img {
	animation: .25s thumb_fade;
	object-fit: scale-down;
	margin: auto;
	height: 100%;
}
.char_cell .thumb img.hide {
	visibility: hidden;
}
.char_cell img[src*="load_circle.svg"] {
	animation: .8s spinner infinite linear;
	height: auto;
}

html.dark .char_cell img[src*="load_circle.svg"] {
	filter: invert();
}

@media (max-width: 700px) {
	.char_cell .thumb {
		width: 100px;
		height: 100px;
	}
}

@media (min-width: 1270px) {
	.char_cell {
		width: 200px;
	}
	.char_cell .thumb {
		width: 200px;
		height: 200px;
	}
}

@keyframes thumb_fade {
	0%   { opacity: 0 }
	100% { opacity: 1 }
}
@keyframes spinner {
	0%      { transform: rotate(0) }
	8.329%  { transform: rotate(0) }
	8.33%   { transform: rotate(30deg) }
	16.659% { transform: rotate(30deg) }
	16.66%  { transform: rotate(60deg) }
	24.999% { transform: rotate(60deg) }
	25%     { transform: rotate(90deg) }
	33.329% { transform: rotate(90deg) }
	33.33%  { transform: rotate(120deg) }
	41.659% { transform: rotate(120deg) }
	41.66%  { transform: rotate(150deg) }
	49.999% { transform: rotate(150deg) }
	50%     { transform: rotate(180deg) }
	58.329% { transform: rotate(180deg) }
	58.33%  { transform: rotate(210deg) }
	66.659% { transform: rotate(210deg) }
	66.66%  { transform: rotate(240deg) }
	74.999% { transform: rotate(240deg) }
	75%     { transform: rotate(270deg) }
	83.329% { transform: rotate(270deg) }
	83.33%  { transform: rotate(300deg) }
	91.659% { transform: rotate(300deg) }
	91.66%  { transform: rotate(330deg) }
	99.999% { transform: rotate(330deg) }
	100%    { transform: rotate(360deg) }
}
</style>

<script setup lang="ts">
import { defineComponent, ref } from "vue";
import GenericRowOptions from "./options/GenericRowOptions.vue";
import { Char } from "../../interfaces/Asset";
import { apiServer } from "../../utils/AppInit";
import useCharRenderer from "../../composables/useCharRenderer";

const props = defineProps<{
	checked: boolean,
	entry: Char
}>();
defineComponent({
	optionsComponent: GenericRowOptions
});
defineExpose({ id:"" });

const cr = useCharRenderer();
const src = ref(`${apiServer}/assets/${props.entry.id}.png`);

function load(e:Event) {
	const elem = e.target as HTMLImageElement;
	elem.classList.remove("hide");
}

function fail(e:Event) {
	const elem = e.target as HTMLImageElement;
	src.value = "/img/load_circle.svg";
	elem.classList.remove("hide");
	cr.renderThumb(props.entry.id, props.entry.themeId, (bytes:string) => {
		src.value = "data:image/png;base64," + bytes;
	});
}
</script>

<template>
	<div class="char_cell">
		<div class="thumb">
			<img class="hide" :src="src" @load="load" @error="fail"/>
		</div>
		
		{{ entry.title }}, {{ entry.id }}
	</div>
</template>
