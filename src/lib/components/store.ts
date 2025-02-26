import { writable } from "svelte/store";

export const selectedEventId = writable<number | null>(null);
export const creating = writable<boolean>(false);
export const editing = writable<boolean>(false);
export const deletingEvent = writable<boolean>(false);
export const updatingEvent = writable<boolean>(false);
export const creatingEvent = writable<boolean>(false);