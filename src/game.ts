import { GameState, GameMap } from "./gamestate";
import { MapGenerator } from "./mapgen";
import { Player } from "./player";
import { getRenderer, Position, Renderer } from "./renderer";
import { Enemy } from "./enemies";
import { getUIManager, UIManager } from "./uiManager";

export class Game {
  state: GameState;
  uiManager: UIManager;
  renderer: Renderer;

  constructor() {
    this.state = new GameState(new Position(0, 0, 80, 40));
    this.renderer = getRenderer();
    this.uiManager = getUIManager();
    this.renderer.addPermanentLayer(this.state.terrainLayer);
    this.renderer.addPermanentLayer(this.state.entityLayer);
  }

  run() {
    this.state.running = true;
    //this.generator.generateLevel();
    const firstMap = new GameMap(this.state.boundaries);
    firstMap.loadTown();
    this.state.maps.push(firstMap);

    let { x, y } = firstMap.openSpot();

    this.state.player = new Player(x, y);
    this.state.entities.push(this.state.player);
    this.uiManager.playerPanel.player = this.state.player;

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
