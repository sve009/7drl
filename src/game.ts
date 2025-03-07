import { getUIManager } from "./uiManager";
import { GameState, GameMap } from "./gamestate";
import { Player } from "./player";
import { getRenderer, Position } from "./renderer";

export class Game {
  state: GameState;

  constructor () {
    const uiManager = getUIManager();
    uiManager.game = this;
    uiManager.createStartScreen();
  }

  run() {
    this.createNewGameSession();
    this.startGameSession();
  }

  createNewGameSession (): void {
    this.state = new GameState(new Position(0, 0, 80, 40));
    this.state.running = true;

    const firstMap = new GameMap(this.state.boundaries);
    firstMap.loadTown();
    this.state.maps.push(firstMap);
    
    let { x, y } = firstMap.openSpot();
    
    this.state.player = new Player(x, y);
    this.state.entities.push(this.state.player);
    getUIManager().addGameState(this.state);
  }

  startGameSession (): void {
    this.state.sightMap.update(this.state.player);
    this.state.refreshVisual();
    getUIManager().refreshVisual();
    getRenderer().draw();

    this.gameLoop();
  }


  refreshVisuals () {
    const uiManager = getUIManager();
    // Update the text/glyphs and add to layers
    if (!uiManager.focused || this.state.fullRefreshVisual) {
      this.state.refreshVisual();
      this.state.fullRefreshVisual = false;
    }
    uiManager.refreshVisual();
  }

  async updateObjects () {
    const uiManager = getUIManager();
    if (uiManager.focused) {
      await uiManager.updateContent();
    } else {
      await this.state.update();
    }
  }

  async gameLoop() {
    while (this.state.running) {
      // Update the GameState and the UIManager
      await this.updateObjects();

      // Create buffers
      this.refreshVisuals();

      // Draw everything
      getRenderer().draw();

      // Pause
      await new Promise((resolve, reject) => {
        setTimeout(resolve, 50);
      });

    }

    this.finishGame();
  }

  finishGame() {}
}

export function getGameName (): string {
  return "Leibowitz's Canticle";
}
