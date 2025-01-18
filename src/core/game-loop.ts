export class GameLoop {
  private lastTime: number = 0;
  private accumulator: number = 0;
  private readonly tickRate: number;
  private isRunning: boolean = false;

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

  private loop(currentTime: number) {
    if (!this.isRunning) return;

    const deltaTime = currentTime - this.lastTime;
    this.accumulator += deltaTime;
    this.lastTime = currentTime;

    while (this.accumulator >= this.tickRate) {
      this.update();
      this.accumulator -= this.tickRate;
    }

    requestAnimationFrame((time) => this.loop(time));
  }
}