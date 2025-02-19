import { writable } from "svelte/store";

export const selected = writable<number | null>(null);
export const creating = writable<boolean>(false);
export const editing = writable<boolean>(false);
export const deleting = writable<boolean>(false);
export const savingEvent = writable<boolean>(false);
export const creatingEvent = writable<boolean>(false);