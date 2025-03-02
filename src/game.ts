import { Display } from "rot-js";
import { GameState } from "./gamestate";
import { MapGenerator } from "./mapgen";
import { Player } from "./player";
import { Renderer } from "./renderer";
import { Bat } from "./enemies";
import { UIManager } from "./ui";
import { Dialog } from "./dialog";

export class Game {
  state: GameState;
  uiManager: UIManager;
  renderer: Renderer;
  generator: MapGenerator;

  constructor(display: Display) {
    this.state = new GameState();
    this.renderer = new Renderer(display);
    this.uiManager = new UIManager;
    this.renderer.addPermanentLayer(this.state.map.layer);
    this.renderer.addPermanentLayer(this.state.entityLayer);
    this.generator = new MapGenerator(80, 40, this.state.map);
  }

  run() {
    this.state.running = true;
    this.generator.generateLevel();
    let { x, y } = this.state.map.openSpot();

    this.state.player = new Player(x, y);
    this.state.entities.push(this.state.player);

    for (let i = 0; i < 3; i++) {
      const { x, y } = this.state.map.openSpot();
      const bat = new Bat(x, y);
      this.state.entities.push(bat);
    }

    this.gameLoop();

    this.renderer.draw();
  }

  async gameLoop() {
    this.state.updateColor();
    this.uiManager.updateColor();
    this.renderer.draw();

    while (this.state.running) {
      // Update the GameState and the UIManager
      await this.state.update();
      await this.uiManager.update();
      this.uiManager.uiObjects.push(new Dialog(12));

      // Update the text/glyphs and add to layers
      this.state.updateColor();
      this.uiManager.updateColor();

      // Get any temporary layers
      this.uiManager.getUILayers().forEach((layer) => this.renderer.addTemporaryLayer(layer));

      // Draw everything
      this.renderer.draw();

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
