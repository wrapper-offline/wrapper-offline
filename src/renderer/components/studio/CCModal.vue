<style lang="css">
.cc_popup_container {
	background: #0000;
}
.cc_popup_container .popup {
	max-height: 100%;
}
.cc_popup_container .popup .contents {
	padding: 0 25px;
}
</style>

<script setup lang="ts">
import Button from "../controls/Button.vue";
import CCObject from "../CCObject.vue";
import Popup from "../Popup.vue";
import { useTemplateRef } from "vue";

const emit = defineEmits<{
	charSaved: [string],
	exit: [],
}>();
type CCObjectType = InstanceType<typeof CCObject>;
const ccObject = useTemplateRef<CCObjectType>("cc-object");

/**
 * resets the cc object and emits the `exit` event
 */
function exit() {
	ccObject.value.reset();
	emit("exit");
}

/**
 * called when a character has been saved to the server
 * emits `charSaved` event and exits
 * @param id character id
 */
function charSaved(id:string) {
	emit("charSaved", id);
	exit();
}

/**
 * initializes the cc object on the browser
 * @param themeId cc theme id
 */
function displayBrowser(themeId:string) {
	ccObject.value.displayBrowser(themeId);
}

/**
 * initializes the cc object on a character
 * @param themeId cc theme id
 * @param assetId character id
 */
function copyCharacter(themeId:string, assetId:string) {
	ccObject.value.copyCharacter(themeId, assetId);
}

const { show = true } = defineProps<{
	show?: boolean
}>();

defineExpose({ displayBrowser, copyCharacter });
</script>

<template>
	<div class="cc_modal">
		<Popup class="cc_popup_container" :show="show">
			<template #small-heading>Editing a video</template>
			<template #large-heading>Create a character</template>
			<template #head-right>
				<Button primary @click="exit">Exit</Button>
			</template>
	
			<CCObject ref="cc-object" @char-saved="charSaved"/>
		</Popup>
	</div>
</template>
