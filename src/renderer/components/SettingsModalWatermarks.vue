<script setup lang="ts">
import { apiServer } from "../utils/AppInit";
import Button from "./controls/Button.vue";
import { onMounted, ref, toValue, useTemplateRef } from "vue";

interface Watermark {
	id: string
	thumbnail: string
}

const container = useTemplateRef("wm-container");
const fileInput = useTemplateRef("image-input");
const defaultId = ref("");
const pendingReplaceId = ref<string | null>(null);
const watermarks = ref<Watermark[]>([]);

/**
 * requests a list of watermarks from the api server
 */
async function getWatermarks() {
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
 * pulls the default watermark id from the api server
 */
async function getDefaultWm() {
	const xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function () {
		if (this.readyState != 4 || this.status != 200) {
			return;
		}
		defaultId.value = this.responseText;
	};
	const url = apiServer + "/api/watermark/get_default";
	xhttp.open("GET", url, true);
	xhttp.send();
}

/**
 * called when a file has been selected
 * @param e file input event
 */
function filesAdded(e:InputEvent) {
	const fileUpload = e.currentTarget as HTMLInputElement;
	if (!fileUpload.files) {
		return;
	}
	for (let i = 0; i < fileUpload.files.length; i++) {
		uploadFile(fileUpload.files[i]);
	}
	fileUpload.value = "";
}

/**
 * called when a file has been dropped into the importer
 */
function fileDropped(e:DragEvent) {
	if (!e.dataTransfer) {
		return;
	}
	const files = e.dataTransfer.files;
	for (let i = 0; i < files.length; i++) {
		uploadFile(files[i]);
	}
}

/**
 * called when a file has been pasted into the importer
 * only has limited support due to an issue with old chromium
 * @param e event
 */
function filePasted(e:ClipboardEvent) {
	if (!e.clipboardData) {
		return;
	}
	const files = e.clipboardData.files;
	for (let i = 0; i < files.length; i++) {
		uploadFile(files[i]);
	}
}

/**
 * called when an image is selected,
 * uploads image to api server
 */
async function uploadFile(file:File) {
	const id = toValue(pendingReplaceId);
	pendingReplaceId.value = null;
	const isReplacing = id !== null;

	const body = new FormData();
	body.append("image", file);
	if (isReplacing) {
		body.append("id", id as string);
	}
	const res = await fetch(apiServer + "/api/watermark/save", {
		method: "POST",
		body
	});

	if (!res.ok) {
		return;
	}
	const json = await res.json();
	if (isReplacing) {
		const newId = json.id;
		const thumbPath = json.thumbnail;
		await fetch(thumbPath);
		if (id != newId) {
			const i = watermarks.value.findIndex((w) => w.id == id);
			watermarks.value[i].id = newId;
			watermarks.value[i].thumbnail = thumbPath;
			if (defaultId.value == id) {
				defaultId.value = newId;
			}
			return;
		}
		if (!container.value) {
			return;
		}
		if (thumbPath.endsWith(".swf")) {
			const param = container.value.querySelector<HTMLParamElement>("param[name='movie']");
			if (!param) {
				return;
			}
			param.value = thumbPath;
		} else {
			const image = container.value.querySelector<HTMLImageElement>(`[src*="${id}"]`);
			if (!image) {
				return;
			}
			await fetch(thumbPath);
			image.src = thumbPath;
		}
	} else {
		watermarks.value.unshift(json);
	}
}

/**
 * called when the upload button is clicked, starts upload process
 */
function upload_click() {
	if (!fileInput.value) {
		return;
	}
	fileInput.value.click();
}

/**
 * called when a watermark's replace button is clicked, starts upload process
 * @param id wm id
 */
function wmReplace_click(id:string) {
	if (!fileInput.value) {
		return;
	}
	pendingReplaceId.value = id;
	fileInput.value.click();
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

/**
 * called when a watermark is clicked, sets the default
 * @param id wm id
 */
async function wm_click(id:string) {
	const body = new FormData();
	if (id !== defaultId.value) {
		body.append("id", id);
	}

	const res = await fetch(apiServer + "/api/watermark/set_default", {
		method: "POST",
		body
	});
	if (res.ok) {
		defaultId.value = id;
	}
}

onMounted(() => {
	getWatermarks();
	getDefaultWm();
});

</script>

<template>
	<div
		class="wm_manager"
		@dragover.prevent.stop=""
		@drop.prevent.stop="fileDropped"
		@paste="filePasted">
		<div class="setting_row">
			<div>
				<h3>Manage watermarks</h3>
				<p>Upload, delete or set a default watermark</p>
			</div>
		</div>
		<div class="watermark_container" ref="wm-container">
			<div class="upload_button" @click="upload_click">
				<img src="/img/importer/import.svg" alt="Upload"/>
				<small>Upload</small>
			</div>

			<div :class="{
				watermark: true,
				checked: defaultId == '0vTLbQy9hG7k'
			}" @click="wm_click('0vTLbQy9hG7k')">
				<img class="thumbnail" src="/img/logo.svg"/>
			</div>

			<div
				v-for="wm in watermarks"
				:key="wm.id"
				:class="{
					watermark: true,
					checked: defaultId == wm.id
				}"
				@click="wm_click(wm.id)"
			>
				<div class="actions">
					<Button icon primary @click.stop="wmReplace_click(wm.id)" title="Replace">
						<i class="ico arr_swap"></i>
					</Button>
					<Button icon @click.stop="wmDelete_click(wm.id)" title="Delete">
						<i class="ico trash"></i>
					</Button>
				</div>
				<object v-if="wm.thumbnail.endsWith('.swf')"
					class="thumbnail"
					type="application/x-shockwave-flash">
					<param name="movie" :value="wm.thumbnail"/>
					<param name="wmode" value="transparent"/>
				</object>
				<img v-else class="thumbnail" :src="wm.thumbnail"/>
			</div>
		</div>
		<input type="file" ref="image-input" accept=".gif,.jpeg,.jpg,.png,.swf,.tiff,.tif,.webp" @input="filesAdded($event as InputEvent)"/>
	</div>
</template>

<style>
.wm_manager {
	min-height: 100%;
}

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
	transition: 0.2s var(--button-anim);
	user-select: none;
	-webkit-user-drag: none;
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
	padding: 20px 0 0 5px;
}

.wm_manager .watermark .thumbnail  {
	border-radius: 3px;
	pointer-events: none;
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
	transition: none;
	cursor: pointer;
}
.wm_manager .watermark:hover .actions {
	display: block;
}

.wm_manager .upload_button.checked,
.wm_manager .watermark.checked {
	background-color: hsl(338deg 55% 85%);
	border-color: hsl(344deg 97% 65%);
	box-shadow: inset 0 0 0 1px hsl(344deg 97% 65%);
}
.wm_manager .watermark.checked::after {
	content: "\E207";
    font-family: "GlyphiconsRegular";
    background: hsl(344deg 97% 65%);
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
