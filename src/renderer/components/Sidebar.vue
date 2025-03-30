<style lang="css" scoped>
.app_sidebar {
	background: #313145;
	box-shadow: inset -2px 0 3px #0001;
	z-index: 8;
	user-select: none;
	display: flex;
	flex-direction: column;
	flex-shrink: 0;
}

/**
logo container
**/
.app_sidebar #logo_container {
	background: #1c1c27;
	border-bottom: 1px solid #3d3d57;
	padding: 4px 8px;
	transform: translateX(0);
	height: 50px;
}
.app_sidebar #logo_container .toggle_btn {
	border-radius: 3px;
	transition: 0.2s var(--button-anim);
	cursor: pointer;
	width: 100%;
	height: 100%;
}
.app_sidebar #logo_container .toggle_btn:hover {
	transition: none;
	background: #2f2a3c;
}
.app_sidebar #logo_container #logo_icon {
	transition: 0.205s var(--slide-anim);
	pointer-events: none;
	position: absolute;
	left: calc(50% - calc(175px / 2));
	height: 41px;
}
.app_sidebar #logo_container #logo_wordmark {
	transition: 0.205s var(--slide-anim);
	pointer-events: none;
	position: absolute;
	left: calc(50% - calc(175px / 2));
	height: 41px;
}

/**
sidebar sections *OR* grouped link containers
**/
.app_sidebar ul {
	list-style: none;
	margin: 0;
	padding: 2px 8px;
}
/* sections */
.app_sidebar>ul:first-of-type {
	border-bottom: 1px dashed hsl(240 17% 38% / 1);
}
.app_sidebar>ul:last-of-type {
	border-top: 1px dashed hsl(240 17% 38% / 1);
	margin-top: auto;
	padding-bottom: 8px;
}
/* grouped links (faq & discord) */
.app_sidebar .group>ul {
	display: flex;
	justify-content: space-between;
	padding: 0;
}
.app_sidebar .group>ul>.link {
	margin-bottom: 0;
	width: calc(50% - 2.5px);
}
.app_sidebar .group>ul>.divider {
	background: hsl(240 14% 32% / 1);
	margin: 7px 0 5px;
	width: 1px;
}

/* icons */
.app_sidebar i {
	margin-top: 0;
	margin-right: 7px;
}

/**
links
**/
.app_sidebar .link {
	border-radius: 4px;
	transition: 0.2s var(--button-anim);
	overflow: hidden;
	display: flex;
	margin: 3px 0;
	height: 35px;
}
.app_sidebar .link>a {
	color: #fff;
	text-decoration: none;
	display: flex;
	padding: 5px 8px;
	height: 100%;
	width: calc(100% - 14px);
}
.app_sidebar .link>button {
	background: #0000;
	border: none;
	color: #fff;
	cursor: pointer;
	display: flex;
	padding: 8px 8px;
	width: calc(100% - 14px);
}
/* remove ugly button styling */
.app_sidebar .link>button:focus {
	outline: none;
}
.app_sidebar .link.pin_btn {
	background: #23222d;
	border-style: dashed;
	box-shadow: inset 0 0 0 1px #1b1a21;
}
.app_sidebar .link::after {
	content: "";
	background: linear-gradient(90deg, #0000 0, #313145 10px);
	width: 14px;
	height: 100%;
}
/* states */
.app_sidebar .link:hover {
	background: hsl(240 17% 28% / 1);
	transition: none;
}
.app_sidebar .link:hover::after {
	background: linear-gradient(90deg, #0000 0, hsl(240 17% 28% / 1) 10px);
}
.app_sidebar .link.sel {
	background: #ffdbe8;
	border-color: #e686a9;
	color: #d60955;
}
.app_sidebar .link.sel i {
	animation: 0.2s iconBounce cubic-bezier(0, 0.8, 0.45, 1.35);
}


/**
create button
**/
.app_sidebar .link.create {
	background: #fc4f7d;
	border-bottom-color: #ac0633;
}
.app_sidebar .link.create>button {
	color: #fff;
}
.app_sidebar .link.create::after {
	content: "";
	background: linear-gradient(90deg, #0000 0, #fc4f7d 10px);
	width: 14px;
	height: 100%;
}


/* spacer */
.app_sidebar .spacer {
	margin-bottom: 7px;
}


/**
dragger
**/
.app_sidebar .dragger {
	cursor: col-resize;
	position: absolute;
	top: 50px;
	float: right;
	width: 6px;
	height: calc(100% - 50px);
}
.app_sidebar .dragger:hover {
	background: #489cf7a3;
	transition: 0.08s ease-in;
	transition-delay: 0.18s;
}


/**
pinned links
**/

/* pinned links heading */
.app_sidebar h3 {
	color: #918fa0;
	font-size: 13px;
	font-weight: bold;
	text-transform: uppercase;
	margin: 5px 0;
}
/* page folders unpin button */
.app_sidebar .user_custom .link>button.unpin {
	border-radius: 3px 0 0 3px;
	font-size: 12px;
	text-align: left;
	padding: 5px 5px 5px 8px;
	height: 100%;
}
.app_sidebar .user_custom .link>button.unpin:hover {
	background: #ffd3e8;
}
.app_sidebar .user_custom .link>a {
	padding: 5px 6px 5px 3px;
}
/* pin button */
.app_sidebar .link[data-toggle]>button {
	display: flex;
	padding: 5px 12px;
	flex-grow: 1;
	line-height: 24px;
}
.app_sidebar .link[data-toggle]>button i.ico::before {
	transition: transform 0.2s cubic-bezier(0, 0.8, 0.45, 1.35);
	transform: scale(-1) translate(0.5px, 0);
	display: block;
}
.app_sidebar .link[data-toggle]>button:hover {
	background: #0000
}

/* version string */
.app_sidebar #wrapper_ver {
	color: #909090;
	display: block;
	font-size: 13px;
	text-align: center;
}

/***
dark mode recoloring
***/
html.dark .app_sidebar {
	background: hsl(246 11% 12% / 1);
}
html.dark .app_sidebar #logo_container {
	background: hsl(246 11% 9% / 1);
	border-color: hsl(246 11% 16% / 1);
}
html.dark .app_sidebar #logo_container .toggle_btn:hover {
	background: #1b1924;
}
/* groups */
html.dark .app_sidebar>ul:first-of-type {
	border-color: #343242;
}
html.dark .app_sidebar>ul:last-of-type {
	border-color: #343242;
}
/* links */
html.dark .app_sidebar .link>a {
	color: #ddd;
}
html.dark .app_sidebar .link>button {
	color: #ddd;
}
html.dark .app_sidebar .link i {
	color: #9f9eab;
}
html.dark .app_sidebar .link::after {
	background: linear-gradient(90deg, #0000 0, #2c2b36 10px);
}
html.dark .app_sidebar .link.pin_btn {
	background: #23222d;
	box-shadow: inset 0 0 0 1px #1b1a21;
}
html.dark .app_sidebar .link:hover {
	background: #422b3d;
}
html.dark .app_sidebar .link:hover::after {
	background: linear-gradient(90deg, #0000 0, #422b3d 10px);
}
html.dark .app_sidebar .link.sel {
	background: #3c2234;
	border-color: #732a46;
	color: #fff;
}
/* create button */
html.dark .app_sidebar .link.create {
	background: #a82447;
	border-bottom-color: #732137;
}
html.dark .app_sidebar .link.create i {
	color: #ccc;
}
html.dark .app_sidebar .link.create::after {
	background: linear-gradient(90deg, #0000 0, #a82447 10px);
}
html.dark .app_sidebar .user_custom .link>button:hover {
	background: #573344;
}
html.dark .app_sidebar #wrapper_ver {
	color: #bbb;
}

/**
width below 200px
**/
/* hide the logo wordmark */
.app_sidebar.logo_collapsed #logo_container {
	width: 62px;
}
.app_sidebar.logo_collapsed #logo_container #logo_icon {
	left: calc(50% - calc(41px / 2));
}
.app_sidebar.logo_collapsed #logo_container #logo_wordmark {
	opacity: 0;
}

/**
collapsed
**/
/* display groups vertically */
.app_sidebar.collapsed .group>ul {
	display: block;	
}
.app_sidebar.collapsed .group>ul>.link {
	width: 100%;
}
.app_sidebar.collapsed .link::after {
	content: none;
}
/* flip the collapse button and hide link text */
.app_sidebar.collapsed .link[data-toggle] i.ico::before {
	transform: scale(1);
}
.app_sidebar.collapsed .link_text {
	display: none;
}

/**
resize state
**/
.app_sidebar.resize {
	filter: brightness(0.95);
	transition: none;
}
.app_sidebar.resize #logo_container {
	transition: none;
}
.app_sidebar.resize .dragger {
	background: #5298d6;
}

/**
cc + small window
**/
.app_sidebar.slide_mode {
	transition: transform 0.2s var(--slide-anim), filter 0.2s var(--slide-anim);
	filter: brightness(0.92);
}
.app_sidebar.slide_mode:hover {
	box-shadow: 2px 0 10px #0003;
	filter: none;
	position: relative;
	transform: translateX(v-bind("-slideMode.margin + 'px'"))
}

/**
animations
**/
@keyframes iconBounce {
	0% {
		transform: scale(1);
	}
	50% {
		transform: scale(0.4);
	}
	100% {
		transform: scale(1);
	}
}

</style>

<script setup lang="ts">
import AppInfoModal from "./AppInfoModal.vue";
import Dropdown from "./controls/Dropdown.vue";
import DropdownItem from "./controls/DropdownItem.vue";
import DropdownSeparator from "./controls/DropdownSeparator.vue";
import { onBeforeRouteLeave } from "vue-router";
import { ref, toValue } from "vue";
import SettingsModal from "./SettingsModal.vue";

const inResize = ref(false);
const collapsed = ref(false);
const logoCollapsed = ref(false);
const width = ref(250);

const displaySettings = ref(false);
const displayAppInfo = ref(false);

/**
 * sets the sidebar width
 * @param newWidth new width in px
 */
function setWidth(newWidth:number) {
	if (newWidth <= 93) { // min
		if (newWidth <= 46) {
			width.value = 56;
		} else {
			width.value = 93;
		}
	} else {
		width.value = Math.min(newWidth, 590);
	}
	collapsed.value = toValue(width) <= 56;
	logoCollapsed.value = toValue(width) <= 200;
}

/*
set a minimum page width for cc paths
*/
const slideMode = ref({
	margin: 0,
	enabled: false,
});
function watchWidth() {
	slideMode.value.margin = Math.min(0, -toValue(width) + Math.max(56, document.body.clientWidth - 1000));
	// slideMode.value.enabled = toValue(slideMode).margin != 0;
}
onBeforeRouteLeave((to, from) => {
	if (to.path.startsWith("/character") && !from.path.startsWith("/character")) {
		window.addEventListener("resize", watchWidth);
		watchWidth();
		slideMode.value.enabled = true;
	} else if (from.path.startsWith("/character") && !to.path.startsWith("/character")) {
		window.removeEventListener("resize", watchWidth);
		slideMode.value.margin = 0;
		slideMode.value.enabled = false;
	}
});

function openInfo() {

}

function onLinkClick(e:MouseEvent) {
	// console.log(e.currentTarget)
}

function pin() {

}

/**
 * called when the user clicks on the size dragger,
 * listens for mousemove and mouseup events
 */
function draggerDown(e:MouseEvent) {
	inResize.value = true;
	document.body.classList.add("col_resize");
	const startX = e.clientX;
	const startWidth = width.value;
	const moveCb = (moveE2:MouseEvent) => {
		const newWidth = startWidth - startX + moveE2.clientX;
		setWidth(newWidth);
	};
	window.addEventListener("mousemove", moveCb);
	window.addEventListener("mouseup", () => {
		window.removeEventListener("mousemove", moveCb);
		inResize.value = false;
		document.body.classList.remove("col_resize");
	});
}

/**
 * called when the settings button is clicked, opens settings menu
 */
function openSettings() {
	displaySettings.value = true;
}
function closeSettings() {
	displaySettings.value = false;
}

defineExpose({ slideMode, width });
</script>

<template>
	<div class="app_sidebar" :class="{
		collapsed,
		logo_collapsed: logoCollapsed,
		slide_mode: slideMode.enabled,
		resize: inResize
	}" :style="{
		marginLeft: slideMode.margin + 'px',
		width: width + 'px'
	}">
		<div id="logo_container" :style="{width:width + 'px'}">
			<div class="toggle_btn" @click="openInfo" title="About Wrapper: Offline">
				<img id="logo_icon" src="/img/logo_icon.svg" alt="Candy"/>
				<img id="logo_wordmark" src="/img/logo_wordmark.svg" alt="Wrapper: Offline"/>
			</div>
		</div>
		<ul>
			<Dropdown>
				<template #toggle>
					<li class="link create">
						<button>
							<i class="ico arr_r"></i>
							<div class="link_text">New</div>
						</button>
					</li>
				</template>
				<RouterLink to="/movies/create" class="dropdown_item">Create a video</RouterLink>
				<DropdownSeparator></DropdownSeparator>
				<DropdownItem>Upload a video</DropdownItem>
				<DropdownItem>Upload a character</DropdownItem>
			</Dropdown>
			<div class="spacer"></div>
			<li class="link">
				<RouterLink to="/characters" @click="onLinkClick">
					<i class="ico person"></i>
					<div class="link_text">Characters</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/movies" @click="onLinkClick">
					<i class="ico film"></i>
					<div class="link_text">Videos</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/starters" @click="onLinkClick">
					<i class="ico briefcase"></i>
					<div class="link_text">Starters</div>
				</RouterLink>
			</li>
			<li class="link">
				<RouterLink to="/assets" @click="onLinkClick">
					<i class="ico cloud"></i>
					<div class="link_text">Your Library</div>
				</RouterLink>
			</li>
		</ul>
		<ul class="user_custom">
			<h3>Pinned Links</h3>
			<li class="link pin_btn" data-toggle @click="pin">
				<button>
					<i class="ico arr_r"></i>
					<div class="link_text">Pin current page</div>
				</button>
			</li>
		</ul>
		<ul>
			<li class="group">
				<ul>
					<li class="link">
						<a href="javascript:window.appWindow.openFaq();">
							<i class="ico interr"></i>
							<div class="link_text">FAQ</div>
						</a>
					</li>
					<div class="divider"></div>
					<li class="link">
						<a href="javascript:window.appWindow.openDiscord();">
							<i class="ico speech"></i>
							<div class="link_text">Discord</div>
						</a>
					</li>
				</ul>
			</li>
			<li class="link">
				<button @click="openSettings">
					<i class="ico cog"></i>
					<div class="link_text">Settings</div>
				</button>
			</li>
			<span id="wrapper_ver">2.1.0</span>
		</ul>
		<div
			v-if="!slideMode.enabled"
			class="dragger"
			:style="{left: width - 3 + 'px'}"
			@mousedown="draggerDown"></div>
		<SettingsModal v-if="displaySettings" @close-click="closeSettings"/>
	</div>
</template>
