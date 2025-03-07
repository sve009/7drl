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
    const txtArr = Array<string>();
    for (const buff of this.buffs) {
      txtArr.push(buff.name);
    }
    this.layer.addDrawable(new TextDrawable(1,1, txtArr.join("\n")));
    super.refreshVisuals();
  }
}