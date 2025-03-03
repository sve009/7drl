import { GameState, GameMap } from "./gamestate";
import { MapGenerator } from "./mapgen";
import { Player } from "./player";
import { Renderer } from "./renderer";
import { Enemy } from "./enemies";
import { getUIManager, UIManager } from "./ui";

export class Game {
  state: GameState;
  uiManager: UIManager;
  renderer: Renderer;

  constructor() {
    this.state = new GameState();
    this.renderer = new Renderer;
    this.uiManager = getUIManager();
    this.renderer.addPermanentLayer(this.state.terrainLayer);
    this.renderer.addPermanentLayer(this.state.entityLayer);
  }

  run() {
    this.state.running = true;
    //this.generator.generateLevel();
    const firstMap = new GameMap(80, 40);
    firstMap.loadTown();
    this.state.maps.push(firstMap);

    let { x, y } = firstMap.openSpot();

    this.state.player = new Player(x, y);
    this.state.entities.push(this.state.player);

    for (let i = 0; i < 1; i++) {
      const { x, y } = firstMap.openSpot();
      const bat = new Enemy("bat", x, y, 0);
      this.state.entities.push(bat);
    }
    
    for (let i = 0; i < 3; i++) {
      const { x, y } = firstMap.openSpot();
      const goblin = new Enemy("goblin", x, y, 0);
      this.state.entities.push(goblin);
    }

    this.state.sightMap.update(this.state.player);
    this.state.refreshVisual();
    this.uiManager.refreshVisual();
    this.renderer.draw();

    this.gameLoop();

    this.renderer.draw();
  }

  refreshVisuals() {
      // Update the text/glyphs and add to layers
      this.state.refreshVisual();
      this.uiManager.refreshVisual();

      // Get any temporary layers
      this.uiManager.getUILayers().forEach((layer) => this.renderer.addTemporaryLayer(layer));

  }

  async gameLoop() {
    while (this.state.running) {
      // Update the GameState and the UIManager
      await this.state.update();
      await this.uiManager.updateContent();

      this.refreshVisuals();

      // Draw everything
      this.renderer.draw();

      // Pause
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 50);
      });

    }

    this.finishGame();
  }

  finishGame() {}
}
