<script setup lang="ts">
import BaseModal from "./BaseModal.vue";
import Button from "./controls/Button.vue";
import CheckboxInput from "./controls/CheckboxInput.vue";
import { computed, ref } from "vue";
import SelectInput from "./controls/SelectInput.vue";
import SettingsModalWatermarks from "./SettingsModalWatermarks.vue";
import useServerSetting from "../composables/useServerSettings.js";
import { useStorage } from "@vueuse/core";

enum Tab {
	Behavior,
	Appearance,
	TTS,
	Watermarks
}

const emit = defineEmits<{
	userClose: []
}>();

const currentTab = ref<Tab>(Tab.Behavior);
const assetThumbColor = useStorage("assetThumbColor", "dynamic");
const enableMenuBar = useServerSetting("enableMenuBar");
const fullComponentRotation = useStorage("fullComponentRotation", false);
const onMovieDblclick = useStorage("onMovieDblclick", "play");
const onMovieUpload = useStorage("onMovieUpload", "edit");
const pollyService = useServerSetting("pollyService");
const previewAssetOnHover = useStorage("previewAssetOnHover", true);
const saveLogFiles = useServerSetting("saveLogFiles");
const showWaveforms = useStorage("showWaveforms", true);
const theme = useStorage("theme", "auto");
const truncatedThemeList = useServerSetting("truncatedThemeList");
const widescreen = useStorage("widescreen", true);

/**
 * switches the currently displayed tab
 * @param switchTo tab to be displayed
 */
function switchTab(switchTo:Tab) {
	currentTab.value = switchTo;
}

const onBehaviorTab = computed(() => currentTab.value == Tab.Behavior);
const onAppearanceTab = computed(() => currentTab.value == Tab.Appearance);
const onTTSTab = computed(() => currentTab.value == Tab.TTS);
const onWatermarksTab = computed(() => currentTab.value == Tab.Watermarks);

</script>

<template>
	<BaseModal class="settings_container" @click-outside="emit('userClose')">
		<template #heading>Settings</template>

		<div class="tab_col">
			<div role="button" class="tab_btn" :class="{ sel:onBehaviorTab }" @click="switchTab(Tab.Behavior)">
				Behavior
			</div>
			<div role="button" class="tab_btn" :class="{ sel:onAppearanceTab }" @click="switchTab(Tab.Appearance)">
				Appearance
			</div>
			<div role="button" class="tab_btn" :class="{ sel:onTTSTab }" @click="switchTab(Tab.TTS)">
				Text-to-speech
			</div>
			<div role="button" class="tab_btn" :class="{ sel:onWatermarksTab }" @click="switchTab(Tab.Watermarks)">
				Watermarks
			</div>
		</div>

		<div v-if="onBehaviorTab" class="tab">
			<h2>Videos</h2>

			<div class="setting_row">
				<div class="title">
					<h3>When double clicking a video</h3>
					<SelectInput
						align="right"
						:options="{
							'edit': 'Open video editor',
							'play': 'Open video player',
							'none': 'Do nothing'
						}"
						v-model="onMovieDblclick"
					/>
				</div>
			</div>

			<div class="setting_row">
				<div class="title">
					<h3>After uploading a video</h3>
					<SelectInput
						align="right"
						:options="{
							'edit': 'Open video editor',
							'play': 'Open video player',
							'none': 'Do nothing'
						}"
						v-model="onMovieUpload"
					/>
				</div>
			</div>

			<h2>Character editor</h2>

			<div class="setting_row binary" @click="fullComponentRotation = !fullComponentRotation">
				<div class="title">
					<h3>Enable continuous rotation</h3>
					<CheckboxInput v-model="fullComponentRotation"/>
				</div>
				<p class="info">This controls whether rotation of components locks out at 180 degrees.</p>
			</div>

			<div class="setting_row binary" @click="previewAssetOnHover = !previewAssetOnHover">
				<div class="title">
					<h3>Preview assets on hover</h3>
					<CheckboxInput v-model="previewAssetOnHover"/>
				</div>
				<p class="info">This controls whether assets show up on the preview while a thumbnail is hovered.</p>
			</div>

			<h2>Program</h2>

			<div class="setting_row binary" @click="enableMenuBar = !enableMenuBar">
				<div class="title">
					<h3>Enable menu bar</h3>
					<CheckboxInput v-model="enableMenuBar"/>
				</div>
				<p class="info">While enabled, the menu bar can be toggled on or off using the Alt key.</p>
			</div>

			<div class="setting_row binary" @click="saveLogFiles = !saveLogFiles">
				<div class="title">
					<h3>Save log files</h3>
					<CheckboxInput v-model="saveLogFiles"/>
				</div>
				<p class="info">Saves everything in the console to the _LOGS folder. This may take up a lot of space if left on.<br/>
					<i>Applies on next restart.</i></p>
			</div>
		</div>
		<div v-if="onAppearanceTab" class="tab">
			<h2>Program</h2>

			<div class="setting_row">
				<div class="title">
					<h3>Theme</h3>
					<SelectInput
						align="right"
						:options="{
							auto: 'Follow system',
							light: 'Light',
							dark: 'Dark'
						}"
						v-model="theme"
					/>
				</div>
				<p class="info"><i>This does not apply in the video editor.</i></p>
			</div>

			<div class="setting_row binary" @click="truncatedThemeList = !truncatedThemeList">
				<div class="title">
					<h3>Truncated themelist</h3>
					<CheckboxInput v-model="truncatedThemeList"/>
				</div>
				<p class="info">Shows a limited selection of themes.</p>
			</div>

			<h2>Character editor</h2>

			<div class="setting_row">
				<div class="title">
					<h3>Thumbnail colorization</h3>
					<SelectInput
						align="right"
						:options="{
							dynamic: 'Dynamic',
							fixed: 'Fixed',
							classic: 'Classic'
						}"
						v-model="assetThumbColor"
					/>
				</div>
				<p class="info">This controls how asset thumbnails are colored.</p>
			</div>

			<h2>Video editor</h2>

			<div class="setting_row">
				<div class="title">
					<h3>Aspect ratio</h3>
					<SelectInput
						align="right"
						:options="{
							true: '16:9',
							false: '14:9'
						}"
						v-model="widescreen"
					/>
				</div>
			</div>

			<div class="setting_row binary" @click="showWaveforms = !showWaveforms">
				<div class="title">
					<h3>Show waveforms</h3>
					<CheckboxInput v-model="showWaveforms"/>
				</div>
				<p class="info">Turning this off will show audio info by default,
					which could potentially boost performance.</p>
			</div>
		</div>
		<div v-if="onTTSTab" class="tab">
			<div class="setting_row">
				<div class="title">
					<h3>Preferred service for Polly voices</h3>
					<SelectInput
						align="right"
						:options="{
							both: 'List both',
							rl: 'ReadLoud only',
							sl: 'Streamlabs only'
						}"
						v-model="pollyService"
					/>
				</div>
			</div>
		</div>
		<div v-if="onWatermarksTab" class="tab">
			<SettingsModalWatermarks/>
		</div>

		<template #foot>
			<Button primary @click="$emit('userClose')">Close</Button>
		</template>
	</BaseModal>
</template>

<style>
.settings_container .contents {
	display: flex;
	overflow: hidden;
	padding: 0;
	width: 776px;
	height: 400px;
}

.settings_container .tab_col {
	border-right: 1px solid hsl(254 16% 86% / 1);
	flex-shrink: 0;
	padding: 15px;
	width: 185px;
}
.settings_container .tab_col .tab_btn {
	background: #0000;
	border-radius: 4px;
	transition: background 0.2s var(--button-anim);
	user-select: none;
	display: block;
	margin: 0 0 1px;
	padding: 4px 10px;
	font-size: 15px;
	font-weight: normal;
}
.settings_container .tab_col .tab_btn:hover {
	background: hsl(252 16% 89% / 1);
	transition: none;
	cursor: pointer;
}
.settings_container .tab_col .tab_btn.sel {
	background: hsl(211, 92%, 63%);
	color: #fff;
	cursor: default;
	font-weight: bold;
}

.settings_container .tab {
	flex-grow: 1;
	overflow-y: scroll;
	padding: 15px 20px;
}
.settings_container .tab h2 {
	opacity: 0.75;
	user-select: none;
	font-size: 20px;
	font-weight: normal;
	line-height: 2.2;
	margin: 35px 0 10px;
}
.settings_container .tab h2:first-of-type {
	margin-top: 0;
}
.settings_container .tab .setting_row {
	border-bottom: 1px solid hsl(254 16% 86% / 1);
	user-select: none;
	justify-content: space-between;
	margin: auto;
	padding: 0 0 12px;
	margin-bottom: 11px;
}
.settings_container .tab .setting_row .title {
	display: flex;
	align-items: center;
	justify-content: space-between;
	min-height: 32px;
}
.settings_container .tab .setting_row .title .dropdown {
	min-width: 90px;
}
.settings_container .tab .setting_row h3 {
	margin: 0;
	font-size: 15px;
}
.settings_container .tab .setting_row p {
	color: hsl(0deg 0% 60%);
	margin: 0;
	font-size: 13px;
	line-height: 15px;
}
.settings_container .tab .setting_row.binary {
	cursor: pointer;
}

html.dark .settings_container .tab_col {
	border-color: hsl(250deg 11% 21%);
}
html.dark .settings_container .tab_col .tab_btn:hover {
	background: hsl(250deg 11% 21%);
}
html.dark .settings_container .tab_col .tab_btn.sel {
	background: hsl(213deg 92% 56%);
}
html.dark .settings_container .tab .setting_row {
	border-color: hsl(250deg 11% 21%);
}

@media (min-height: 800px) {
	.settings_container .contents {
		height: 600px;
	}
}

</style>
