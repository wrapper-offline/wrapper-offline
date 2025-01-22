<style lang="css">
.popup_container {
	background: #0e0e109d;
	animation: 0.15s popup_container_fade forwards ease-out;
	z-index: 9;
	position: absolute;
	top: 0;
	width: 100%;
	height: 100%;
}

.popup {
	background: #eeedf2;
	border-radius: 3px;
	box-shadow: 0 2px 5px #0004;
	animation: 0.15s popup_flyDown forwards var(--sidebar-open-anim);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	position: absolute;
	top: 50%;
	left: 50%;
	width: 60%;
	height: 80%;
}
.popup .popup_head {
	background: #dbd9e4;
    border-bottom: 1px solid #c1bfce;
	user-select: none;
	font-size: 20px;
	font-weight: 700;
	display: flex;
	margin: 0;
	padding: 6px 18px;
	height: 50px;
}
.popup .popup_head .head_left {
	flex: 1;
	background: #0000;
}
.popup .popup_head .head_center .small {
	color: #84899a;
	font-size: 10px;
	position: absolute;
	left: 0;
	transform: translateX(-50%);
	margin-left: 50%;
}
.popup .popup_head .head_center .small + .main {
	font-size: 17px;
	position: relative;
	top: 6px;
}
.popup .popup_head .head_right {
	flex: 1;
}
.popup .popup_head small {
	color: #bbb;
}

.popup .close_btn {
	background: #0000;
	border: none;
	color: #fff;
	cursor: pointer;
	font-size: 30px;
	position: absolute;
	top: 20px;
	right: 30px;
}
.popup .close_btn:focus {
	outline: none;
}

.popup .contents {
	overflow: auto;
	padding: 15px 30px;
}

.popup .popup_foot {
	background: #e2e1ea;
    border-top: 1px solid #c7c5d3;
	display: flex;
	justify-content: flex-end;
	padding: 2px 10px;
	height: 55px;
}


/**
popup animations
**/
@keyframes popup_container_fade {
	0% {
		opacity: 0.3;
	}
	100% {
		opacity: 1;
	}
}
@keyframes popup_flyDown {
	0% {
		transform: scale(0.8) translate(calc(-50% * calc(1 / 0.8)), calc(-50% - 200px));
	}
	100% {
		transform: translate(-50%, -50%);
	}
}
</style>

<script setup lang="ts"></script>

<template>
	<div>
		<Teleport to="body">
			<div class="popup_container">
				<div class="popup">
					<div class="popup_head">
						<div class="head_left"></div>
						<div class="head_center">
							<span class="small"><slot name=small-heading></slot></span>
							<span class="main"><slot name="large-heading"></slot></span>
						</div>
						<div class="head_right"></div>
					</div>
					<div class="contents"><slot></slot></div>
					<div class="popup_foot">
						<slot name="foot"></slot>
					</div>
				</div>
			</div>
		</Teleport>
	</div>
</template>
