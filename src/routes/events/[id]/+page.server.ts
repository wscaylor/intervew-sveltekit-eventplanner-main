import { fetchAllEvents, createEvent, updateEventById, deleteEventById } from "$lib/server/remote-events";
import type { PageServerLoad, Actions } from "./$types";
import { error, redirect } from "@sveltejs/kit";

let eventId: number;

export const load: PageServerLoad = async (event) => {
    eventId = parseInt(event.params.id);
    
    const layoutCookie = event.cookies.get("PaneForge:layout");
    const collapsedCookie = event.cookies.get("PaneForge:collapsed");

    let layout: number[] | undefined;
    let collapsed: boolean | undefined;

    if (layoutCookie) layout = JSON.parse(layoutCookie);

    if (collapsedCookie) collapsed = JSON.parse(collapsedCookie);

    return { 
        layout,
        collapsed,
        events: fetchAllEvents(),
        selected: eventId
    };
}

export const actions: Actions = {
	create: async ({request}) => {
		const formdata = await request.formData();
		const title = formdata.get('title')?.toString();
		const description = formdata.get('description')?.toString();
		const date = formdata.get('date')?.toString();
		if (!title || !date) {
			error(400, 'Title and Date are required');
		}
		await createEvent({title, description, date}).then((newEvent) => {
			redirect(303, `/events/${newEvent.id}`);
		});
	},
	edit: async ({request}) => {
		const formdata = await request.formData();
		const formdataId = formdata.get('id')?.toString();
		if (formdataId) {
			const eventId = parseInt(formdataId, 10);
			const title = formdata.get('title')?.toString();
			const description = formdata.get('description')?.toString();
			const date = formdata.get('date')?.toString();
			if (!title || !date) {
				error(400, 'Title and Date are required');
			}
			await updateEventById(eventId, {title, description, date}).then(() => {
				redirect(303, `/events`);
			});
		}
	},
	delete: async ({request}) => {
		const formdata = await request.formData();
		const formdataId = formdata.get('id')?.toString();
		if (formdataId) {
			const id = parseInt(formdataId, 10);
			await deleteEventById(id);
			redirect(303, `/events`);
		}
	}
}