import { Character, GameEntity, UIComponent } from "./gameObject";
import { GameState } from "./gamestate";
import { Item } from "./item";
import { LookModeCursor } from "./lookModeCursor";
import { Position, TextDrawable } from "./renderer";

export class DescriptorPanel extends UIComponent {
  lookModeCursor: LookModeCursor
  gameState: GameState

  constructor(layerIdx: number, lookModeCursor: LookModeCursor) {
    super();
    this.layer.index = layerIdx;
    this.title = "Description";
    this.showBorder = true;
    this.lookModeCursor = lookModeCursor;
  }

  refreshVisuals(): void {
    let gameDescription: { tileDescription: string, entities: GameEntity[] };
    if (this.lookModeCursor.active) {
      const pos = this.lookModeCursor.currentPosition();
      gameDescription = this.gameState.getDescription(pos.x, pos.y);
    } else {
      gameDescription = this.gameState.getDescription(this.gameState.player.position.x, this.gameState.player.position.y);
    }
    let dialog = [
      (gameDescription.tileDescription) ? gameDescription.tileDescription : "Unknown"
    ];
    for (const entity of gameDescription.entities) {
      if (entity instanceof Character) {
        dialog.push("", entity.name);
        const percentHealth = entity.health / entity.maxHealth;
        if (percentHealth > 0.9) {
          dialog.push(entity.name + " is healthy!")
        } else if (percentHealth > 0.2) {
          dialog.push(entity.name + " is hurt.")
        } else {
          dialog.push(entity.name + " is critically injured!")
        }
      } else if (entity instanceof Item) {
        dialog.push("", entity.name);
      }
    }

    this.layer.addDrawable(new TextDrawable(1, 1, dialog.join("\n"), this.boundaries.getWidth() - 2));
    super.refreshVisuals();
  }
}
