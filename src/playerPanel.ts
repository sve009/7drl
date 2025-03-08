import { RNG } from "rot-js";
import { UIComponent } from "./gameObject"
import { Player } from "./player";
import { TextDrawable } from "./renderer"
import { GameState } from "./gamestate";

export class PlayerPanel extends UIComponent {
  player: Player
  gameState: GameState

  constructor (layerIdx: number) {
    super();
    this.layer.index = layerIdx;

    this.title = "Player";
    this.showBorder = true;
  }

  refreshVisuals () {
    super.refreshVisuals();
    let playerStats =
    `Health: ${this.player.health}/${this.player.maxHealth}\n` +
    `Gold: ${this.player.gold}\n` + 
    `Turn: ${this.gameState.turn}\n` +
    `Position: [${this.player.position.x}, ${this.player.position.y}]\n` +
    `Dungeon Level: ${this.player.dungeonLevel}\n` +
    `Seed: ${RNG.getSeed()}`;
    if (!this.player.dungeonLevel) {
      playerStats =
      `Health: ${this.player.health}/${this.player.maxHealth}\n` +
      `Gold: ${this.player.gold}\n` + 
      `Turn: ${this.gameState.turn}\n` +
      `Position: [${this.player.position.x}, ${this.player.position.y}]\n` +
      `Ground Level` +
      `Seed: ${RNG.getSeed()}`;  
    }

    this.layer.addDrawable(new TextDrawable(1, 1, playerStats, this.boundaries.getWidth() - 2));
  }
}
