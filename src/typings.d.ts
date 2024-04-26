export class SnakeEngine {
	run(): void;
}

export type NodeDirections = 'upper' | 'lower' | 'prev' | 'next';
export type ArenaNodePosition = [number, number];

export interface ArenaNode<T> {
	data: T;
	prev: ArenaNode<T> | null;
	next: ArenaNode<T> | null;
	upper: ArenaNode<T> | null;
	lower: ArenaNode<T> | null;
	isFood(): boolean;
	isSnake(): boolean;
	connectVerticallyWith(node: ArenaNode<T>): ArenaNode<T>;
	connectHorizontallyWith(node: ArenaNode<T>): ArenaNode<T>;
	writeAtPosition(position: ArenaNodePosition, data: T): ArenaNode<T>;
	column(startNode?: ArenaNode<T>): {
		goToTheEnd(): ArenaNode<T>;
		goToPosition(position: number): ArenaNode<T>;
	};
	row(startNode?: ArenaNode<T>): {
		goToTheEnd(): ArenaNode<T>;
		goToPosition(position: number): ArenaNode<T>;
	};
}
