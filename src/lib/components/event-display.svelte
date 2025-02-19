<script lang="ts">
	import { df } from "$lib"
	import type { Event } from "$lib/server/remote-events";
	import * as Icons from "$lib/icons";
	import { Button, buttonVariants } from "$lib/ui/button/index";
	import { Separator } from "$lib/ui/separator/index";
	import { Textarea } from "$lib/ui/textarea/index";
	import { Input } from "$lib/ui/input/index";
	import * as Tooltip from "$lib/ui/tooltip/index";
	import { creating, deleting, editing, creatingEvent, savingEvent, selected } from "$lib/components/store";
	import { enhance } from "$app/forms";
	import { type SubmitFunction } from "@sveltejs/kit";
	import { toast } from "svelte-sonner";

	export let event: Promise<Event | null> | null;
	export let onCreateEventClick: () => void;
	export let onEditEventClick: () => void;
	export let onCancelEventCreate: () => void;
	export let onCancelEventEdit: () => void;

	const fullFormatter = new df.DateFormatter("en-US", {
		dateStyle: "medium",
		timeStyle: "medium",
	});

	const submitCreateEvent: SubmitFunction = ({ formData, cancel }) => {
		$creating = false;
        $creatingEvent = true;
        const { date } = Object.fromEntries(formData);

        const inputDate = new Date(date.toString());
        const now = new Date();

        if (isNaN(inputDate.getTime()) || inputDate < now) {
            cancel();
			$creating = true;
            $creatingEvent = false;
			toast.error("Event cannot be created", {
				description: "Event Date cannot be in the past"
			});
        }

        return async ({ result, update }) => {
            await update().then(() => {
				$creatingEvent = false;
			});
        };
    }

	const submitUpdateEvent: SubmitFunction = ({ formData, cancel }) => {
		$editing = false;
        $savingEvent = true;
        const { date } = Object.fromEntries(formData);

        const inputDate = new Date(date.toString());
        const now = new Date();

        if (isNaN(inputDate.getTime()) || inputDate < now) {
            cancel();
			$editing = true;
            $savingEvent = false;
			toast.error("Event cannot be saved", {
				description: "Event Date cannot be in the past"
			});
        }

        return async ({ result, update }) => {
            await update().then(() => {
				$savingEvent = false;
				$selected = null;
			});
        };
	}

	const submitDeleteEvent: SubmitFunction = () => {
		$editing = false;
		$creating = false;
		$deleting = true;
		$selected = null;

        return async ({ update }) => {
            await update().then(() => {
				$deleting = false;
			});
        };
    }
</script>

<div class="flex h-full flex-col">
	<div class="mb-1 flex items-center p-2">
		<div class="flex items-center gap-2">
			<Tooltip.Root openDelay={0} group>
				<Tooltip.Trigger
					id="edit_tooltip"
					class={buttonVariants({ variant: "ghost", size: "icon" })}
					disabled={!event || $creating || $editing}
					onclick={onEditEventClick}
				>
					<Icons.Pencil class="size-4" />
					<span class="sr-only">Edit</span>
				</Tooltip.Trigger>
				<Tooltip.Content>Edit</Tooltip.Content>
			</Tooltip.Root>
			<form method="POST" action="?/delete" use:enhance={submitDeleteEvent}>
				<input type="text" id="id" name="id" value="{$selected}" hidden>
				<Tooltip.Root openDelay={0} group>
					<Tooltip.Trigger
						id="move_to_trash_tooltip"
						class={buttonVariants({ variant: "ghost", size: "icon" })}
						disabled={!event || $creating || $editing}
						type="submit"
					>

						<Icons.Trash2 class="size-4" />
						<span class="sr-only">Delete</span>
					</Tooltip.Trigger>
					<Tooltip.Content>Delete</Tooltip.Content>
				</Tooltip.Root>
			</form>
		</div>
		<div class="ml-auto flex items-center gap-2">
			<Separator orientation="vertical" class="mx-2 h-6" />
			<Tooltip.Root openDelay={0} group>
				<Tooltip.Trigger
					id="reply_tooltip"
					class={buttonVariants({ variant: "ghost", size: "icon" })}
					disabled={$creating || $editing}
					onclick={onCreateEventClick}
				>
					<Icons.CalendarPlus class="size-4" />
					<span class="sr-only">Create Event</span>
				</Tooltip.Trigger>
				<Tooltip.Content>Create Event</Tooltip.Content>
			</Tooltip.Root>
		</div>
	</div>
	<Separator />
	{#if $savingEvent}
		<p>Saving event details...</p>
	{:else if $creatingEvent}
		<p>Creating event...</p>
	{:else if $deleting}
		<p>Deleting event...</p>
	{:else if event && !$creating && !$editing && $selected}
		{#await event}
			<p>Loading event details...</p>
		{:then event}
			<div class="flex h-full flex-1 flex-col overflow-hidden">
				{#if event}
					<div class="flex items-start p-4">
						<div class="flex items-start gap-4 text-sm">
							<div class="grid gap-1">
								<div class="font-semibold">{event.title}</div>
							</div>
						</div>
						{#if event.date}
							<div class="text-muted-foreground ml-auto text-xs">
								{fullFormatter.format(new Date(event.date))}
							</div>
						{/if}
					</div>
					<Separator />
					<div class="flex-1 overflow-y-auto whitespace-pre-wrap p-4 text-sm">
						{event.description}
					</div>
				{:else}
					<div class="text-muted-foreground p-8 text-center">No Event selected</div>
				{/if}
			</div>
		{:catch error}
			<div class="text-muted-foreground p-8 text-center">Event not found</div>
		{/await}
	{:else if $creating && !$editing}
		<form method="POST" action="?/create" use:enhance={submitCreateEvent}>
			<div class="p-4">
				<label for="title">Title</label>
				<Input type="text" id="title" name="title" required />
			</div>
			<div class="p-4">
				<Textarea id="description" name="description" placeholder="Description" required />
			</div>
			<div class="p-4">
				<label for="date">Date</label>
				<Input type="datetime-local" id="date" name="date" required />
			</div>
			<Separator class="mt-auto" />
			<div class="p-4">
				<div class="grid gap-4">
					<div class="flex items-center">
						<Button variant="secondary" size="sm" class="ml-auto" on:click={() => onCancelEventCreate()}>Cancel</Button>
						<Button size="sm" class="ml-4" type="submit">Create</Button>
					</div>
				</div>
			</div>
		</form>
	{:else if !$creating && $editing && event}
		{#await event}
			<p>Loading event details...</p>
		{:then event}
			<form method="POST" action="?/edit" use:enhance={submitUpdateEvent}>
				<input type="text" id="id" name="id" value="{event?.id}" hidden>
				<div class="p-4">
					<label for="title">Title</label>
					<Input type="text" id="title" name="title" value="{event?.title}"  required />
				</div>
				<div class="p-4">
					<Textarea id="description" name="description" placeholder="Description" value={event?.description} required />
				</div>
				<div class="p-4">
					<label for="date">Date</label>
					<Input type="datetime-local" id="date" name="date" value="{event?.date}" required />
				</div>
				<Separator class="mt-auto" />
				<div class="p-4">
					<div class="grid gap-4">
						<div class="flex items-center">
							<Button variant="secondary" size="sm" class="ml-auto" on:click={() => onCancelEventEdit()}>Cancel</Button>
							<Button size="sm" class="ml-4" type="submit">Save</Button>
						</div>
					</div>
				</div>
			</form>
		{:catch error}
			<div class="text-muted-foreground p-8 text-center">Event not found</div>
		{/await}
	{:else}
		<div class="text-muted-foreground p-8 text-center">No Event selected</div>
	{/if}
</div>