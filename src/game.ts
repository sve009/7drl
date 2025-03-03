import { GameState } from "./gamestate";
import { MapGenerator } from "./mapgen";
import { Player } from "./player";
import { getRenderer, Position, Renderer } from "./renderer";
import { Enemy } from "./enemies";
import { getUIManager, UIManager } from "./uiManager";

export class Game {
  state: GameState;
  uiManager: UIManager;
  renderer: Renderer;
  generator: MapGenerator;

  constructor() {
    this.state = new GameState(new Position(0, 0, 80, 40));
    this.renderer = getRenderer();
    this.uiManager = getUIManager();
    this.renderer.addPermanentLayer(this.state.map.layer);
    this.renderer.addPermanentLayer(this.state.entityLayer);
    this.generator = new MapGenerator(80, 40, this.state.map);
  }

  run() {
    this.state.running = true;
    //this.generator.generateLevel();
    this.state.map.loadTown();
    let { x, y } = this.state.map.openSpot();

    this.state.player = new Player(x, y);
    this.state.entities.push(this.state.player);
    this.uiManager.playerPanel.player = this.state.player;

    for (let i = 0; i < 1; i++) {
      const { x, y } = this.state.map.openSpot();
      const bat = new Enemy("bat", x, y);
      this.state.entities.push(bat);
    }
    
    for (let i = 0; i < 3; i++) {
      const { x, y } = this.state.map.openSpot();
      const goblin = new Enemy("goblin", x, y);
      this.state.entities.push(goblin);
    }

    this.state.sightMap.update(this.state.player);
    this.state.refreshVisual();
    this.state.map.refreshVisual(this.state.sightMap);
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
