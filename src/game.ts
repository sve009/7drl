import { GameState, GameMap } from "./gamestate";
import { Player } from "./player";
import { getRenderer, Position, Renderer } from "./renderer";
import { getUIManager, UIManager } from "./uiManager";

export class Game {
  state: GameState;
  uiManager: UIManager;
  renderer: Renderer;

  constructor() {
    this.state = new GameState(new Position(0, 0, 80, 40));
    this.renderer = getRenderer();
    this.uiManager = getUIManager();
    this.uiManager.addGameState(this.state);
  }

  run() {
    this.state.running = true;

    const firstMap = new GameMap(this.state.boundaries);
    firstMap.loadTown();
    this.state.maps.push(firstMap);

    let { x, y } = firstMap.openSpot();

    this.state.player = new Player(x, y);
    this.state.entities.push(this.state.player);
    this.uiManager.playerPanel.player = this.state.player;
    this.uiManager.inventoryPanel.items = this.state.player.items;

    this.state.sightMap.update(this.state.player);
    this.state.refreshVisual();
    this.uiManager.refreshVisual();
    this.renderer.draw();

    this.gameLoop();

    this.renderer.draw();
  }

  refreshVisuals () {
      // Update the text/glyphs and add to layers
      if (!this.uiManager.focused || this.state.fullRefreshVisual) {
        this.state.refreshVisual();
        this.state.fullRefreshVisual = false;
      }
      this.uiManager.refreshVisual();
  }

  async updateObjects () {
    if (this.uiManager.focused) {
      await this.uiManager.updateContent();
    } else {
      await this.state.update();
    }
  }

  async gameLoop() {
    while (this.state.running) {
      // Update the GameState and the UIManager
      await this.updateObjects();

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
