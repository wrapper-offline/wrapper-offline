const previewer = document.getElementById("previewer");
const previewObj = previewer.querySelector("#preview_player");
const studio = $("#obj");

/**
 * studio functions
 */
const tutorialReload = (new URLSearchParams(window.location.search)).get("tutorial");
interactiveTutorial = {
	neverDisplay: function() {
		return tutorialReload ? false : true;
	}
};
function studioLoaded(arg) { console.log(arg) }

/**
 * show and hide widgets
 */
let importerVisible = false;
function showImporter() {
	switch(importerVisible) {
		case true: {
			hideImporter();
			break;
		}
		case false:
		default: {
			importerVisible = true;
			importer.show();
			if (!importer.data("importer"))
				importer.data("importer", new AssetImporter(importer));
		}
	}
	return true;
}
function hideImporter() {
	importerVisible = false;
	importer.hide();
}

let globalXml = "";

function initPreviewPlayer(dataXmlStr, startFrame) {
	globalXml = dataXmlStr;
	hideImporter();
	// update flashvars
	const flashvars = new URLSearchParams({
		apiserver: "/",
		isEmbed: 1,
		tlang: "en_US",
		isInitFromExternal: 1,
		startFrame: startFrame,
		autostart: 1,
		isPreview: 1,
		storePath: STORE_URL + "/<store>",
		clientThemePath: CLIENT_URL + "/<client_theme>",
	}).toString();
	previewer.querySelector("object param[name='flashvars']").setAttribute("value", flashvars);
	previewObj.setAttribute("data", PLAYER_URL);
	document.body.classList.add("in_preview");
}
function retrievePreviewPlayerData() {
	const movieXml = globalXml.slice();
	globalXml = "";
	return movieXml;
}
function hidePreviewer() {
	previewObj.setAttribute("data", "");
	document.body.classList.remove("in_preview");
}
