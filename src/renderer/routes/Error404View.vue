<script setup lang="ts">
import { onMounted, useTemplateRef } from "vue";

const text = useTemplateRef("text");
const tempo = 116;
const notes = [
	[.5, 4], // "you "
	[1, 4], // "got "
	[.5, 2], // "a "
	[1, 5],
	[.5, 3],
	[.5, 5],
	//
	[4],
	//
	[.5], [.5, 4], [.33, 4], [.33, 2], [1.33, 5], [.5, 3], [.5, 5],
	//
	[4],
	//
	[.5], [.5, 5], [.5, 4], [1.5, 5], [.5, 6], [1],
	//
	[.5], [.5, 6], [.5, 1], [1.5, 5], [.5, 4], [.5, 7], [1.5, 6],
	[.5, 4], [1, 6], [.5, 5], [.5, 5], [.5, 2],
	[1, 4], [.5, 4], [2],
	//
	[.5], [.5, 4], [.5, 5], [.5, 2], [.5, 3], [.5, 4], [.5, 5], [.5, 5],
	//
	[.5, 2], [1, 4], [.5, 5], [1], [.5, 5], [1.5, 4],
	[.5, 4], [.5, 2], [.5, 5], [1, 3], [.5, 5],
	//
	[3], [.5, 6], [1.5, 4],
	[.33, 4], [.33, 2], [1.5, 5], [.5, 3], [.5, 5]
];

async function _404insideMe() {
	if (!text.value) {
		return;
	}
	let originalText = text.value.innerHTML;
	text.value.innerHTML = "";
	for (const note of notes) {
		const time = note[0] * (60000 / tempo);
		if (note.length == 1) { // rest
			await rest(time);
			continue;
		}
		originalText = await sing(time, note[1], originalText);
	}
}

function sing(time:number, chars:number, originalText:string) {
	return new Promise<string>((resolve, reject) => {
		const interval = time / chars;
		const id = setInterval(() => {
			if (!text.value) {
				return;
			}
			let nextChar = originalText.slice(0, 1);
			let cutoff = 1;
			if (nextChar == "<") {
				cutoff = originalText.indexOf("> ") + 2;
				nextChar = originalText.slice(0, cutoff);
			}
			originalText = originalText.slice(cutoff);
			text.value.innerHTML += nextChar;
		}, interval);
		setTimeout(() => {
			clearTimeout(id);
			resolve(originalText);
		}, time);
	});
}

function rest(time:number) {
	return new Promise<void>((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, time);
	});
}

onMounted(_404insideMe);

</script>

<template>
	<div>
		<div class="page_contents">
			<!--- congratulations if you ever manage to reach this page -->
			<h2 id="404-file-not-found">404: File Not Found</h2>
			<p class="lyrics" ref="text">You got a four o’ four<br />
				You got a four o’ four<br />
				When the path looks rough ahead<br />
				And you’re miles and miles<br />
				From your asset bed<br />
				You just remember what this error said<br />
				Boy, you got a four o’ four<br />
				Yeah, you got a four o’ four</p>
		</div>	
	</div>
</template>

<style scoped>
.page_contents {
    border-top-left-radius: 10px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.lyrics {
	min-width: 260px
}

</style>
