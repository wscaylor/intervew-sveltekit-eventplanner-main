<script lang="ts">
	import { appearances } from "$lib/data.js";
	import EventPlanner from "$lib/components/event-planner.svelte";
	import type { PageData } from "./$types";

	let {data}: {data: PageData} = $props();
</script>

<EventPlanner {appearances} events={data.events} selectedEventId={data.selected}
	defaultLayout={data.layout} defaultCollapsed={data.collapsed} navCollapsedSize={4} />