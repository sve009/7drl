import { descriptionCatalogue } from "./descriptionCatalogue";
import { Enemy } from "./enemies";
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
    let gameDescription: { tileID: string, entities: GameEntity[] };
    const dialog = Array<string>();
    if (this.lookModeCursor.active) {
      const pos = this.lookModeCursor.currentPosition();
      dialog.push(`Look Mode: [${pos.x}, ${pos.y}]`);
      gameDescription = this.gameState.getDescription(pos.x, pos.y);
    } else {
      dialog.push("Player Mode:");
      gameDescription = this.gameState.getDescription(this.gameState.player.position.x, this.gameState.player.position.y);
    }
    dialog.push((gameDescription.tileID) 
      ? descriptionCatalogue(gameDescription.tileID)
      : "Unexplored");
    for (const entity of gameDescription.entities) {
      if (entity instanceof Character) {
        dialog.push("", entity.name);
        if (entity instanceof Enemy && !("passive" in entity.enemyType.ai)) {
          const percentHealth = entity.health / entity.maxHealth;
          if (percentHealth > 0.9) {
            dialog.push(entity.name + " is healthy!")
          } else if (percentHealth > 0.2) {
            dialog.push(entity.name + " is hurt.")
          } else {
            dialog.push(entity.name + " is critically injured!")
          }  
        }
      } else if (entity instanceof Item) {
        dialog.push("", entity.name);
      }
    }

    this.layer.addDrawable(new TextDrawable(1, 1, dialog.join("\n"), this.boundaries.getWidth() - 2));
    super.refreshVisuals();
  }
}
