import { fetchEventById } from "$lib/server/remote-events";
import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({params}) => {
  const eventId = Number(params.id);

  try {
    const event = await fetchEventById(eventId);

    if (event) {
      return new Response(JSON.stringify(event), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(
      JSON.stringify({ message: 'Event not found' }),
      {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}