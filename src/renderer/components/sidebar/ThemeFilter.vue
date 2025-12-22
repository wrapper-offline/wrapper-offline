<style lang="css">
.sidebar_theme_selector .theme img {
	height: 22px;
	margin-left: -3px;
	margin-right: 6px;
	margin-top: 2px;
}
</style>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Theme, useThemeList } from "../../composables/useThemeList";

defineEmits<{
	themeClicked: [Theme]
}>();

const props = defineProps<{
	ccFilter?: boolean,
	headingFor: string,
}>();
const themeList = ref<Theme[]>([]);

onMounted(async () => {
	themeList.value = await useThemeList(true);
});
</script>

<template>
	<div class="sidebar_theme_selector">
		<h3>Filter by theme</h3>
		<li v-for="theme in themeList"
			class="link theme"
			:data-id="theme.id"
			@click="$emit('themeClicked', theme)">
			<a href="javascript:;">
				<img class="icon" :src="`/img/themes/icons/${theme.id}.webp`" alt=""/>
				{{ theme.name }}
			</a>
		</li>
	</div>
</template>