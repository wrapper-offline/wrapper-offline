import acapela from "./acapela";
import cepstral from "./cepstral";
import cereproc from "./cereproc";
import ispeech from "./ispeech";
import nuance from "./nuance";
import readloud from "./readloud";
import streamlabs from "./streamlabs";
import tiktok from "./tiktok";
import vocalware from "./vocalware";
import voiceforge, { accountStats } from "./voiceforge";
import { Engine, Voice } from "../interfaces/tts";
import langCodeMap from "../data/lang_code_map.json";
import settings from "../../storage/settings";

export let JOEY_ID:string;
export let engines:Engine[] = [];
export let voiceList:string;

settings.addListener("voiceforgeEmail", updateEngineList);
settings.addListener("pollyService", updateEngineList);

updateEngineList();
voiceList = generateListXml();

/**
 * updates the array of every tts engine
 */
async function updateEngineList() {
	engines = [
		acapela,
		cepstral,
		cereproc,
		ispeech,
		nuance,
		tiktok,
		vocalware
	];
	try {
		const stats = await accountStats();
		if (!stats.canUseLegacyVoices) {
			voiceforge.voices = voiceforge.voices.filter((v:any) => !v.legacy);
		}
		if (stats.synthesisUsed < stats.synthesisLimit) {
			engines.push(voiceforge);
		}
	} catch (e) {}
	switch (settings.pollyService) {
		case "rl":
			engines.push(readloud);
			JOEY_ID = "ReadLoud\\Joey";
			break;
		case "sl":
			// streamlabs doesn't have Eric for some reason so we gotta add it from readloud
			//
			//
			// yeah, that means this option isn't really "Streamlabs only"
			//
			// but
			//
			// it'll be our little secret.
			//
			const lobotomizedRl = Object.assign({}, readloud);
			const eric = lobotomizedRl.voices.find((v) => v.name == "Eric");
			if (eric) {
				lobotomizedRl.voices = [eric];
			}
			engines.push(lobotomizedRl);
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
	const dupes:Record<string, boolean | undefined> = {};
	for (const voice of voices) {
		dupes[voice.name] = typeof dupes[voice.name] == "undefined" ? false : true;
	}
	const languages:Record<string, string[]> = {};
	for (const voice of voices) {
		let id = `${voice.source}\\${voice.name}`;
		if (id == JOEY_ID) { // video editor expects a voice with the id "joey"
			id = "joey";
		}
		const name = dupes[voice.name] ? `${voice.name} (${voice.source})` : voice.name;
		languages[voice.lang] = languages[voice.lang] || [];
		languages[voice.lang].push(`<voice id="${id}" desc="${name}" sex="${voice.gender}" country="${voice.country}"/>`)
	}
	const xml = `${process.env.XML_HEADER}<voices>${
		Object.keys(languages).map((langCode) => {
			const voices = languages[langCode];
			const langName = (langCodeMap as Record<string, string | undefined>)[langCode];
			return `<language id="${langCode}" desc="${langName || langCode}">${voices.join("")}</language>`;
		}).join("")
	}</voices>`;
	return xml;
}; 
