import { UIComponent } from "./gameObject"
import { Player } from "./player";
import { Position, TextDrawable } from "./renderer"

export class PlayerPanel extends UIComponent{
  player: Player

  refreshVisuals () {
    super.refreshVisuals();
    let playerStats =
    `Player Statistics:\n` +
    `Health: ${this.player.health}/${this.player.maxHealth}\n` +
    `Distance Traveled: ${this.player.distanceTraveled}\n` +
    `Position: [${this.player.position.x}, ${this.player.position.y}]\n` +
    `Level: ${this.player.dungeonLevel}\n`;

    playerStats = ` %b{${this.layer.bg}}${playerStats}`;

    this.layer.addDrawable(new TextDrawable(this.boundaries.getStartX(), this.boundaries.getStartY(), playerStats));
  }
  
  constructor (boundary: Position) {
    super(boundary);
    this.layer.bg = "#9c2f6c";
  }
}