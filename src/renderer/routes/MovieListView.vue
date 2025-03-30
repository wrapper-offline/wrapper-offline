<style lang="css" scoped>
.page_contents {
	overflow: auto;
}

/**
view options row
**/
.view_options {
	border-bottom: 1px solid #bfbeca;
	display: flex;
	padding: 6px 0 4px 30px;
	justify-content: space-between;
}
.view_options .zoom_slider {
	display: flex;
}
.view_options .zoom_slider input {
	margin-left: 4px;
}
.view_options .view_change .btn {
	font-weight: normal;
	margin: 0 4px 0 0;
	padding: 2px 8px 1px;
}
.view_options .view_change .btn:hover {
	opacity: 0.8;
}
html.dark .view_options {
	border-color: #32313f;
}

/***
list view
***/

table.movie_list {
	border-collapse: collapse;
	border-spacing: 0;
	table-layout: fixed;
	width: 100%;
}

/**
list head
*s*/
thead.list_head {
	border-bottom: 2px solid;
	border-color: #bfbeca;
}
thead.list_head th {
	border-left: 1px solid;
	border-color: #bfbeca;
	top: 0;
}
thead.list_head .space.side_padding {
	border: none;
	width: 25px;
}
thead.list_head .sort_option {
	transition: background 0.2s var(--button-anim);
	text-align: left;
	padding: 10px 6px;
	line-height: 15px;
}
thead.list_head .sort_option.active::after {
	content: "🞃";
	opacity: 0.7;
	float: right;
	transform: translate(-2px, -1px);
}
thead.list_head .sort_option.active.desc::after {
	transform: translate(-2px, 3px) rotate(180deg);
}
thead.list_head .sort_option:hover {
	background: #ffeaf4;
	transition: none;
}
/* resize dragger */
thead.list_head th .dragger {
	cursor: col-resize;
	position: absolute;
	float: right;
	margin-top: -23px;
	width: 6px;
	height: 32px;
}
thead.list_head th .dragger:hover {
	background: #489cf7a3;
	transition: 0.1s ease-in;
}
html.dark thead.list_head {
	border-color: #32313f;
}
html.dark thead.list_head th {
	border-color: #32313f;
}
html.dark thead.list_head .sort_option:hover {
	background: #422b3d;
}


/***
list view
***/

tbody {
	height: 100%;
}


/***
grid view
***/

.movie_grid {
	margin-top: 10px;
	padding-left: 25px;
}

</style>

<script setup lang="ts">
import { apiServer } from "../controllers/AppInit";
import ListTree from "../components/list/ListTree.vue";
import Navbar from "../components/Navbar.vue";
import type { NavbarEntry } from "../components/Navbar.vue";
import type { Movie } from "../interfaces/Movie";
import MovieListEntryRenderer from "../components/list/MovieListEntryRenderer.vue";
import {
	onMounted,
	provide,
	ref,
	Ref,
	toValue,
	watch
} from "vue";
import { useRoute } from "vue-router";
import { view, zoomLevel } from "../controllers/listRefs";
import { zoomLevelKey } from "../keys/listTreeKeys";
import type { FieldIdOf, ListFieldColumn, SelectedListSort } from "../interfaces/ListTypes";

const route = useRoute();
/** movie or starters page being used */
let listPage:"movie"|"starter";
/** id of the folder whose contents are currently being listed */
const currentFolder = ref<string>();

/** list of links to display in the navbar's address */
const navbarEntries = ref<NavbarEntry[]>([]);
/** list of movies and folders (if applicable) */
const movieList = ref<{
	folders: [],
	entries: Movie[]
}>();

/* movie list columns */
let sortOptions:ListFieldColumn<Movie>[] = [
	{
		id: "title",
		title: "Name",
		width: ref(250),
	},
	{
		id: "id",
		title: "Movie ID",
		width: ref(100),
	},
	{
		id: "duration",
		title: "Duration",
		width: ref(100),
	},
	{
		id: "date",
		title: "Modified",
		width: ref(180),
	}
];

/** list sort option that is currently selected */
const selectedSort = ref<SelectedListSort<Movie>>({
	id: "title",
	descending: true
});

/**
 * resets the movie list object to a blank value
 */
function initList() {
	movieList.value = {
		folders: [],
		entries: [],
	};
}

/**
 * converts a timestamp string to the amount of seconds
 * @param time timestamp
 */
function timestampToSeconds(time:string) {
	const nums = time.split(":").map((v) => Number(v));
	for (const index in nums) {
		if (index == (nums.length - 1).toString()) {
			return nums[index];
		}
		nums[index + 1] += nums[index] * 60;
	}
}

/**
 * used to resort a list of entries
 * @param movie1 movie 1
 * @param movie2 movie 2
 */
function movieSortCb(movie1:Movie, movie2:Movie): number {
	let mul = toValue(selectedSort).descending ? 1 : -1;
	const sortOption = toValue(selectedSort).id;
	switch (sortOption) {
		case "id":
		case "title": {
			return movie1[sortOption].localeCompare(movie2[sortOption]) * mul;
		}
		case "duration": {
			// hehehehehe sex
			const secs1 = timestampToSeconds(movie1.duration);
			const secs2 = timestampToSeconds(movie2.duration);
			return (secs2 - secs1) * mul;
		}
		case "date": {
			const date1 = new Date(movie1.date);
			const date2 = new Date(movie2.date);
			return (+date1 - +date2) * mul;
		}
	}
}

/**
 * called when the user clicks a sort option
 * @param newSort sort option to switch to
 */
function changeSort(newSort:FieldIdOf<Movie>) {
	// TODO : store sort option
	if (selectedSort.value.id == newSort) {
		selectedSort.value.descending = !selectedSort.value.descending;
	} else {
		selectedSort.value = {
			id: newSort,
			descending: true,
		};
	}
	movieList.value.entries = movieList.value.entries.sort(movieSortCb);
}

/**
 * called when the user resizes a movie list column
 * @param id sort option id
 * @param e mouse event
 */
function draggerDown(id:FieldIdOf<Movie>, e:MouseEvent) {
	document.body.classList.add("col_resize");
	const option = sortOptions.find(v => v.id == id);
	const startX = e.clientX;
	const startWidth = toValue(option.width);
	const moveCb = (moveE2:MouseEvent) => {
		let newWidth = Math.max(startWidth - startX + moveE2.clientX, 95);
		newWidth = Math.min(newWidth, 400);
		option.width.value = newWidth;
	};
	window.addEventListener("mousemove", moveCb);
	window.addEventListener("mouseup", () => {
		window.removeEventListener("mousemove", moveCb);
		document.body.classList.remove("col_resize");
	});
}

/**
 * initializes the list using either the movie or starter list
 * if a movie list is being loaded, it allows a folder to be specified
 * @param filter should the movie or starter list be loaded
 * @param folderId folder to load
 */
function getMovieTree(filter:"starter"): Promise<{
	list_data: {
		folders: [],
		entries: Movie[],
	}
}>
function getMovieTree(filter:"movie", folderId:string): Promise<{
	navbar_parent_folders: NavbarEntry[],
	list_data: {
		folders: [],
		entries: Movie[],
	}
}>
function getMovieTree(filter:"movie"|"starter", folderId?:string) {
	return new Promise((res) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			let responseJson = JSON.parse(this.responseText);

			let parentFolderEntries: NavbarEntry[] | void;
			if (filter == "movie") {
				parentFolderEntries = responseJson.folder_path.map(v => ({
					path: "/movies/" + v.id,
					title: v.title
				}));
			}
			res({
				navbar_parent_folders: parentFolderEntries,
				list_data: {
					folders: responseJson.folders,
					entries: responseJson.movies,
				}
			});
		};
		let url = `${apiServer}/api/movie/list?type=${filter}`;
		if (folderId && folderId.length > 0) {
			url += `&path=${folderId}`;
		}
		xhttp.open("GET", url, true);
		xhttp.send();
	});
}

/**
 * called when the route updates, gathers information before reloading the list
 */
async function routeUpdated() {
	listPage = route.name == "movie_list" ? "movie" : "starter";
	if (listPage == "movie") {
		currentFolder.value = route.params.folderId as string || "";
	}
	await loadMovieList();
}

/**
 * loads the movie/starter list along with the relevant navbar entries
 */
async function loadMovieList() {
	initList();
	if (listPage == "movie") {
		const response = await getMovieTree(listPage, toValue(currentFolder));
		navbarEntries.value = [
			{
				path: "/movies",
				title: "Videos"
			},
			...response.navbar_parent_folders
		];
		movieList.value = response.list_data;
	} else {
		const response = await getMovieTree(listPage);
		navbarEntries.value = [
			{
				path: "/starters",
				title: "Starters"
			}
		];
		movieList.value = response.list_data;
	}
}

watch(() => route.path, routeUpdated);
onMounted(async () => {
	routeUpdated();
});

initList();
provide(zoomLevelKey, zoomLevel);

</script>

<template>
	<div>
		<Navbar :entries="navbarEntries" state="movielist"/>

		<div class="page_contents">
			<table class="movie_list">
				<thead class="list_head">
					<tr>
						<th class="space side_padding"></th>
						<th
							v-for="field in sortOptions" 
							@click.self="changeSort(field.id)"
							:class="{
								active: selectedSort.id == field.id,
								desc: selectedSort.descending,
								sort_option: true
							}"
							:style="{
								width: view == 'list' ? field.width.value + 'px' : '150px'
							}">
							{{ field.title }}
							<div v-if="view == 'list'"
								class="dragger"
								:style="{marginLeft: field.width.value - 11 + 'px'}"
								@mousedown.stop.prevent="(e) => draggerDown(field.id, e)"></div>
						</th>
						<th class="space"></th>
					</tr>
				</thead>
				<tbody id="list_body"></tbody>
			</table>

			<Teleport defer to="#list_body" :disabled="view == 'grid'">
				<ListTree
					ref="base-tree"
					:columns="sortOptions.map((v) => v.id)"
					:data="movieList"
					:renderer="MovieListEntryRenderer"
					:selectedSort="selectedSort"/>
			</Teleport>
		</div>
	</div>
</template>
