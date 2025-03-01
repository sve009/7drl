import { Display } from "rot-js";
import { GameState } from "./gamestate";
import { generateLevel } from "./mapgen";
import { Player } from "./player";

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
    this.state.entities.push(new Player(5, 5));
    this.gameLoop();

    this.state.map.draw(this.display);
  }

  async gameLoop() {
    while (this.state.running) {
      // Update entities
      for (let entity of this.state.entities) {
        let action = await entity.update();
        action.run();
      }

      // Draw map
      this.state.map.draw(this.display);
      
      // Draw entitites
      for (let entity of this.state.entities) {
        entity.draw(this.display);
      }

      console.log('loop complete');

      // Pause
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 100);
      });
    }

    this.finishGame();
  }

  finishGame() {}
}
