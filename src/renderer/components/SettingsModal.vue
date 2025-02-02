<style lang="css" scoped>
.tab_selector {
	display: flex;
}
.tab_selector .tab_col {
	border-right: 1px solid #ccc;
	margin-right: 14px;
	padding-right: 14px;
	width: 160px;
}
.tab_selector .tab_col .btn {
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
import AppSetting from "./AppSetting.vue";
import Button from "./controls/Button.vue";
import Popup from "./Popup.vue";
import { ref } from "vue";

const tabs = [
	{
		id: "behavior",
		name: "Behavior"
	},
	{
		id: "appearance",
		name: "Appearance"
	}
];
const selectedTab = ref(tabs[0].id);

function switchTab(id:string) {
	selectedTab.value = id;
}
</script>

<template>
	<div class="settings_modal">
		<Popup>
			<template #small-heading>Wrapper: Offline</template>
			<template #large-heading>App settings</template>
	
			<div class="tab_selector">
				<div class="tab_col">
					<Button v-for="tab in tabs" :primary="selectedTab == tab.id" @click="switchTab(tab.id)">
						{{ tab.name }}
					</Button>
				</div>
				<div v-if="selectedTab == 'behavior'" class="tab">
					<AppSetting id="truncatedThemeList" binary>
						<template #title>Truncated themelist</template>
						<template #description>Shows a limited selection of themes.</template>
					</AppSetting>

					<AppSetting id="showWaveforms" binary>
						<template #title>Show waveforms</template>
						<template #description>By default, waveforms for audio are generated in the video editor.<br/>
							While useful, the editor freezes while it generates, which could be too annoying or slow for some.<br/>
							Turning this off will simply add a repeating pre-made pattern in place of true waveforms.</template>
					</AppSetting>

					<AppSetting id="saveLogFiles" binary>
						<template #title>Save log files</template>
						<template #description>Saves everything in the console to the _LOGS folder. This may take up a lot of space if left on.<br/>
							<i>Applies on next restart.</i></template>
					</AppSetting>
				</div>
				<div v-if="selectedTab == 'appearance'" class="tab">
					<AppSetting id="DARK_MODE" binary local>
						<template #title>Dark mode</template>
						<template #description><i>Does not apply in the Video Maker or Character Creator.</i></template>
					</AppSetting>

					<AppSetting id="isWide" :options="{
						false: '14:9',
						true: '16:9'
					}">
						<template #title>Aspect ratio</template>
						<template #description>The Video Maker has 2 choices for aspect ratios, 14:9 and 16:9.<br/>
						By default it's set to 16:9, however you can choose to use 14:9 instead.</template>
					</AppSetting>

					<AppSetting id="hideNavbar" binary>
						<template #title>Auto-hide navbar</template>
						<template #description><i>You must restart the program for this change to take effect.</i></template>
					</AppSetting>
				</div>
			</div>
			
			<template #foot>
				<Button primary @click="$emit('closeClick')">Close</Button>
			</template>
		</Popup>
	</div>
</template>