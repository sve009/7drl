import { Buff } from "./buff";
import { UIComponent } from "./gameObject";
import { TextDrawable } from "./renderer";

export class BuffsPanel extends UIComponent {
  buffs: Buff[]

  constructor (layerIdx: number) {
    super();
    this.layer.index = layerIdx;
    this.layer.bg
    this.title = "Stati";
    this.showBorder = true;
  }

  refreshVisuals(): void {
    const txt = this.buffs.map((buff: Buff): string => `${buff.name}: ${buff.turnsRemaining} turns`).join("\n");
    this.layer.addDrawable(new TextDrawable(1,1, txt, this.boundaries.getWidth() - 2));
    super.refreshVisuals();
  }
}