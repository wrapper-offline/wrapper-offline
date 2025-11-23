<style lang="css">
.popup_container.settings_popup .contents {
	overflow-y: scroll;
	width: 776px;
	height: 400px;
}

.tab_selector {
	display: flex;
}
.tab_selector .tab_col {
	margin-right: 16px;
	width: 160px;
}
.tab_selector .tab_col .btn {
	font-size: 15px;
	font-weight: normal;
	margin: 0 0 9px;
	display: block;
}
.tab_selector .tab {
	width: 550px;
}

html.dark .tab_selector .tab_col {
	border-color: #2c2b3b;
}

@media (max-width: 800px) {
	.tab_selector {
		flex-direction: column;
	}
	.tab_selector .tab_col .btn {
		display: inline-block;
	}
}
</style>

<script setup lang="ts">
import SettingToggle from "./SettingToggle.vue";
import Button from "../controls/Button.vue";
import Popup from "../Popup.vue";
import { onMounted, onUnmounted, ref } from "vue";
import WatermarkManager from "./WatermarkManager.vue";

const emit = defineEmits<{
	userClose: []
}>();

const tabs = [
	{
		id: "behavior",
		name: "Behavior"
	},
	{
		id: "appearance",
		name: "Appearance"
	},
	{
		id: "watermarks",
		name: "Watermarks"
	}
];
const selectedTab = ref(tabs[0].id);

/**
 * called on tab click
 * @param id tab id
 */
function switchTab(id:string) {
	selectedTab.value = id;
}

/**
 * called on keypress, checks for escape
 * emits close event
 * @param e keyboard event
 */
function escPress(e:KeyboardEvent) {
	if (e.key != "Escape") {
		return;
	}
	emit("userClose");
}

onMounted(() => {
	document.addEventListener("keydown", escPress);
});
onUnmounted(() => {
	document.removeEventListener("keydown", escPress);
});
</script>

<template>
	<div class="settings_modal">
		<Popup class="settings_popup">
			<template #small-heading>Wrapper: Offline</template>
			<template #large-heading>App settings</template>
	
			<div class="tab_selector">
				<div class="tab_col">
					<Button v-for="tab in tabs" :primary="selectedTab == tab.id" @click="switchTab(tab.id)">
						{{ tab.name }}
					</Button>
				</div>
				<div v-if="selectedTab == 'behavior'" class="tab">
					<SettingToggle id="onMovieDclick" :options="{
						play: 'Open video player',
						edit: 'Open video editor',
						none: 'Do nothing',
					}" local>
						<template #title>When double clicking a video...</template>
					</SettingToggle>

					<SettingToggle id="onMovieUpload" :options="{
						play: 'Open video player',
						edit: 'Open video editor',
						none: 'Do nothing',
					}" local>
						<template #title>After uploading a video...</template>
					</SettingToggle>

					<SettingToggle id="hideNavbar" binary>
						<template #title>Auto-hide navbar</template>
						<template #description><i>You must restart the program for this change to take effect.</i></template>
					</SettingToggle>

					<SettingToggle id="saveLogFiles" binary>
						<template #title>Save log files</template>
						<template #description>Saves everything in the console to the _LOGS folder. This may take up a lot of space if left on.<br/>
							<i>Applies on next restart.</i></template>
					</SettingToggle>
				</div>
				<div v-if="selectedTab == 'appearance'" class="tab">
					<SettingToggle id="darkMode" binary local>
						<template #title>Dark mode</template>
						<template #description><i>Does not apply in the video editor or the character creator.</i></template>
					</SettingToggle>

					<SettingToggle id="isWide" :options="{
						false: '14:9',
						true: '16:9'
					}">
						<template #title>Aspect ratio</template>
						<template #description>This controls the aspect ratio videos are displayed in.</template>
					</SettingToggle>

					<SettingToggle id="showWaveforms" binary>
						<template #title>Show waveforms</template>
						<template #description>By default, waveforms for audio are generated in the video editor.<br/>
							While useful, the editor freezes while it generates, which could be too annoying or slow for some.<br/>
							Turning this off will simply add a repeating pre-made pattern in place of true waveforms.</template>
					</SettingToggle>

					<SettingToggle id="truncatedThemeList" binary>
						<template #title>Truncated themelist</template>
						<template #description>Shows a limited selection of themes.</template>
					</SettingToggle>
				</div>
				<div v-if="selectedTab == 'watermarks'" class="tab">
					<WatermarkManager/>
				</div>
			</div>
			
			<template #foot>
				<Button primary @click="$emit('userClose')">Close</Button>
			</template>
		</Popup>
	</div>
</template>