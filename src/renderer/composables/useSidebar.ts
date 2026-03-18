import { onUnmounted, reactive } from "vue";

interface SidebarRouteState {
	/** slide the sidebar out of views */
	slideMode: boolean,
}

/**
 * function to call when the sidebar state changes
 * @param to new state
 * @param from old state
 */
type StateChangeFunction = (to:SidebarRouteState, from:SidebarRouteState) => any;

const defaultState:SidebarRouteState = {
	slideMode: false,
};

let currentState:SidebarRouteState = reactive(Object.create(defaultState));
let stateChangeCb:StateChangeFunction = () => {};

/**
 * sets a function to call when the sidebar state is updated
 * @param callback function to call
 */
export function onStateUpdate(callback:StateChangeFunction) {
	stateChangeCb = callback;
	onUnmounted(() => {
		stateChangeCb = null;
	});
}

export function useSidebar() {
	return {
		currentState,
		resetState,
		setRouteState,
	};
};

/**
 * resets the sidebar state to default
 */
function resetState() {
	setRouteState(defaultState);
}

/**
 * sets the sidebar's state for the current route
 * @param newState new state to use
 */
function setRouteState(newState:Partial<SidebarRouteState>) {
	const oldState = {...currentState};
	for (let i in newState) {
		currentState[i] = newState[i]
	}
	if (stateChangeCb) {
		stateChangeCb({...currentState}, oldState);
	}
}
