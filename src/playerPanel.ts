import { SightMap } from "./fov"
import { UIComponent } from "./gameObject"
import { Player } from "./player";
import { TextDrawable } from "./renderer"

export class PlayerPanel extends UIComponent{
    player: Player
    refreshVisuals () {
        const playerStats =
        `Player Statistics:\n` +
        `Health: ${this.player.health}/${this.player.maxHealth}\n` +
        `Distance Traveled: ${this.player.distanceTraveled}\n` +
        `Items Equipped:`;
        
        this.layer.addDrawable(new TextDrawable(this.boundaries.getStartX(), this.boundaries.getStartY(), playerStats));
    }

    updateContent(): void {
    }
}