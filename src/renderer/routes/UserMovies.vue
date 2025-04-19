<style lang="css">
table.list_tree tbody tr.movie td.title img {
	width: calc(calc(calc(v-bind("zoomLevel") - 20px) / 9) * 16);
}
</style>

<script setup lang="ts">
import { apiServer } from "../controllers/AppInit";
import ListTree from "../components/list/ListTree.vue";
import Navbar from "../components/Navbar.vue";
import type { NavbarEntry } from "../components/Navbar.vue";
import type { Movie } from "../interfaces/Movie";
import MovieListRow from "../components/list/MovieListRow.vue";
import {
	onMounted,
	provide,
	ref,
	toValue,
	watch
} from "vue";
import { useRoute } from "vue-router";
import { zoomLevel } from "../controllers/listRefs";
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
		width: ref(250),
	},
	{
		id: "id",
		width: ref(100),
	},
	{
		id: "duration",
		width: ref(100),
	},
	{
		id: "date",
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
			<ListTree
				ref="base-tree"
				:data="movieList"
				:component="MovieListRow"
				:selected-sort="selectedSort"
				:sort-options="sortOptions"
				@sort-change="changeSort"/>
		</div>
	</div>
</template>
