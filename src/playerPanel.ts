import { RNG } from "rot-js";
import { UIComponent } from "./gameObject"
import { Player } from "./player";
import { Position, TextDrawable } from "./renderer"

export class PlayerPanel extends UIComponent {
  player: Player

  constructor (boundary: Position, layerIdx: number) {
    super(boundary, layerIdx);
    this.layer.bg = "#000";

    this.title = "Player";
    this.showBorder = true;
  }

  refreshVisuals () {
    super.refreshVisuals();
    let playerStats =
    `Health: ${this.player.health}/${this.player.maxHealth}\n` +
    `Distance Traveled: ${this.player.distanceTraveled}\n` +
    `Position: [${this.player.position.x}, ${this.player.position.y}]\n` +
    `Level: ${this.player.dungeonLevel}\n` +
    `Seed: ${RNG.getSeed()}`;

    playerStats = ` %b{${this.layer.bg}}${playerStats}`;

    this.layer.addDrawable(new TextDrawable(1, 1, playerStats, this.boundaries.getWidth() - 2));
  }

  private getHealth(): string {
    return `Health: ${this.player.health}/${this.player.maxHealth}`;
  }

  private distTraveled () {

  }
}
