import { GameState } from "./gamestate";

export abstract class GameEvent {
  abstract get isUIEvent (): boolean
  abstract run(state: GameState): void;
}

export abstract class UIGameEvent extends GameEvent {
  get isUIEvent (): boolean {
    return true;
  }
}

export abstract class Action extends GameEvent {
  get isUIEvent (): boolean {
    return false;
  }
}

