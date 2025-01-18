# Snake Game Engine

A flexible and customizable Snake game engine written in TypeScript. This engine provides core game mechanics while allowing you to implement your own rendering logic.

## Installation

```bash
pnpm add snake-game-engine
```

## Features

- Flexible rendering system - bring your own renderer
- TypeScript support out of the box

## Basic Usage

```typescript
import { Snake } from "snake-game-engine";

// Define game configuration
const gameConfig = {
  width: 20, // Grid width
  height: 20, // Grid height
  tickRate: 10, // Updates per second
  continuousSpace: false, // If true, snake wraps around edges
};

// Define how to render snake and food
const renderConfig = {
  cellSize: 20,
  snakeRenderer: (position) => {
    // Return your rendered snake segment
    // Example: return a DOM element, canvas context operation, etc.
  },
  foodRenderer: (position) => {
    // Return your rendered food
  },
  clearRenderer: (element) => {
    // Clean up rendered element
  },
};

// Create game instance
const game = new Snake(gameConfig, renderConfig, () =>
  console.log("Game Over!")
);

// Start the game
game.start();

// Listen for keyboard input
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowUp":
      game.setDirection({ x: 0, y: -1 });
      break;
    case "ArrowDown":
      game.setDirection({ x: 0, y: 1 });
      break;
    case "ArrowLeft":
      game.setDirection({ x: -1, y: 0 });
      break;
    case "ArrowRight":
      game.setDirection({ x: 1, y: 0 });
      break;
  }
});
```

## API Reference

### Snake Class

#### Constructor

```typescript
constructor(
  config: GameConfig,
  renderConfig: RenderConfig<T>,
  onGameOver: () => void
)
```

#### Methods

- `start()`: Starts the game loop
- `stop()`: Stops the game loop
- `setDirection(direction: Vector2D)`: Sets the snake's direction

### Types

```typescript
interface GameConfig {
  width: number;
  height: number;
  tickRate: number;
  continuousSpace: boolean;
}

interface RenderConfig<T> {
  cellSize: number;
  snakeRenderer: (position: Vector2D) => T;
  foodRenderer: (position: Vector2D) => T;
  clearRenderer: (element?: T) => void;
}

interface Vector2D {
  x: number;
  y: number;
}
```

## License

ISC
