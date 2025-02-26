<script lang="ts">
	import { DateFormatter, LoadingSpinner } from "$lib"
	import type { Event } from "$lib/server/remote-events";
	import * as Icons from "$lib/icons";
	import { Button, buttonVariants } from "$lib/ui/button/index";
	import { Separator } from "$lib/ui/separator/index";
	import { Textarea } from "$lib/ui/textarea/index";
	import { Input } from "$lib/ui/input/index";
	import * as Tooltip from "$lib/ui/tooltip/index";
	import { creating, deletingEvent, editing, creatingEvent, updatingEvent, selectedEventId } from "$lib/components/store";
	import { enhance } from "$app/forms";
	import { type SubmitFunction } from "@sveltejs/kit";
	import { toast } from "svelte-sonner";

	export let event: Promise<Event | null> | null;
	export let onCreateEventClick: () => void;
	export let onEditEventClick: () => void;
	export let onCancelEventCreate: () => void;
	export let onCancelEventEdit: () => void;
	export let onEventUpdated: (id: number) => void;

	const fullFormatter = new DateFormatter("en-US", {
		dateStyle: "medium",
		timeStyle: "medium",
	});

	const submitCreateEvent: SubmitFunction = ({ formData, cancel }) => {
		$creating = false;
        $creatingEvent = true;

        const { title, description, date } = Object.fromEntries(formData);
        const inputDate = new Date(date.toString());
        const now = new Date();

		if (!title) {
			cancel();
			$creating = true;
            $creatingEvent = false;
			let dateElement = document.getElementById('title');
			if (dateElement && !dateElement.classList.contains('has-error')) {
				dateElement.classList.add('has-error');
			}
			toast.error("Event cannot be created", {
				description: "title field is required"
			});
		} else if (!description) {
			cancel();
			$creating = true;
            $creatingEvent = false;
			let dateElement = document.getElementById('description');
			if (dateElement && !dateElement.classList.contains('has-error')) {
				dateElement.classList.add('has-error');
			}
			toast.error("Event cannot be created", {
				description: "description field is required"
			});
		} else if (isNaN(inputDate.getTime())) {
            cancel();
			$creating = true;
            $creatingEvent = false;
			let dateElement = document.getElementById('date');
			if (dateElement && !dateElement.classList.contains('has-error')) {
				dateElement.classList.add('has-error');
			}
			toast.error("Event cannot be created", {
				description: "date field is required"
			});
        } else if (inputDate < now) {
			cancel();
			$creating = true;
            $creatingEvent = false;
			let dateElement = document.getElementById('date');
			if (dateElement && !dateElement.classList.contains('has-error')) {
				dateElement.classList.add('has-error');
			}
			toast.error("Event cannot be created", {
				description: "event date cannot be in the past"
			});
		}

        return async ({ result, update }) => {
			if (result.type === 'error') {
				$creating = true;
				$creatingEvent = false;
				toast.error("Event could not be created", {
					description: "an error occurred while creating the event"
				});
			} else if (result.type === 'failure') {
				$creating = true;
				$creatingEvent = false;
				toast.error("Event could not be created", {
					description: result.data?.description
				});
			} else {
				await update().then(() => {
					$creatingEvent = false;
					toast.success(`Event "${title}" created`);
				});
			};
		};
    }

	const submitUpdateEvent: SubmitFunction = ({ formData, cancel }) => {
		$editing = false;
        $updatingEvent = true;
		const { title, description, date, id } = Object.fromEntries(formData);
		const eventId = id ? parseInt(id.toString(), 10) : undefined;
        const inputDate = new Date(date.toString());
        const now = new Date();

		if (!title) {
			cancel();
			$editing = true;
            $updatingEvent = false;
			let dateElement = document.getElementById('title');
			if (dateElement && !dateElement.classList.contains('has-error')) {
				dateElement.classList.add('has-error');
			}
			toast.error("Event cannot be updated", {
				description: "title field is required"
			});
		} else if (!description) {
			cancel();
			$editing = true;
            $updatingEvent = false;
			let dateElement = document.getElementById('description');
			if (dateElement && !dateElement.classList.contains('has-error')) {
				dateElement.classList.add('has-error');
			}
			toast.error("Event cannot be updated", {
				description: "description field is required"
			});
		} else if (isNaN(inputDate.getTime())) {
            cancel();
			$editing = true;
            $updatingEvent = false;
			let dateElement = document.getElementById('date');
			if (dateElement && !dateElement.classList.contains('has-error')) {
				dateElement.classList.add('has-error');
			}
			toast.error("Event cannot be updated", {
				description: "date field is required"
			});
        } else if (inputDate < now) {
			cancel();
			$editing = true;
            $updatingEvent = false;
			let dateElement = document.getElementById('date');
			if (dateElement && !dateElement.classList.contains('has-error')) {
				dateElement.classList.add('has-error');
			}
			toast.error("Event cannot be updated", {
				description: "event date cannot be in the past"
			});
		}

        return async ({ result, update }) => {
			if (result.type === 'error' || !eventId) {
				$editing = true;
				$updatingEvent = false;
				toast.error("Event could not be updated", {
					description: "an error occurred while updating the event"
				});
			} else if (result.type === 'failure') {
				$editing = true;
				$updatingEvent = false;
				toast.error("Event could not be updated", {
					description: result.data?.description
				});
			} else {
				await update().then(() => {
					onEventUpdated(eventId);
					$updatingEvent = false;
					toast.success(`Event "${title}" updated`);
				});
			}
        };
	}

	const submitDeleteEvent: SubmitFunction = () => {
		$editing = false;
		$creating = false;
		$deletingEvent = true;
		$selectedEventId = null;

        return async ({ result, update }) => {
			if (result.type === 'error') {
				$deletingEvent = false;
				toast.error("Event could not be deleted", {
					description: "an error occurred while deleting the event"
				});
			} else {
				await update().then(() => {
					$deletingEvent = false;
				});
			}
        };
    }

	function clearValidationErrors(elementId: string) {
		let element = document.getElementById(elementId);
		if (element && element.classList.contains('has-error')) {
			element.classList.remove('has-error');
		}
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
				<input type="text" id="id" name="id" value="{$selectedEventId}" hidden>
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
	{#if $updatingEvent}
		<LoadingSpinner>
			<span slot="loading-text">
				saving event...
			</span>
		</LoadingSpinner>
	{:else if $creatingEvent}
		<LoadingSpinner>
			<span slot="loading-text">
				creating event...
			</span>
		</LoadingSpinner>
	{:else if $deletingEvent}
		<LoadingSpinner>
			<span slot="loading-text">
				deleting event...
			</span>
		</LoadingSpinner>
	{:else if event && !$creating && !$editing && $selectedEventId}
		{#await event}
			<LoadingSpinner>
				<span slot="loading-text">
					loading event...
				</span>
			</LoadingSpinner>
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
				<Input type="text" id="title" name="title"
					on:change={() => clearValidationErrors('title')} />
			</div>
			<div class="p-4">
				<Textarea id="description" name="description" placeholder="Description"
					on:change={() => clearValidationErrors('description')} />
			</div>
			<div class="p-4">
				<label for="date">Date</label>
				<Input type="datetime-local" id="date" name="date"
					on:change={() => clearValidationErrors('date')} />
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
			<LoadingSpinner>
				<span slot="loading-text">
					loading event...
				</span>
			</LoadingSpinner>
		{:then event}
			<form method="POST" action="?/edit" use:enhance={submitUpdateEvent}>
				<input type="text" id="id" name="id" value="{event?.id}" hidden>
				<div class="p-4">
					<label for="title">Title</label>
					<Input type="text" id="title" name="title" value="{event?.title}"
						on:change={() => clearValidationErrors('title')} />
				</div>
				<div class="p-4">
					<Textarea id="description" name="description" placeholder="Description" value={event?.description}
						on:change={() => clearValidationErrors('description')} />
				</div>
				<div class="p-4">
					<label for="date">Date</label>
					<Input type="datetime-local" id="date" name="date" value="{event?.date}"
						on:change={() => clearValidationErrors('date')} />
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