import type { ComponentType } from "svelte";
import type { Icon } from "lucide-svelte";
import * as Icons from "./icons";

export type Appearance = {
	label: string;
	classNameValue: string;
	icon: ComponentType<Icon>;
};

export const appearances: Appearance[] = [
	{
		label: "Light",
		classNameValue: "light",
		icon: Icons.Sun,
	},
	{
		label: "Dark",
		classNameValue: "dark",
		icon: Icons.Moon,
	},
	{
		label: "System",
		classNameValue: "system",
		icon: Icons.PcCase,
	}
];