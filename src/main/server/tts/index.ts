import acapela from "./acapela";
import cepstral from "./cepstral";
import cereproc from "./cereproc";
import ispeech from "./ispeech";
import langCodeMap from "../data/lang_code_map.json";
import nuance from "./nuance";
import streamlabs from "./streamlabs";
import tiktok from "./tiktok";
import vocalware from "./vocalware";
import { Voice } from "../interfaces/tts";
import readloud from "./readloud";
import settings from "../../storage/settings";

export let JOEY_ID:string;
export let engines = [];
export let voiceList:string;

settings.addListener("pollyService", () => {
	updateEngineList();
});

updateEngineList();
voiceList = generateListXml();

/**
 * updates the array of every tts engine
 */
function updateEngineList() {
	engines = [
		acapela,
		cepstral,
		cereproc,
		ispeech,
		nuance,
		tiktok,
		vocalware
	];
	switch (settings.pollyService) {
		case "rl":
			engines.push(readloud);
			JOEY_ID = "ReadLoud\\Joey";
			break;
		case "sl":
			engines.push(streamlabs);
			JOEY_ID = "Streamlabs\\Joey";
			break;
		default:
			engines.push(readloud);
			engines.push(streamlabs);
			JOEY_ID = "Streamlabs\\Joey";
	}
	voiceList = generateListXml();
};

/**
 * returns an xml containing a list of voices
 * @returns xml
 */
function generateListXml() {
	const voices:(Record<string, any> & Voice)[] = [];
	for (const engine of engines) {
		for (const vI in engine.voices) {
			const voice = engine.voices[vI] as Record<string, any> & Voice;
			voice.source = engine.name;
			voices.push(voice);
		}
	}
	const dupes = {};
	for (const voice of voices) {
		dupes[voice.name] = typeof dupes[voice.name] == "undefined" ? false : true;
	}
	const languages:Record<string, string[]> = {};
	for (const voice of voices) {
		let id = `${voice.source}\\${voice.name}`;
		if (id == JOEY_ID) {
			id = "joey";
		}
		const name = dupes[voice.name] ? `${voice.name} (${voice.source})` : voice.name;
		languages[voice.lang] = languages[voice.lang] || [];
		languages[voice.lang].push(`<voice id="${id}" desc="${name}" sex="${voice.gender}" country="${voice.country}"/>`)
	}
	const xml = `${process.env.XML_HEADER}<voices>${
		Object.keys(languages).map((langCode) => {
			const voices = languages[langCode];
			const langName = langCodeMap[langCode];
			return `<language id="${langCode}" desc="${langName}">${voices.join("")}</language>`;
		}).join("")
	}</voices>`;
	return xml;
}; 
