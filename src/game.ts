import { Display } from "rot-js";
import { GameState } from "./gamestate";
import { generateLevel } from "./mapgen";

export class Game {
  display: Display;
  state: GameState;

  constructor(display: Display) {
    this.display = display;
    this.state = new GameState();
  }

  run() {
    this.state.running = true;
    generateLevel(this.state.map);
    this.gameLoop();
  }

  async gameLoop() {
    while (this.state.running) {
      // Update entities
      for (let entity of this.state.entities) {
        entity.update();
      }

      // Draw map
      this.state.map.draw(this.display);
      
      // Draw entitites
      for (let entity of this.state.entities) {
        entity.draw(this.display);
      }

      // Pause
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 100);
      });
    }

    this.finishGame();
  }

  finishGame() {}
}
