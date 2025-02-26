import { redirect } from "@sveltejs/kit";

export function handleError() {
    redirect(301, "/events");
}