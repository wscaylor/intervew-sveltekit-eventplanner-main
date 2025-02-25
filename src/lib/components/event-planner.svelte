<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { primaryRoutes } from "$lib/config.js";
	import type { Appearance } from "$lib/data.js";
	import type { Event } from "$lib/server/remote-events";
	import AppearanceSwitcher from "./appearance-switcher.svelte";
	import EventDisplay from "./event-display.svelte";
	import EventList from "./event-list.svelte";
	import Nav from "./nav.svelte";
	import { cn } from "$lib/utils.js";
	import * as Resizable from "$lib/ui/resizable/index.js";
	import { Separator } from "$lib/ui/select/index.js";
	import { creating, editing, selected } from './store';
	import { onNavigate, pushState, replaceState } from '$app/navigation';

	export let appearances: Appearance[];
	export let events: Promise<Event[]>;
	export let selectedEventId: number | null = null;
	export let defaultLayout = [265, 440, 655];
	export let defaultCollapsed = false;
	export let navCollapsedSize: number;

	let selectedEvent: Promise<Event> | null = null;

	let isCollapsed = defaultCollapsed;

	onMount(() => {
		$creating = false;
		$editing = false;

		if (selectedEventId) {
			handleEventSelection(selectedEventId);
		}

		if (typeof window !== "undefined") {
			window.addEventListener('popstate', handlePopstate);
		}
	});

	onDestroy(() => {
		if (typeof window !== "undefined") {
			window.removeEventListener('popstate', handlePopstate);
		}
	});

	onNavigate((x) => {
		if (x.to?.params?.id) {
			let eventId = parseInt(x.to?.params?.id, 10);
			pushState(`/events/${eventId}`, {eventId});
			handleEventSelection(eventId);
		}
	})

	function handlePopstate(event: any) {
		let states = event.state['sveltekit:states'];
		if (states) {
			let eventId = event.state['sveltekit:states'].eventId;
			if (eventId) {
				handleEventSelection(parseInt(eventId, 10));
			}
		} else {
			handleEventSelection(null);
		}
	}

	function onLayoutChange(sizes: number[]) {
		document.cookie = `PaneForge:layout=${JSON.stringify(sizes)}`;
	}

	function onCollapse() {
		isCollapsed = true;
		document.cookie = `PaneForge:collapsed=${true}`;
	}

	function onExpand() {
		isCollapsed = false;
		document.cookie = `PaneForge:collapsed=${false}`;
	}

	async function onEventSelect(eventId: number) {
		pushState(`/events/${eventId}`, {eventId});
		handleEventSelection(eventId);
	}

	async function onCreateEventClick() {
		$creating = true;
		$editing = false;
		pushState('/events/create', {eventId: null});
		$selected = null;
	}

	async function onEditEventClick() {
		$editing = true;
		$creating = false;
	}

	async function onCancelEventCreate() {
		$creating = false;
		$editing = false;
		replaceState('/events', {eventId: null})
		$selected = null;
		selectedEventId = null;
		selectedEvent = null;
	}

	async function onCancelEventEdit() {
		$editing = false;
		$creating = false;
	}

	async function handleEventSelection(eventId: number | null) {
		selectedEventId = eventId;
		$selected = eventId;
		try {
			if (eventId) {
				selectedEvent = fetchEventById(eventId);
			} else {
				selectedEvent = null;
			}
		} catch (error) {
			console.error('Error fetching event details:', error);
		}
  	}

	async function fetchEventById(id: number): Promise<Event> {
		const response = await fetch(`/api/events/${id}`);

		if (!response.ok) {
			throw new Error('Failed to fetch event');
		}

		const event = await response.json();
		return event;
	}
</script>

<div class="hidden md:block">
	<Resizable.PaneGroup
		direction="horizontal"
		{onLayoutChange}
		class="h-full max-h-pane items-stretch"
	>
		<Resizable.Pane
			defaultSize={defaultLayout[0]}
			collapsedSize={navCollapsedSize}
			collapsible
			minSize={15}
			maxSize={20}
			{onCollapse}
			{onExpand}
		>
			<div
				class={cn(
					"flex h-[52px] items-center justify-center",
					isCollapsed ? "h-[52px]" : "px-2"
				)}
			>
				<AppearanceSwitcher {isCollapsed} {appearances} />
			</div>
			<Separator />
			<Nav {isCollapsed} routes={primaryRoutes} />
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={defaultLayout[1]} minSize={30}>
			<div class="flex items-center px-4 py-2">
				<h1 class="text-xl font-bold">Events</h1>
				<div class="h-9"></div>
			</div>
			<Separator />
			<div
				class="bg-background/95 supports-[backdrop-filter]:bg-background/60 p-1 backdrop-blur"
			>
			</div>
			{#await events}
				<p>Loading events...</p>
			{:then events}
				<EventList {events} {onEventSelect} />
			{/await}
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={defaultLayout[2]} minSize={20}>
			<EventDisplay event={selectedEvent} {onCreateEventClick} {onEditEventClick} {onCancelEventCreate}
				{onCancelEventEdit} />
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>