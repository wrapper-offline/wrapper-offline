<style lang="css" scoped>
#page_container {
	user-select: none;
	padding: 20px 15px 5px;
	display: flex;
	flex-direction: column;
}

/**
view options row
**/
.view_options {
	border-top: 1px solid;
	border-bottom: 1px solid;
	border-color: #bfbeca;
	display: flex;
	padding: 6px 0 4px 25px;
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
.list_view table.movie_list {
	flex-grow: 1;
}

/**
list head
*s*/
thead.list_head {
	border-bottom: 2px solid;
	border-color: #bfbeca;
	height: 34px;
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
	padding: 8px 6px;
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

/**
movie actions
**/
.actions .action {
	background: #838190;
	color: #fff;
	border-radius: 100%;
	transition: 0.2s var(--button-anim);
	padding: 4px 4px 1px;
	margin: 0 4px;
}
.actions .action:hover {
	opacity: 0.8;
	transition: none;
}
html.dark .actions .action {
	background: #42404f;
}

/***
list view
***/

tbody {
	height: 100%;
}

/**
movie row
**/
tr.movie {
	border-bottom: 1px solid;
	border-color: #cbcad3;
	align-items: center;
	transition: background 0.2s var(--button-anim);
	height: v-bind("zoomLevel");
}
tr.movie td {
	line-height: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	padding: 10px 6px;
}
tr.movie td.title {
	display: flex;
	align-items: center;
}
tr.movie td.title img {
	display: block;
	margin-right: 7px;
	width: auto;
	height: calc(v-bind("zoomLevel") - 20px);
}
/* movie title */
tr.movie td.title span {
	overflow: hidden;
	text-overflow: ellipsis;
	display: block;
}
tr.movie:hover {
	background: #ffeaf4;
	transition: none;
}
html.dark tr.movie {
	border-color: #32313f;
}
html.dark tr.movie:hover {
	background: #422b3d;
}

.folder td.title img {
	min-width: calc(calc(calc(v-bind("zoomLevel") - 20px) / 9) * 16);
}


/***
grid view
***/

.movie_grid {
	margin-top: 10px;
	padding-left: 25px;
}

/**
movie tile
**/
div.movie {
	border: 1px solid #c8c5dc;
	border-radius: 3px;
	transition: 0.2s var(--button-anim);
	display: inline-flex;
	flex-direction: column;
	margin: 0 5px 10px;
	padding: 6px 7px;
	width: calc(4 * v-bind("zoomLevel"));
}
div.movie .thumbnail_container img {
	width: 100%;
}
div.movie .thumbnail_container .duration {
	background: #0007;
	color: #fff;
	border-radius: 2px;
	position: absolute;
    margin-top: -36px;
    margin-left: 5px;
	padding: 0 4px;
}
div.movie .title {
	font-weight: bold;
	line-height: 17px;
	margin-bottom: 2px;
}
div.movie .modified {
	font-size: 13px;
}
div.movie .actions {
	margin-top: 3px;
	text-align: center;
}
div.movie:hover {
	background: #ffebf9;
	border-color: #e2a5bd;
	box-shadow: 0 2px 4px #00000010;
	transition: none;
}
html.dark div.movie {
	border-color: #2b2a37;
}
html.dark div.movie:hover {
	background: #422b3d;
	border-color: #5f3b57;
}

</style>

<script setup lang="ts">
import { apiServer } from "../controllers/AppInit";
import Button from "../components/controls/Button.vue";
import type { Movie } from "../../main/server/models/movie";
import { onMounted, ref, Ref, toValue, watch } from "vue";
import { useRoute } from "vue-router";

type MovieField = "title" | "duration" | "modified";
type MovieTypeFilter = "movie" | "starter";

/**
 * loads the movie list from the server
 */
function loadMovieList(filter:MovieTypeFilter) : Promise<Movie[]> {
	return new Promise((res, rej) => {
		const xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState != 4 || this.status != 200) {
				return;
			}
			let movies = JSON.parse(this.responseText);
			movies = movies.sort(movieSortFunc);
			res(movies);
		};
		xhttp.open("GET", `${apiServer}/api/movie/list?type=${filter}`, true);
		xhttp.send();
	});
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

const currentSort = ref<{
	id: MovieField,
	descending: boolean
}>({
	id: "title",
	descending: true
});
const movieList = ref<Movie[]>([]);
const view = ref(localStorage.getItem("movieList_view") || "list");
const zoomLevel = ref(localStorage.getItem("movieList_zoomLevel") || "60px");
let sortOptions:{id:MovieField, title:string, width:Ref<number>}[] = [
	{
		id: "title",
		title: "Name",
		width: ref(250),
	},
	{
		id: "duration",
		title: "Duration",
		width: ref(100),
	},
	{
		id: "modified",
		title: "Modified",
		width: ref(180),
	}
];
let movieFields = [];
function updateMovieFields() {
	movieFields = [];
	for (const sortOption of sortOptions) {
		if (sortOption.id == "title") {
			continue;
		}
		movieFields.push(sortOption.id);
	}
}
updateMovieFields();

/**
 * used to sort movies
 * @param movie1 movie 1
 * @param movie2 movie 2
 */
function movieSortFunc(movie1:Movie, movie2:Movie) {
	let mul = currentSort.value.descending ? 1 : -1;
	switch (currentSort.value.id) {
		case "title": {
			return movie1.title.localeCompare(movie2.title) * mul;
		}
		case "duration": {
			// hehehehehe sex
			const secs1 = timestampToSeconds(movie1.duration);
			const secs2 = timestampToSeconds(movie2.duration);
			return (secs2 - secs1) * mul;
		}
		case "modified": {
			const date1 = new Date(movie1.date);
			const date2 = new Date(movie2.date);
			return (+date1 - +date2) * mul;
		}
	}
}

/**
 * returns a fixed date string for a movie
 * @param movie movie object
 */
function movieInfo(movie:Movie, field:MovieField) {
	switch (field) {
		case "title": {
			return movie.title;
		}
		case "modified": {
			const split = movie.date.split("T");
			const date = split[0];
			const time = split[1].substring(0, 8);
			return `${date}, ${time}`;
		}
		case "duration": {
			return movie.duration;
		}
	}
	
}

/**
 * called when the user clicks the view buttons
 * @param newView view to switch to
 */
function changeView(newView:"grid"|"list") {
	localStorage.setItem("movieList_view", newView);
	view.value = newView;
}

/**
 * called when the user adjusts the zoom slider
 */
function zoomSliderMoved(e:InputEvent) {
	const target = e.currentTarget as HTMLInputElement;
	const newVal = target.valueAsNumber;
	localStorage.setItem("movieList_zoomLevel", newVal + "px");
	zoomLevel.value = newVal + "px";
}

/**
 * called when the user clicks a sort option
 * @param newSort sort option to switch to
 */
function changeSort(newSort:MovieField) {
	// TODO : store sort option
	if (currentSort.value.id == newSort) {
		currentSort.value.descending = !currentSort.value.descending;
	} else {
		currentSort.value = {
			id: newSort,
			descending: true,
		};
	}
	movieList.value = movieList.value.sort(movieSortFunc);
}

/**
 * called when the user resizes a movie list column
 * @param id sort option id
 * @param e mouse event
 */
function draggerDown(id:MovieField, e:MouseEvent) {
	document.body.classList.add("col_resize");
	const option = sortOptions.find(v => v.id == id);
	const startX = e.clientX;
	const startWidth = toValue(option.width);
	const moveCb = (moveE2:MouseEvent) => {
		let newWidth = startWidth - startX + moveE2.clientX;
		if (newWidth <= 95) {
			newWidth = 95;
		}
		option.width.value = newWidth;
	};
	window.addEventListener("mousemove", moveCb);
	window.addEventListener("mouseup", () => {
		window.removeEventListener("mousemove", moveCb);
		document.body.classList.remove("col_resize");
	});
}

const route = useRoute();

onMounted(async () => {
	const typeFilter = route.params.filter as MovieTypeFilter;
	movieList.value = await loadMovieList(typeFilter);
});

watch(
	() => route.params.filter,
	async (newTypeFilter:MovieTypeFilter) => {
		movieList.value = await loadMovieList(newTypeFilter);
	}
);

</script>

<template>
	<div id="page_container" :class="{
		view: view + '_view'
	}">
		<div class="view_options">
			<div class="results_stats">Videos: {{ movieList.length }}</div>
			<div class="zoom_slider">
				Zoom:
				<input type="range" min="42" max="70" :value="zoomLevel.slice(0, -2)" @input="zoomSliderMoved"/>
			</div>
			<div class="view_change">
				<Button
					:primary="view == 'grid'"
					@click="() => changeView('grid')">
					<i class="ico grid"></i>
				</Button>
				<Button
					:primary="view == 'list'"
					@click="() => changeView('list')">
					<i class="ico blist"></i>
				</Button>
			</div>
		</div>
		<table class="movie_list">
			<thead class="list_head">
				<tr>
					<th class="space side_padding"></th>
					<th
						v-for="field in sortOptions" 
						@click="changeSort(field.id)"
						class="sort_option" 
						:class="{
							active: currentSort.id == field.id,
							desc: currentSort.descending
						}"
						:style="{
							width: view == 'list' ? field.width.value + 'px' : '150px'
						}">
						{{ field.title }}
						<div class="dragger" :style="{marginLeft: field.width.value - 11 + 'px'}" @mousedown.stop.prevent="(e) => draggerDown(field.id, e)"></div>
					</th>
					<th class="space"></th>
				</tr>
			</thead>
			<tbody v-if="view == 'list'">
				<tr v-for="movie in movieList" class="movie">
					<td></td>
					<td class="title">
						<img :src="`${apiServer}/file/movie/thumb/${movie.id}`" alt="thumbnail"/>
						<span>{{ movieInfo(movie, "title") }}</span>
					</td>
					<td v-for="field in movieFields">{{ movieInfo(movie, field) }}</td>
					<td class="actions">
						<RouterLink class="action" :to="`?redirect=/videos/play/${movie.id}`" target="_blank">
							<i class="ico play"></i>
						</RouterLink>
						<RouterLink class="action" :to="`/videos/edit/${movie.id}`">
							<i class="ico brush"></i>
						</RouterLink>
						<!-- <a href="/file/movie/file/${tbl.id}"  title="Download files -- NOT AN EXPORTER"></a> -->
						<!--<a href="javascript:;" onclick="popupExport('${tbl.id}')" title="Export"></a>-->
						<!-- <a href="javascript:;" onclick="destructive('${tbl.id}', 'delete')" title="Delete"></a> -->
					</td>
				</tr>
			</tbody>
		</table>
		<div v-if="view == 'grid'" class="movie_grid">
			<div v-for="movie in movieList" class="movie">
				<div class="thumbnail_container">
					<img :src="`${apiServer}/file/movie/thumb/${movie.id}`" alt="thumbnail"/>
					<td class="duration">{{ movie.duration }}</td>
				</div>
				<span class="title">{{ movieInfo(movie, "title") }}</span>
				<div class="modified">{{ movieInfo(movie, "modified") }}</div>
				<div class="actions">
					<RouterLink class="action" :to="`?redirect=/videos/play/${movie.id}`" target="_blank">
						<i class="ico play"></i>
					</RouterLink>
					<RouterLink class="action" :to="`/videos/edit/${movie.id}`">
						<i class="ico brush"></i>
					</RouterLink>
					<!-- <a href="/file/movie/file/${tbl.id}"  title="Download files -- NOT AN EXPORTER"></a> -->
					<!--<a href="javascript:;" onclick="popupExport('${tbl.id}')" title="Export"></a>-->
					<!-- <a href="javascript:;" onclick="destructive('${tbl.id}', 'delete')" title="Delete"></a> -->
				</div>
			</div>
		</div>
	</div>
</template>
