import NavbarEntry from "../interfaces/NavbarEntry";
import { onUnmounted, reactive } from "vue";

interface NavbarRouteState {
	entries: NavbarEntry[]
}

/**
 * function to call when the navbar state changes
 * @param to new state
 * @param from old state
 */
type StateChangeFunction = (to:NavbarRouteState, from:NavbarRouteState) => any;

const defaultState:NavbarRouteState = {
	entries: [],
};

let currentState:NavbarRouteState = reactive(Object.create(defaultState));
let stateChangeCb:StateChangeFunction = () => {};

/**
 * sets a function to call when the navbar state is updated
 * @param callback function to call
 */
export function onNavbarStateUpdate(callback:StateChangeFunction) {
	stateChangeCb = callback;
	onUnmounted(() => {
		stateChangeCb = null;
	});
}

export function useNavbar() {
	return {
		currentState,
		resetState,
		setRouteState,
	};
};

/**
 * resets the navbar state to default
 */
function resetState() {
	setRouteState(defaultState);
}

/**
 * sets the navbar's state for the current route
 * @param newState new state to use
 */
function setRouteState(newState:Partial<NavbarRouteState>) {
	const oldState = {...currentState};
	for (let i in newState) {
		currentState[i] = newState[i]
	}
	if (stateChangeCb) {
		stateChangeCb({...currentState}, oldState);
	}
}
