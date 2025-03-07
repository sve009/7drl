import { LogPanel } from "./logPanel";
import { Position } from "./renderer";
import { UIComponent } from "./gameObject";
import { PlayerPanel } from "./playerPanel";
import { InventoryPanel } from "./inventoryPanel";
import { GameState } from "./gamestate";
import { LookModeCursor } from "./lookModeCursor";
import { DescriptorPanel } from "./descriptorPanel";

export class UIManager {
  logPanel: LogPanel;
  playerPanel: PlayerPanel;
  inventoryPanel: InventoryPanel;
  lookModeCursor: LookModeCursor;
  gameState: GameState | null = null;
  descriptorPanel: DescriptorPanel;

  focusObjectQueue: Array<UIComponent> = new Array;
  get focused (): boolean {
    return this.focusObjectQueue.length > 0; 
  }
  get focusedObject (): UIComponent | null {
    return this.focused ? this.focusObjectQueue[this.focusObjectQueue.length - 1] : null;
  }

  constructor() {
    this.logPanel = new LogPanel(new Position(0, 40, 100, 10), 3);
    this.playerPanel = new PlayerPanel(new Position(80, 0, 20, 10), 3);
    this.inventoryPanel = new InventoryPanel(new Position(10, 5, 60, 30), 11);
    this.lookModeCursor = new LookModeCursor(10);
    this.descriptorPanel = new DescriptorPanel(new Position(80, 20, 20, 10), 3, this.lookModeCursor);
  }

  async updateContent() {
    let gameEvent = await this.focusedObject.updateContent();
    gameEvent.run(this.gameState);
  }

  addGameState (gameState: GameState): void {
    this.gameState = gameState;
    this.descriptorPanel.gameState = gameState;
    this.lookModeCursor.gameState = gameState;
  }

  refreshVisual() {
    this.logPanel.refreshVisuals();
    this.playerPanel.refreshVisuals();
    this.descriptorPanel.refreshVisuals();
    if (this.focused) {
      this.focusedObject.refreshVisuals();
    }
  }

  openInventory (): void {
    this.focusObjectQueue.push(this.inventoryPanel);
  }

  activateLookMode(initPosition: { x: number, y: number }) {
    this.lookModeCursor.updatePosition(initPosition);
    this.focusObjectQueue.push(this.lookModeCursor);
  }

  addUIToFront (component: UIComponent) {
    component.activate();
    const newLayerIdx = Math.max(...this.focusObjectQueue.map((comp: UIComponent) => comp.layer.index));
    component.layer.index = newLayerIdx + 1;
    this.focusObjectQueue.push(component);
  }

  exitCurrentFocus (): void {
    const component = this.focusObjectQueue.pop();
    component.deactivate();
    if (!this.focusObjectQueue.length && this.gameState) {
      this.gameState.fullRefresh();
    }
  }
}


let uiManager = new UIManager();
export function getUIManager() {
  return uiManager;
}

export function logMessage(text: string) {
  uiManager.logPanel.addLogMessage(text);
}
