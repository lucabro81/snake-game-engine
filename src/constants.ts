export const ARENA_WIDTH = 50;
export const ARENA_HEIGHT = 30;
export const FOOD = 'F';
export const SNAKE_BODY = '*';

export const TAIL_DIRECTION = {
	ArrowUp: 'upper',
	KeyW: 'upper',
	ArrowDown: 'lower',
	KeyS: 'lower',
	ArrowLeft: 'prev',
	KeyA: 'prev',
	ArrowRight: 'next',
	KeyD: 'next',
} as const;
