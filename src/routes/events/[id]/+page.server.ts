import { fetchAllEvents, createEvent, updateEventById, deleteEventById } from "$lib/server/remote-events";
import type { PageServerLoad, Actions } from "./$types";
import { redirect, fail } from "@sveltejs/kit";

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
		let validationErrorDescription: string | undefined;
		if (!title) {
			validationErrorDescription = 'title field is required';
		} else if (!description) {
			validationErrorDescription = 'description field is required';
		} else if (!date) {
			validationErrorDescription = 'date field is required';
		} else {
			await createEvent({title, description, date});
		}
		
		if (validationErrorDescription) {
			return fail(422, {
				description: validationErrorDescription,
				error: 'validation error'
			});
		}
	},
	edit: async ({request}) => {
		const formdata = await request.formData();
		const formdataId = formdata.get('id')?.toString();
		if (formdataId) {
			const eventId = parseInt(formdataId, 10);
			const title = formdata.get('title')?.toString();
			const description = formdata.get('description')?.toString();
			const date = formdata.get('date')?.toString();
			let validationErrorDescription: string | undefined;
			if (!title) {
				validationErrorDescription = 'title field is required';
			} else if (!description) {
				validationErrorDescription = 'description field is required';
			} else if (!date) {
				validationErrorDescription = 'date field is required';
			} else {
				await updateEventById(eventId, {title, description, date});
			}

			if (validationErrorDescription) {
				return fail(422, {
					description: validationErrorDescription,
					error: 'validation error'
				});
			}
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