import { GameEvent } from "./gameEvent";
import { UIComponent } from "./gameObject";
import { IOHandler } from "./io";
import { Position, TextDrawable } from "./renderer";
import * as UIGameEvents from "./uiGameEvent";

export class CreditsPanel extends UIComponent{
  ioHandler: IOHandler = new IOHandler;

  constructor (boundaries: Position, layerIdx: number) {
    super(boundaries, layerIdx);
    this.showBorder = true;
    this.title = "Credits";
  }

  async updateContent(): Promise<GameEvent> {
    let key = await this.ioHandler.requestKey();
    if (key === "escape") {
      return new UIGameEvents.ExitUI();
    }
    return new UIGameEvents.NoEvent();
  }

  refreshVisuals(): void {
    this.layer.addDrawable(new TextDrawable(1,1,
      ["Created by Sam Eagen && Alexandre Ait Ettajer",
        "",
        "Submitted for 7DRL 2025",
        "",
        "Play tested by Thomas Ait Ettajer && Stephen Lindsley"
      ].join("\n"), this.boundaries.getWidth() - 2
    ))
    super.refreshVisuals();
  }
}