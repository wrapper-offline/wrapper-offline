<style lang="css">
.btn {
	background: #838190;
	color: #fff;
	border-radius: 4px;
	border: none;
	user-select: none;
	font-size: 14px;
	font-weight: bold;
	text-decoration: none;
	transition: opacity 0.2s var(--button-anim);
	display: inline-block;
	padding: 4px 10px;
	margin: 9px 5px;
}
.btn a {
	color: #fff;
	text-decoration: none;
}
.btn:hover {
	opacity: 0.8;
	transition: none;
	cursor: pointer;
}
.btn.primary {
	background: #fc4f7d;
}
.dark .btn {
	background: #42404f;
}
.dark .btn.primary {
	background: hsl(344deg 62% 50%);
}
</style>

<script setup lang="ts">
const props = defineProps<{
	primary?: boolean
}>();
</script>

<template>
	<div class="btn" :class="{ primary: props.primary }">
		<slot></slot>
	</div>
</template>
