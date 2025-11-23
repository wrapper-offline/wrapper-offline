<style>
.wm_manager input {
	display: none;
}

.wm_manager .watermark_container {
	width: calc(100% + 20px);
}

.wm_manager .upload_button,
.wm_manager .watermark {
	background-color: hsl(252deg 16% 97%);
	border: 1px solid hsl(252deg 16% 82%);
	border-radius: 4px;
	display: inline-block;
	margin: 0 14px 16px 0;
	width: 124px;
	height: 66px;
}

.wm_manager .upload_button {
	display: inline-flex;
	justify-content: center;
}
.wm_manager .upload_button small {
	font-size: 14px;
	font-weight: bold;
	margin: 0;
	padding: 19px 0 0 5px;
}

.wm_manager .watermark .thumbnail  {
	user-select: none;
	-webkit-user-drag: none;
	object-fit: contain;
	width: 100%;
	height: 100%;
}
.wm_manager .watermark .actions {
	display: none;
	position: relative;
	top: 4px;
	height: 0;
}
.wm_manager .watermark .actions .ico.btn {
	margin: 0 2px 0 4px;
}

.wm_manager .upload_button:hover,
.wm_manager .watermark:hover {
	background-color: hsl(338deg 55% 85%);
	border-color: hsl(338deg 55% 77%);
	cursor: pointer;
}
.wm_manager .watermark:hover .actions {
	display: block;
}

.wm_manager .upload_button.checked,
.wm_manager .watermark.checked {
	background-color: hsl(338deg 55% 85%);
	border-color: #fc4f7d;
	box-shadow: inset 0 0 0 1px #fc4f7d;
}
.wm_manager .watermark.checked::after {
	content: "\E207";
    font-family: "GlyphiconsRegular";
    background: #fc4f7d;
	color: #fff;
    border-radius: 100%;
    float: right;
    position: relative;
    top: -78px;
    right: -10px;
    padding: 0 5px 1px 6px;
}

html.dark .wm_manager .upload_button,
html.dark .wm_manager .watermark {
	background-color: hsl(250deg 10% 19%);
	border-color: hsl(250deg 11% 26%);
}

html.dark .wm_manager .upload_button:hover,
html.dark .wm_manager .watermark:hover {
	background-color: hsl(330 26% 26% / 1);
	border-color: hsl(330 26% 41% / 1);
}

html.dark .wm_manager .watermark.checked {
	background: hsl(342 47% 40% / 0.45);
	border-color: hsl(342deg 55% 48%);
	box-shadow: inset 0 0 0 1px hsl(342deg 55% 48%);
}
html.dark .wm_manager .watermark.checked::after {
    background: hsl(342deg 55% 48%);
}
</style>

<script setup lang="ts">
import { apiServer } from "../../utils/AppInit";
import Button from "../controls/Button.vue";
import { onMounted, ref, useTemplateRef } from "vue";
import useAppSettings from "../../composables/useAppSettings";

type Watermark = {
	id: string,
	/** thumbnail path */
	thumbnail: string
};

const appSettings = useAppSettings();
const container = useTemplateRef("wm-container");
const defaultWm = ref<string>(appSettings.get("defaultWatermark") as string);
const pendingReplaceId = ref<string>();
const wmInput = useTemplateRef<HTMLInputElement>("wm-input");
const wmReplaceInput = useTemplateRef<HTMLInputElement>("wm-replace-input");
const watermarks = ref<Watermark[]>([]);

/**
 * requests a list of watermarks from the api server
 */
async function loadWatermarks() {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState != 4 || this.status != 200) {
			return;
		}
		let responseJson = JSON.parse(this.responseText);
		watermarks.value = responseJson;
	};
	const url = apiServer + "/api/watermark/list";
	xhttp.open("GET", url, true);
	xhttp.send();
}

/**
 * called when an image is selected,
 * uploads image to api server
 */
async function wmInput_input(replaceMode?:boolean) {
	const image = replaceMode ?
		wmReplaceInput.value.files[0] :
		wmInput.value.files[0];
	const id = pendingReplaceId.value;

	const body = new FormData();
	body.append("image", image);
	if (replaceMode) {
		body.append("id", id);
	}
	const res = await fetch(apiServer + "/api/watermark/save", {
		method: "POST",
		body
	});

	wmInput.value.value = "";
	wmReplaceInput.value.value = "";
	pendingReplaceId.value = null;
	if (!res.ok) {
		return;
	}
	const json = await res.json();
	if (replaceMode) {
		const wmImage:HTMLImageElement = container.value.querySelector(`[src*="${id}"]`);
		await fetch(wmImage.src);
		wmImage.src = wmImage.src;
		return;
	}
	watermarks.value.unshift(json);
}

/**
 * called when a watermark is clicked, sets the default
 * @param id wm id
 */
async function wm_click(id:string) {
	const body = new FormData();
	if (id == defaultWm.value) {
		id = null;
	} else {
		body.append("id", id);
	}

	const res = await fetch(apiServer + "/api/watermark/set_default", {
		method: "POST",
		body
	});
	if (res.ok) {
		defaultWm.value = id;
	}
}

/**
 * called when a watermark's replace button is clicked, starts upload process
 * @param id wm id
 */
async function wmReplace_click(id:string) {
	pendingReplaceId.value = id;
	wmReplaceInput.value.click();
}

/**
 * called when a watermark's delete button is clicked, deletes
 * @param id wm id
 */
async function wmDelete_click(id:string) {
	if (!confirm("ya sure")) {
		return;
	}
	const body = new FormData();
	body.append("id", id);

	const res = await fetch(apiServer + "/api/watermark/delete", {
		method: "POST",
		body
	});
	if (res.ok) {
		const index = watermarks.value.findIndex(w => w.id == id);
		watermarks.value.splice(index, 1);
	}
}

onMounted(loadWatermarks);
</script>

<template>
	<div class="wm_manager">
		<div class="app_setting">
			<div>
				<h3>Manage watermarks</h3>
				<p>Upload, delete or set a default watermark</p>
			</div>
		</div>
		<div class="watermark_container" ref="wm-container">
			<div class="upload_button" @click="wmInput.click">
				<img src="/img/importer/import.svg" alt="Upload"/>
				<small>Upload</small>
			</div>
			<div :class="{
				watermark: true,
				checked: defaultWm == '0vTLbQy9hG7k'
			}" @click="wm_click('0vTLbQy9hG7k')">
				<img class="thumbnail" src="/img/logo.svg"/>
			</div>
			<div v-for="wm in watermarks" :class="{
				watermark: true,
				checked: defaultWm == wm.id
			}" @click="wm_click(wm.id)">
				<div class="actions">
					<Button icon primary @click.stop="wmReplace_click(wm.id)">
						<i class="ico arr_swap"></i>
					</Button>
					<Button icon @click.stop="wmDelete_click(wm.id)">
						<i class="ico trash"></i>
					</Button>
				</div>
				<img
					class="thumbnail"
					:src="wm.thumbnail.endsWith('.swf') ?
						'/img/importer/flash.svg' :
						wm.thumbnail"/>
			</div>
		</div>
		<input type="file" ref="wm-input" accept=".png" @input="wmInput_input()"/>
		<input type="file" ref="wm-replace-input" accept=".png" @input="wmInput_input(true)"/>
	</div>
</template>
