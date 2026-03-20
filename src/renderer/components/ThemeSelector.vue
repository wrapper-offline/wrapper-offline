<style src="./theme_sel_popup.css"></style>

<script setup lang="ts">
import Button from "./controls/Button.vue";
import { onMounted, ref } from "vue";
import Popup from "./Popup.vue";
import { Theme, useSortedList } from "../composables/useThemeList";

defineEmits<{
	themeClicked: [Theme]
}>();

const props = defineProps<{
	ccFilter?: boolean,
	headingFor: string,
}>();
const themeList = ref<Theme[][]>([]);

onMounted(async () => {
	themeList.value = await useSortedList(props.ccFilter);
});
</script>

<template>
	<div class="theme_selector">
		<Popup class="theme_sel_popup hidden">
			<template #small-heading>{{ props.headingFor }}</template>
			<template #large-heading>Select a theme</template>

			<div class="row" v-for="column in themeList">
				<div v-for="theme in column"
					class="theme"
					:data-id="theme.id"
					@click="$emit('themeClicked', theme)">
					<img class="banner" :src="`/img/themes/banners/${theme.id}.webp`" alt=""/>
					<img class="icon" :src="`/img/themes/icons/${theme.id}.webp`" alt=""/>
					{{ theme.name }}
				</div>
			</div>
			
			<template #foot>
				<Button><RouterLink to="/">Cancel</RouterLink></Button>
			</template>
		</Popup>
	</div>
</template>