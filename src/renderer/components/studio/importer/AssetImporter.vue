<style>
#importer {
	background: #eeedf2;
	/* border-right: 1px solid #c8c6dd; */
	box-shadow: 0 0 2px #0001;
	animation: importer-slide 0.05s var(--slide-anim);
	flex-shrink: 0;
	overflow: auto;
	z-index: 1;
	width: 320px;
}

/**
importer header
**/
#importer #import_head {
	background: #1e1b2b;
	/* border-bottom: 1px solid #000; */
	display: flex;
	justify-content: center;
	padding: 8px 6px;
	height: 50px;
}
/* file upload button */
#importer #import_head .btn {
	text-align: center;
	font-size: 16px;
	margin: 0;
	margin-right: 4px;
	padding: 2px 10px;
	width: 150px;
}
#importer #import_head .close_button {
	color: #fff;
	cursor: pointer;
	margin: 4px;
}
#importer #import_head .close_button:hover {
	opacity: 0.8;
}

/**
initial message
**/
.file_type_help {
	color: #7c889c;
	font-size: 14px;
	padding: 20px;
}
/* instructions */
.file_type_help .instructions {
	opacity: 0.7;
	text-align: center;
}
.file_type_help .instructions .import_icon {
	height: 150px;
}
.file_type_help .instructions h3 {
	border-bottom: 2px dashed #bcc2cd;
	margin-top: -10px;
	margin-bottom: 18px;
	padding-bottom: 22px;
}
/* supported file types */
.file_type_help h4 {
	margin: 0;
}
.file_type_help ul {
	margin: 0;
	margin-left: 10px;
	padding: 0 20px;
}
.file_type_help ul summary {
	cursor: pointer;
	width: fit-content;
}
.file_type_help ul summary:hover {
	opacity: 0.8;
}
.file_type_help ul summary:focus {
	outline: none;
}

@keyframes importer-slide {
	0% {
		margin-left: -320px;
		transform: translateX(-320px);
		position: relative;
	}
	99.99% {
		margin-left: -320px;
		transform: translateX(320px);
	}
	to {
		margin-left: 0;
		transform: none;
		position: inherit;
	}
}
</style>

<script setup lang="ts">
import type { AssetStatus } from "./ImporterFile.vue";
import Button from "../../controls/Button.vue";
import { filesize } from "filesize";
import ImporterFile from "./ImporterFile.vue";
import { ref, toValue, useTemplateRef } from "vue";

/* list of all file extensions supported by the file upload api */
const supportedTypes = [
	"flac",
	"ogg",
	"m4a",
	"mp3",
	"wav",
	"wma",

	"gif",
	"jpeg",
	"jpg",
	"png",
	"swf",
	"tiff",
	"tif",
	"webp",

	"avi",
	"mkv",
	"mov",
	"mp4",
	"webm",
	"wmv",
];
/* object passed to an ImporterFile element */
export type PendingFile = {
	name: string,
	ext: (typeof supportedTypes)[number],
	file: File,
	size: string,
};

const emit = defineEmits<{
	addToScene: [string, string],
	exitClicked: [],
	statusUpdated: [AssetStatus],
	uploadSuccess: [string, string, Record<string, string>],
}>();
const fileInput = useTemplateRef("importer-files");
/** maximum file size in bytes */
const maxsize = 0;
const pendingFiles = ref<PendingFile[]>([]);

/**
 * called when a file has been selected
 * @param e file input event
 */
function filesAdded(e:InputEvent) {
	const fileUpload = e.currentTarget as HTMLInputElement;
	for (let i = 0; i < fileUpload.files.length; i++) {
		addFile(fileUpload.files[i]);
	}
	fileUpload.value = "";
}

/**
 * called when a file has been dropped into the importer
 */
function fileDropped(e:DragEvent) {
	const files = e.dataTransfer.files;
	for (let i = 0; i < files.length; i++) {
		addFile(files[i]);
	}
}

/**
 * called when a file has been pasted into the importer
 * only has limited support due to an issue with old chromium
 * @param e event
 */
function filePasted(e:ClipboardEvent) {
	const files = e.clipboardData.files;
	for (let i = 0; i < files.length; i++) {
		addFile(files[i]);
	}
}

/**
 * displays an error message
 * @param msg error message
 */
function displayError(msg:string) {

}

/**
 * adds a file to the queue
 * @param file file upload
 */
function addFile(file:File) {
	if (maxsize > 0 && file.size > maxsize) {
		displayError("The file you selected is too large.");
		return;
	}

	const ext = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
	if (!supportedTypes.includes(ext)) {
		displayError("The file type you selected is not supported.");
		return;
	}

	pendingFiles.value.unshift({
		name: file.name,
		ext,
		file,
		size: filesize(file.size, { standard:"jedec" }),
	});
}

/**
 * called when a cancel button has been clicked in a pending asset
 * removes a file from the queue based on its PendingFile object
 * @param file PendingFile object belonging to the ImporterFile elem
 */
function cancelClicked(file:PendingFile) {
	const index = toValue(pendingFiles).indexOf(file);
	pendingFiles.value.splice(index, 1);
}

/* pass events to studio */

function onStatusUpdated(status:AssetStatus) {
	emit("statusUpdated", status);
}
function onAddToScene(assetType:string, assetId:string) {
	emit("addToScene", assetType, assetId);
}
function onUploadSuccess(
	assetType: string,
	assetId: string,
	lvmObject: Record<string, string>
) {
	emit("uploadSuccess", assetType, assetId, lvmObject);
}
</script>

<template>
	<nav
		id="importer"
		@dragover.prevent.stop=""
		@drop.prevent.stop="fileDropped"
		@paste="filePasted">
		<div id="import_head">
			<Button primary @click="fileInput.click()">Select files</Button>
			<h3 class="close_button" @click="$emit('exitClicked')">✖</h3>
			<form>
				<input
					type="file"
					name="file"
					title="Upload Files"
					:accept="supportedTypes.map(v => '.' + v).join(',')"
					multiple
					@input="filesAdded"
					ref="importer-files"
					style="display:none"/>
			</form>
		</div>
		<div class="importer_queue">
			<!-- v-bind, force vue to not reuse elements on array changes -->
			<ImporterFile
				v-for="file in pendingFiles"
				v-bind:key="file.name + +(new Date()).toString()"
				:file="file" 
				@add-to-scene="onAddToScene"
				@cancel-clicked="cancelClicked(file)"
				@status-updated="onStatusUpdated"
				@upload-success="onUploadSuccess"/>
		</div>
		<div class="file_type_help" v-show="pendingFiles.length < 1">
			<div class="instructions">
				<img class="import_icon" src="/img/importer/import.svg"/>
				<h3>Select or drop a file to upload</h3>
			</div>
			<h4>Supported file types:</h4>
			<ul>
				<li>
					<details>
						<summary>Sounds:</summary>
						<ul>
							<li>FLAC</li>
							<li>OGG</li>
							<li>M4A</li>
							<li>MP3</li>
							<li>WAV</li>
							<li>WMA</li>
						</ul>
					</details>
				</li>
				<li>
					<details>
						<summary>Backgrounds and props:</summary>
						<ul>
							<li>GIF (will not animate)</li>
							<li>JPEG/JPG</li>
							<li>PNG</li>
							<li>SWF</li>
							<li>TIF/TIFF</li>
							<li>WEBP</li>
						</ul>
					</details>
				</li>
				<li>
					<details>
						<summary>Videos:</summary>
						<ul>
							<li>AVI</li>
							<li>MKV</li>
							<li>MOV</li>
							<li>MP4</li>
							<li>WEBM</li>
							<li>WMV</li>
						</ul>
					</details>
				</li>
			</ul>
		</div>
	</nav>
</template>
