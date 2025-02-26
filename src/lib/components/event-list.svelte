<script lang="ts">
	import type { Event } from "$lib/server/remote-events";
	import { ScrollArea } from "$lib/ui/scroll-area";
	import { selectedEventId } from "$lib/components/store";
	import { cn } from "$lib/utils";
	import { formatTimeAgo } from "./utils";

	export let events: Event[];
	export let onEventSelect: (eventId: number) => void;
</script>

<ScrollArea class="h-screen-scroll">
	<div class="flex flex-col gap-2 p-4 pt-0">
		{#if events.length <= 0}
			<p>No Events</p>
		{/if}
		{#each events as event}
			<button
				class={cn(
					"hover:bg-accent flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all",
					$selectedEventId === event.id && "bg-muted"
				)}
				on:click={() => onEventSelect(event.id)}
			>
				<div class="flex w-full flex-col gap-1">
					<div class="flex items-center">
						<div class="flex items-center gap-2">
							<div class="font-semibold">{event.title}</div>
						</div>
						<div
							class={cn(
								"ml-auto text-xs",
								$selectedEventId === event.id
									? "text-foreground"
									: "text-muted-foreground"
							)}
						>
							{formatTimeAgo(new Date(event.date))}
						</div>
					</div>
				</div>
				<div class="text-muted-foreground line-clamp-2 text-xs">
					{event.description?.substring(0, 300)}
				</div>
			</button>
		{/each}
	</div>
</ScrollArea>