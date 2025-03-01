import { Display } from "rot-js";
import { GameState } from "./gamestate";
import { generateLevel } from "./mapgen";
import { Player } from "./player";
import { Bat } from "./enemies";

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
    let { x, y } = this.state.map.openSpot();

    this.state.player = new Player(x, y);
    this.state.entities.push(this.state.player);

    for (let i = 0; i < 3; i++) {
      const { x, y } = this.state.map.openSpot();
      const bat = new Bat(x, y);
      this.state.entities.push(bat);
    }

    this.gameLoop();

    this.state.map.draw(this.display, this.state.sightMap);
  }

  async gameLoop() {
    while (this.state.running) {
      // Update FOV
      this.state.sightMap.update(this.state.player);

      // Update entities
      for (let entity of this.state.entities) {
        let action = await entity.update(this.state);
        action.run();
      }

      // Draw map
      this.state.map.draw(this.display, this.state.sightMap);
      
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
