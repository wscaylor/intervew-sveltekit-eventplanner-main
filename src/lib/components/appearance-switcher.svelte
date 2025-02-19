<script lang="ts">
	import type { Appearance } from "$lib/data.js";
	import * as Select from "$lib/ui/select/index.js";
	import { cn } from "$lib/utils.js";
	import { setMode } from "mode-watcher";
	import { browser } from '$app/environment';
	import { onMount } from "svelte";

	export let isCollapsed: boolean;
	export let appearances: Appearance[];

	let selectedAppearance = appearances[2];
	let appearanceHasLoaded = false;

	onMount(() => {
		let modeWatcherMode = browser && localStorage.getItem('mode-watcher-mode');
		let modeWatcherAppearance = modeWatcherMode ? appearances.find(a => a.classNameValue === modeWatcherMode) : undefined;
		selectedAppearance = modeWatcherAppearance ? modeWatcherAppearance : appearances[2];
		appearanceHasLoaded = true;
	})

	function updateAppearance() {
		let mode = selectedAppearance.classNameValue;
		setMode(mode === "light" ? "light" : mode === "dark" ? "dark" : "system");
	}
</script>
{#if appearanceHasLoaded}
	<Select.Root
	portal={null}
	selected={{ value: selectedAppearance.classNameValue, label: selectedAppearance.label }}
	onSelectedChange={(e: any) => {
		selectedAppearance = appearances.find((appearance) => appearance.classNameValue === e?.value) || appearances[0];
		updateAppearance();
	}}
	>
		<Select.Trigger
			class={cn(
				"flex items-center gap-2 [&>span]:line-clamp-1 [&>span]:flex [&>span]:w-full [&>span]:items-center [&>span]:gap-1 [&>span]:truncate [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
				isCollapsed &&
					"flex h-9 w-9 shrink-0 items-center justify-center p-0 [&>div>svg]:hidden [&>span]:w-auto"
			)}
			aria-label="Select appearance"
		>
			<span class="pointer-events-none">
				<svelte:component this={selectedAppearance.icon} class={cn(isCollapsed ? "ml-2" : "")} />
				<span class={cn(isCollapsed ? "!ml-0 !hidden" : "ml-2")}>
					{selectedAppearance.label}
				</span>
			</span>
		</Select.Trigger>
		<Select.Content sameWidth={!isCollapsed} align={isCollapsed ? "start" : undefined}>
			<Select.Group>
				{#each appearances as theme}
					<Select.Item value={theme.classNameValue} label={theme.label}>
						<div
							class="[&_svg]:text-foreground flex items-center gap-3 [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0"
						>
							<svelte:component
								this={theme.icon}
								aria-hidden="true"
								class="text-foreground size-4 shrink-0"
							/>
							{theme.label}
						</div>
					</Select.Item>
				{/each}
			</Select.Group>
		</Select.Content>
		<Select.Input hidden name="account" />
	</Select.Root>
{/if}