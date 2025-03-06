import { UIGameEvent } from "./gameEvent";
import { GameState } from "./gamestate";
import { getUIManager } from "./uiManager";

export class ExitUI extends UIGameEvent {
  run (_state: GameState): void {
    getUIManager().exitCurrentFocus();
  }
}

export class Select extends UIGameEvent {
  run(state: GameState): void {
    throw new Error("Method not implemented.");
  }
}

export class OpenInventory extends UIGameEvent {
  run (_state: GameState): void {
    getUIManager().openInventory();
  }
}

export class LookModeActivate extends UIGameEvent {
  run(state: GameState): void {
    getUIManager().activateLookMode(state);
  }
}

export class NoEvent extends UIGameEvent {
  run (_state: GameState): void {}
}
