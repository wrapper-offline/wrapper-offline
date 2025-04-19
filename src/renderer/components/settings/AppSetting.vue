<style lang="css" scoped>
.app_setting {
	border-bottom: 1px solid #bbb;
	user-select: none;
	display: flex;
	justify-content: space-between;
	margin: auto;
	padding: 0 0 12px;
	margin-bottom: 11px;
}
.app_setting h3 {
	margin: 0;
	font-size: 15px;
}
.app_setting p {
	color: #738096;
	margin: 0;
	font-size: 13px;
}

.app_setting.binary {
	cursor: pointer;
}

.app_setting:last-of-type {
	border: none;
}

html.dark .app_setting {
	border-color: #313041;
}
html.dark .app_setting p {
	color: #878b92;
}
</style>

<script setup lang="ts">
import { ref, toValue } from "vue";
import SettingsController from "../../controllers/SettingsController";

const props = defineProps<{
	id: string,
	binary?: boolean,
	local?: boolean,
	options?: Record<string, string>,
}>();
const value = ref<boolean | string>();
if (props.local) {
	let newValue:boolean|string = localStorage.getItem(props.id);
	if (newValue == "true") {
		newValue = true;
	} else if (newValue == "false") {
		newValue = false;
	}
	value.value = newValue;
} else {
	value.value = SettingsController.get(props.id);
}

/**
 * called when the AppSetting is clicked
 * flips the setting if it uses a binary value
 */
function settingClicked() {
	if (!props.binary) {
		return;
	}
	value.value = !toValue(value);
	set(toValue(value).toString());
}
function optionSelected(e:MouseEvent) {
	const target = e.currentTarget as HTMLSelectElement;
	value.value = target.value;
	set(toValue(value).toString());
}

/**
 * new setting
 * @param newValue value to set to
 */
function set(newValue:string) {
	if (props.local) {
		if (props.id == "DARK_MODE") {
			if (newValue == "true") {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
		}
		localStorage.setItem(props.id, newValue);
	} else {
		SettingsController.set(props.id, newValue);
	}
}
</script>

<template>
	<div class="app_setting" :class="{ binary: props.binary }" @click="settingClicked">
		<div class="setting_info">
			<h3 part="h3"><slot name="title"></slot></h3>
			<p part="p"><slot name="description"></slot></p>
		</div>
		<input v-if="props.binary" class="setting" type="checkbox" :checked="Boolean(value) == true"></input>
		<select v-if="!props.binary" class="setting" @change="optionSelected">
			<option v-for="(option, id) in props.options" :value="id" :selected="value.toString() == id">
				{{ option }}
			</option>`
		</select>
	</div>
</template>