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
  initPosition: { x: number, y: number }

  constructor (position: { x: number, y: number }) {
    super()
    this.initPosition = position;
  }

  run(_state: GameState): void {
    getUIManager().activateLookMode(this.initPosition);
  }
}

export class NoEvent extends UIGameEvent {
  run (_state: GameState): void {}
}

export class OpenHelp extends UIGameEvent {
  run(_state: GameState): void {
    getUIManager().openHelp();
  }
}

export class OpenPauseMenu extends UIGameEvent {
  run (_state: GameState): void {
    getUIManager().openPauseMenu();
  }
}

export class RestartGame extends UIGameEvent {
  run (_state: GameState): void {
    getUIManager().restartGame();
  }
}
