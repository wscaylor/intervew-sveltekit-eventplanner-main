<script lang="ts">
	import type { Appearance } from "$lib/data";
	import type { Event } from "$lib/server/remote-events";
	import * as Resizable from "$lib/ui/resizable/index.js";
	import {
		LoadingSpinner,
		EventDisplay,
		EventList,
		AppearanceSwitcher,
		Nav
	} from "$lib";
	import {
		creating,
		editing,
		selectedEventId
	} from "./store";
	import {
		onNavigate,
		pushState,
		replaceState
	} from "$app/navigation";
	import { Separator } from "$lib/ui/select";
	import { onMount } from "svelte";
	import { primaryRoutes } from "$lib/config";
	import { cn } from "$lib/utils";

	export let appearances: Appearance[];
	export let events: Promise<Event[]>;
	export let eventId: number | null = null;
	export let defaultLayout = [265, 440, 655];
	export let defaultCollapsed = false;
	export let navCollapsedSize: number;

	let selectedEvent: Promise<Event> | null = null;

	let isCollapsed = defaultCollapsed;

	onMount(() => {
		$creating = false;
		$editing = false;

		if (eventId) {
			handleEventSelection(eventId);
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
		$selectedEventId = null;
	}

	async function onEditEventClick() {
		$editing = true;
		$creating = false;
	}

	async function onCancelEventCreate() {
		$creating = false;
		$editing = false;
		replaceState('/events', {eventId: null})
		$selectedEventId = null;
		eventId = null;
		selectedEvent = null;
	}

	async function onCancelEventEdit() {
		$editing = false;
		$creating = false;
	}

	async function onEventUpdated(id: number) {
		handleEventSelection(id);
	}

	async function handleEventSelection(eventId: number | null) {
		$creating = false;
		$editing = false;
		eventId = eventId;
		$selectedEventId = eventId;
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

<svelte:window on:popstate={(event) => {handlePopstate(event)}} />

<div class="hidden md:block">
	<Resizable.PaneGroup direction="horizontal" {onLayoutChange} class="h-full max-h-pane items-stretch">
		<Resizable.Pane defaultSize={defaultLayout[0]} collapsedSize={navCollapsedSize} collapsible
			minSize={15} maxSize={20} {onCollapse} {onExpand}>
			<div class={cn("flex h-[52px] items-center justify-center", isCollapsed ? "h-[52px]" : "px-2")}>
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
				<LoadingSpinner>
					<span slot="loading-text">
						loading events...
					</span>
				</LoadingSpinner>
			{:then events}
				<EventList {events} {onEventSelect} />
			{/await}
		</Resizable.Pane>
		<Resizable.Handle withHandle />
		<Resizable.Pane defaultSize={defaultLayout[2]} minSize={20}>
			<EventDisplay event={selectedEvent} {onCreateEventClick} {onEditEventClick} {onCancelEventCreate}
				{onCancelEventEdit} {onEventUpdated} />
		</Resizable.Pane>
	</Resizable.PaneGroup>
</div>