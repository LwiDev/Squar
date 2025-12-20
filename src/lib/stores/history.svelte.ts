import type { Block } from '$lib/types/models';

export class HistoryManager {
	private history: Block[][] = $state([]);
	private currentIndex = $state(0);

	canUndo = $derived(this.currentIndex > 0);
	canRedo = $derived(this.currentIndex < this.history.length - 1);

	constructor(initialState: Block[]) {
		this.history = [JSON.parse(JSON.stringify(initialState))];
		this.currentIndex = 0;
	}

	push(blocks: Block[]) {
		// Remove any future states if we're not at the end
		this.history = this.history.slice(0, this.currentIndex + 1);

		// Add new state
		this.history.push(JSON.parse(JSON.stringify(blocks)));
		this.currentIndex++;

		// Limit history to 50 states
		if (this.history.length > 50) {
			this.history.shift();
			this.currentIndex--;
		}
	}

	undo(): Block[] | null {
		if (!this.canUndo) return null;
		this.currentIndex--;
		return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
	}

	redo(): Block[] | null {
		if (!this.canRedo) return null;
		this.currentIndex++;
		return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
	}

	reset(blocks: Block[]) {
		this.history = [JSON.parse(JSON.stringify(blocks))];
		this.currentIndex = 0;
	}
}
