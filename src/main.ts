import { /*ArenaNode,*/ ArenaNodePosition, NodeDirections } from './typings.d';
import { FOOD, SNAKE_BODY } from './constants';
// import { ArenaNode } from './typings';

export class SnakeEngine<NodeDataType> {
	private setup!: Setup<NodeDataType>;

	constructor() {}

	init() {
		this.setup = new Setup<NodeDataType>();
		return this.setup;
	}

	run() {
		console.log("I'm runnig!");
	}

	// private createArenaNode<ArenaNodeType>(): ArenaNode<NodeDataType> {
	// 	if (!this.setup.arenaElement) {
	// 		throw new Error('Arena element not set');
	// 	}
	// 	return {
	// 		data: this.setup.arenaElement,
	// 		prev: null,
	// 		next: null,
	// 		upper: null,
	// 		lower: null,
	// 		isFood() {
	// 			return this.data === FOOD;
	// 		},
	// 		isSnake() {
	// 			return this.data === SNAKE_BODY;
	// 		},
	// 		connectVerticallyWith(node) {
	// 			this.upper = node;
	// 			node.lower = this;
	// 			return this;
	// 		},
	// 		connectHorizontallyWith(node) {
	// 			this.next = node;
	// 			node.prev = this;
	// 			return this;
	// 		},
	// 		writeAtPosition(position, data) {
	// 			let currNode = this;
	// 			const rowElement = currNode.row().goToPosition(position[0]);
	// 			const columnElement = currNode
	// 				.column(rowElement)
	// 				.goToPosition(position[1]);
	// 			columnElement.data = data;
	// 			return columnElement;
	// 		},
	// 		column(startNode) {
	// 			const that = this;
	// 			return {
	// 				goToTheEnd() {
	// 					let currNode = that;
	// 					while (currNode.lower && currNode) {
	// 						currNode = currNode.lower;
	// 					}
	// 					return currNode;
	// 				},
	// 				goToPosition(position) {
	// 					let currNode: ArenaNode<NodeDataType> | null = that;
	// 					if (startNode) {
	// 						currNode = startNode;
	// 					}
	// 					let i = 0;
	// 					while (i < position && currNode.lower) {
	// 						currNode = currNode.lower;
	// 						i++;
	// 					}
	// 					return currNode;
	// 				},
	// 			};
	// 		},
	// 		row(startNode) {
	// 			const that = this;
	// 			return {
	// 				goToTheEnd() {
	// 					let currNode = that;
	// 					while (currNode.next) {
	// 						currNode = currNode.next;
	// 					}
	// 					return currNode;
	// 				},
	// 				goToPosition(position) {
	// 					let currNode = that;
	// 					if (startNode) {
	// 						currNode = startNode;
	// 					}
	// 					let i = 0;
	// 					while (i < position && currNode.next) {
	// 						currNode = currNode.next;
	// 						i++;
	// 					}
	// 					return currNode;
	// 				},
	// 			};
	// 		},
	// 	};
	// }
}

class Setup<NodeDataType> {
	public arenaElement!: NodeDataType;
	public snakeElement: NodeDataType | null = null;
	public foodElement: NodeDataType | null = null;

	setArenaElement(arenaElement: NodeDataType) {
		this.arenaElement = arenaElement;
		return this;
	}

	setSnakeElement(arenaElement: NodeDataType) {
		this.snakeElement = arenaElement;
		return this;
	}

	setFoodElement(arenaElement: NodeDataType) {
		this.foodElement = arenaElement;
		return this;
	}
}

class ArenaNode<NodeDataType extends never> {
	static startNode!: ArenaNode<never>;
	static finishNode!: ArenaNode<never>;

	data?: NodeDataType;
	prev?: ArenaNode<NodeDataType>;
	next?: ArenaNode<NodeDataType>;
	upper?: ArenaNode<NodeDataType>;
	lower?: ArenaNode<NodeDataType>;

	constructor(private setup: Setup<NodeDataType>) {
		this.data = this.setup.arenaElement;
	}

	getStartEndNode() {
		if (!ArenaNode.startNode) {
			const node = new ArenaNode<NodeDataType>(this.setup);
			ArenaNode.startNode = node;
		}
		return { start: ArenaNode.startNode, finishNode: ArenaNode.startNode };
	}

	isFood() {
		return this.data === FOOD;
	}

	isSnake() {
		return this.data === SNAKE_BODY;
	}

	connectVerticallyWith(node: ArenaNode<NodeDataType>) {
		this.upper = node;
		node.lower = this;
		return this;
	}

	connectHorizontallyWith(node: ArenaNode<NodeDataType>) {
		this.next = node;
		node.prev = this;
		return this;
	}

	writeAtPosition(position: ArenaNodePosition, data: NodeDataType) {
		const rowElement = this.row().goToPosition(position[0]);
		const columnElement = this.column(rowElement).goToPosition(position[1]);
		columnElement.data = data;
		return columnElement;
	}

	column(startNode?: ArenaNode<NodeDataType>) {
		return {
			goToPosition: (position: number) =>
				this.goToPosition(position, 'lower', startNode),
			goToTheEnd: () => this.goToTheEnd('lower'),
		};
	}

	row(startNode?: ArenaNode<NodeDataType>) {
		return {
			goToPosition: (position: number) =>
				this.goToPosition(position, 'next', startNode),
			goToTheEnd: () => this.goToTheEnd('lower'),
		};
	}

	private goToTheEnd(dir: NodeDirections) {
		let currNode: ArenaNode<NodeDataType> | undefined = this;
		while (currNode && currNode[dir]) {
			currNode = currNode[dir];
		}
		return currNode;
	}

	private goToPosition(
		position: number,
		dir: NodeDirections,
		startNode?: ArenaNode<NodeDataType>,
	) {
		let currNode = ArenaNode.startNode;
		if (startNode) {
			currNode = startNode;
		}
		let i = 0;
		while (i < position && currNode[dir]) {
			currNode = currNode[dir];
			i++;
		}
		return currNode;
	}
}
