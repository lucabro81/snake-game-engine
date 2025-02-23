export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly tickRate: number;
  private isRunning: boolean = false;
  private nextTickCallbacks: (() => void)[] = [];

  constructor(tickRate: number, private update: () => void) {
    this.tickRate = 1000 / tickRate;
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    requestAnimationFrame((time) => this.loop(time));
  }

  stop() {
    this.isRunning = false;
  }

  nextTick(): Promise<void> {
    return new Promise(resolve => {
      this.nextTickCallbacks.push(resolve);
    });
  }

  private loop(currentTime: number) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.accumulator += deltaTime;
    this.lastTime = currentTime;

    while (this.accumulator >= this.tickRate) {
      this.update();
      this.accumulator -= this.tickRate;

      // Execute and clear nextTick callbacks
      this.nextTickCallbacks.forEach(cb => cb());
      this.nextTickCallbacks = [];
    }

    requestAnimationFrame((time) => this.loop(time));
  }
}