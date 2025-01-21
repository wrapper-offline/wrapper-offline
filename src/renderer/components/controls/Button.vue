<style lang="css">
.btn {
	background: #43bca5;
	border: none;
	font-size: 14px;
	font-weight: bold;
	text-decoration: none;
	color: #fff;
	border-radius: 4px;
	display: inline-block;
	padding: 5.5px 10px;
	margin: 9px 5px;
}
.btn a {
	color: #fff;
	text-decoration: none;
}
.btn:hover {
	background: #029a85;
	cursor: pointer;
}
.dark .btn {
	background: #333;
}
.dark .btn:hover {
	background: #444;
}
/* primary color buttons */
.btn.btn_primary {
	background: #e97d3b;
	width: 160px;
}
.btn.btn_primary:hover {
	background: #dd6522;
}
</style>

<template>
	<div class="btn">
		<slot></slot>
	</div>
</template>
