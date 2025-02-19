import { fetchAllEvents } from "$lib/server/remote-events";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
	const layoutCookie = event.cookies.get("PaneForge:layout");
	const collapsedCookie = event.cookies.get("PaneForge:collapsed");

	let layout: number[] | undefined;
	let collapsed: boolean | undefined;

	if (layoutCookie) layout = JSON.parse(layoutCookie);

	if (collapsedCookie) collapsed = JSON.parse(collapsedCookie);

	return { 
		layout,
		collapsed,
		events: fetchAllEvents()
	};
};