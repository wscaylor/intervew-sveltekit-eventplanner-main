import type { Icon } from "lucide-svelte";
import * as Icons from "./icons.js";
import type { ComponentType } from "svelte";

export type Route = {
	title: string;
	label: string;
	icon: ComponentType<Icon>;
	variant: "default" | "ghost";
	path: string;
};

export const primaryRoutes: Route[] = [
	{
		title: "Events",
		label: "",
		icon: Icons.Calendar,
		variant: "default",
		path: "/events"
	}
];