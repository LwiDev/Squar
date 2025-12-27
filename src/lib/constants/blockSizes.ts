// Block size presets - centralized configuration
export const BLOCK_SIZES = {
	// Normal block sizes
	square: { w: 1, h: 2, label: 'Carré' },
	rectangle: { w: 2, h: 1, label: 'Rectangle' },
	rectangleWide: { w: 2, h: 2, label: 'Rectangle allongé' },
	tall: { w: 1, h: 4, label: 'Sur le long' },
	large: { w: 2, h: 4, label: 'Gros carré' },

	// Heading sizes
	headingMid: { w: 2, h: 1, label: 'Middle' },
	headingFull: { w: 4, h: 1, label: 'Full' }
} as const;

// Default sizes for each block type
export const DEFAULT_BLOCK_SIZE = {
	heading: BLOCK_SIZES.headingFull,
	text: BLOCK_SIZES.rectangleWide,
	video: BLOCK_SIZES.rectangleWide,
	image: BLOCK_SIZES.square,
	link: BLOCK_SIZES.square
} as const;

// Grid configuration
export const GRID_CONFIG = {
	cols: 4,
	cellWidth: 174, // px
	cellHeight: 87, // px
	gap: 24 // px
} as const;

// Available sizes for each block type
export const AVAILABLE_SIZES = {
	heading: [BLOCK_SIZES.headingMid, BLOCK_SIZES.headingFull],
	normal: [
		BLOCK_SIZES.square,
		BLOCK_SIZES.rectangle,
		BLOCK_SIZES.rectangleWide,
		BLOCK_SIZES.tall,
		BLOCK_SIZES.large
	]
} as const;
