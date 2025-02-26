<script lang="ts">
	import type { PageData } from "./$types";
	import { EventPlanner } from "$lib";
	import { appearances } from "$lib/data";

	let {data}: {data: PageData} = $props();
</script>

<EventPlanner {appearances} events={data.events} eventId={data.selected}
	defaultLayout={data.layout} defaultCollapsed={data.collapsed} navCollapsedSize={4} />