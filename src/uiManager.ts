import { LogPanel } from "./logPanel";
import { getRenderer, Position } from "./renderer";
import { UIComponent } from "./gameObject";
import { PlayerPanel } from "./playerPanel";
import { InventoryPanel } from "./inventoryPanel";
import { GameState } from "./gamestate";
import { LookModeCursor } from "./lookModeCursor";
import { DescriptorPanel } from "./descriptorPanel";
import { DialogPanel, DialogCallbacks } from "./dialogPanel";
import { Item } from "./item";

export class UIManager {
  logPanel: LogPanel;
  playerPanel: PlayerPanel;
  inventoryPanel: InventoryPanel;
  descriptorPanel: DescriptorPanel;
  lookModeCursor: LookModeCursor;
  gameState: GameState | null = null;
  playerPanelHeight: number = 10;
  descPanelHeight: number = 10;
  inventoryPanelInset: number = 10;

  focusObjectQueue: Array<UIComponent> = new Array;
  get focused (): boolean {
    return this.focusObjectQueue.length > 0; 
  }
  get focusedObject (): UIComponent | null {
    return this.focused ? this.focusObjectQueue[this.focusObjectQueue.length - 1] : null;
  }

  constructor() {
    this.logPanel = new LogPanel(new Position(0, 40, 105, 10), 3);
    this.playerPanel = new PlayerPanel(new Position(80, 0, 25, 10), 3);
    this.inventoryPanel = new InventoryPanel(new Position(10, 5, 60, 30), 11);
    this.lookModeCursor = new LookModeCursor(10);
    this.descriptorPanel = new DescriptorPanel(new Position(80, 20, 25, 10), 3, this.lookModeCursor);
  }

  async updateContent() {
    let gameEvent = await this.focusedObject.updateContent();
    gameEvent.run(this.gameState);
  }

  addGameState (gameState: GameState): void {
    const renderPos = getRenderer().renderSize;
    const endMapX = gameState.terrainLayer.position.getEndX() + 1;
    const endMapY = gameState.terrainLayer.position.getEndY() + 1;
    const logPanelPos = new Position(renderPos.getStartX(), endMapY, renderPos.getWidth(), renderPos.getHeight() - endMapY);
    const rightPanelWidth = renderPos.getEndX() - endMapX + 1;
    const playPanelPos = new Position(endMapX, renderPos.getStartY(), rightPanelWidth, this.playerPanelHeight);
    const descPanelPos = new Position(endMapX, playPanelPos.getEndY() + 1, rightPanelWidth, this.descPanelHeight);
    this.logPanel.setBoundaries(logPanelPos);
    this.playerPanel.setBoundaries(playPanelPos);
    this.descriptorPanel.setBoundaries(descPanelPos);

    const invPanelPos = new Position(gameState.terrainLayer.position.getStartX() + this.inventoryPanelInset,
                                     gameState.terrainLayer.position.getStartY() + this.inventoryPanelInset / 2,
                                     gameState.terrainLayer.position.getWidth() - 2 * this.inventoryPanelInset,
                                     gameState.terrainLayer.position.getHeight() - this.inventoryPanelInset);
    this.inventoryPanel.layer.position = invPanelPos;

    this.gameState = gameState;
    this.descriptorPanel.gameState = gameState;
    this.lookModeCursor.gameState = gameState;
  }

  createDialogPanel(
    item: Item | null, 
    text: string | null,
    buttons: [
      boolean,
      boolean,
      boolean,
      boolean,
      boolean,
    ],
    callbacks: DialogCallbacks,
  ): void {
    const title = item ? item.name : null;
    const fText = item ? item.name : null;
    const dialog = new DialogPanel(
      new Position(17, 15, 45, 10),
      0,
      title,
      fText,
      buttons,
      item,
      callbacks
    );
    this.addUIToFront(dialog);
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
