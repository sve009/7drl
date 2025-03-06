import { LogPanel } from "./logPanel";
import { Position } from "./renderer";
import { UIComponent } from "./gameObject";
import { PlayerPanel } from "./playerPanel";
import { InventoryPanel } from "./inventoryPanel";
import { GameState } from "./gamestate";
import { LookModeCursor } from "./lookModeCursor";

export class UIManager {
  logPanel: LogPanel
  playerPanel: PlayerPanel
  inventoryPanel: InventoryPanel
  lookModeCursor: LookModeCursor
  gameState: GameState | null = null;

  focusObjectQueue: Array<UIComponent> = new Array
  get focused (): boolean {
    return this.focusObjectQueue.length > 0; 
  }
  get focusedObject (): UIComponent | null {
    return this.focused ? this.focusObjectQueue[this.focusObjectQueue.length - 1] : null;
  }

  constructor() {
    this.logPanel = new LogPanel(new Position(0, 40, 80, 4));
    this.playerPanel = new PlayerPanel(new Position(80, 10, 40, 10));
    this.inventoryPanel = new InventoryPanel(new Position(10, 5, 60, 30));
    this.lookModeCursor = new LookModeCursor;
  }

  async updateContent() {
    let gameEvent = await this.focusedObject.updateContent();
    gameEvent.run(this.gameState);
  }

  refreshVisual() {
    this.logPanel.refreshVisuals();
    this.playerPanel.refreshVisuals();
    if (this.focused) {
      this.focusedObject.refreshVisuals();
    }
  }

  openInventory (): void {
    this.focusObjectQueue.push(this.inventoryPanel);
  }

  activateLookMode(state: GameState, initPosition: { x: number, y: number }) {
    this.lookModeCursor.updatePosition(initPosition);
    this.lookModeCursor.gameState = state;
    this.focusObjectQueue.push(this.lookModeCursor);
  }

  exitCurrentFocus (): void {
    this.focusObjectQueue.pop();
    if (!this.focusObjectQueue.length && this.gameState) {
      this.gameState.fullRefresh();
    }
  }
}


let uiManager = new UIManager;
export function getUIManager() {
  return uiManager;
}

export function logMessage(text: string) {
  uiManager.logPanel.addLogMessage(text);
}
