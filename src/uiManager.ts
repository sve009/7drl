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
import { BuffsPanel } from "./buffsPanel";
import { Game } from "./game";
import { StartScreen } from "./startScreen";
import { HelpPanel } from "./helpPanel";

export class UIManager {
  game: Game;
  startScreen: StartScreen;
  startScreenInset: number = 15;
  helpPanel: HelpPanel
  helpPanelInset: number = 14;

  logPanel: LogPanel;
  playerPanel: PlayerPanel;
  inventoryPanel: InventoryPanel;
  descriptorPanel: DescriptorPanel;
  buffPanel: BuffsPanel;
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

  constructor () {
    const renderPos = getRenderer().renderSize;
    const startScreenPos = new Position(renderPos.getStartX() + this.startScreenInset,
                                  renderPos.getStartY() + this.startScreenInset,
                                  renderPos.getWidth() - 2 * this.startScreenInset,
                                  renderPos.getHeight() - 2 * this.startScreenInset);
    this.startScreen = new StartScreen(startScreenPos, Number.MAX_SAFE_INTEGER - 1);

    const helpPos = new Position(renderPos.getStartX() + this.helpPanelInset,
    renderPos.getStartY() + this.helpPanelInset,
    renderPos.getWidth() - 2 * this.helpPanelInset,
    renderPos.getHeight() - 2 * this.helpPanelInset);
    this.helpPanel = new HelpPanel(helpPos, Number.MAX_SAFE_INTEGER);


    this.logPanel = new LogPanel(3);
    this.playerPanel = new PlayerPanel(3);
    this.buffPanel = new BuffsPanel(3);
    this.inventoryPanel = new InventoryPanel(11);
    this.lookModeCursor = new LookModeCursor(10);
    this.descriptorPanel = new DescriptorPanel(3, this.lookModeCursor);
  }

  async updateContent() {
    let gameEvent = await this.focusedObject.updateContent();
    gameEvent.run(this.gameState);
  }

  updateUIComponentBoundaries() {
    const renderPos = getRenderer().renderSize;
    const endMapX = this.gameState.terrainLayer.position.getEndX() + 1;
    const endMapY = this.gameState.terrainLayer.position.getEndY() + 1;
    const logPanelPos = new Position(renderPos.getStartX(), endMapY, renderPos.getWidth(), renderPos.getHeight() - endMapY);
    const rightPanelWidth = renderPos.getEndX() - endMapX + 1;
    const playPanelPos = new Position(endMapX, renderPos.getStartY(), rightPanelWidth, this.playerPanelHeight);
    const descPanelPos = new Position(endMapX, playPanelPos.getEndY() + 1, rightPanelWidth, this.descPanelHeight);
    const buffPanelPos = new Position(endMapX, descPanelPos.getEndY() + 1, rightPanelWidth, endMapY - descPanelPos.getEndY() - 1);
    this.logPanel.setBoundaries(logPanelPos);
    this.playerPanel.setBoundaries(playPanelPos);
    this.descriptorPanel.setBoundaries(descPanelPos);
    this.buffPanel.setBoundaries(buffPanelPos);

    const invPanelPos = new Position(this.gameState.terrainLayer.position.getStartX() + this.inventoryPanelInset,
                                     this.gameState.terrainLayer.position.getStartY() + this.inventoryPanelInset / 2,
                                     this.gameState.terrainLayer.position.getWidth() - 2 * this.inventoryPanelInset,
                                     this.gameState.terrainLayer.position.getHeight() - this.inventoryPanelInset);
    this.inventoryPanel.setBoundaries(invPanelPos);
  }

  addGameState (gameState: GameState): void {
    this.gameState = gameState;
    this.descriptorPanel.gameState = gameState;
    this.lookModeCursor.gameState = gameState;
    this.playerPanel.player = gameState.player;
    this.inventoryPanel.items = gameState.player.items;
    this.buffPanel.buffs = gameState.player.buffs;

    this.updateUIComponentBoundaries();
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
      new Position(16, 15, 47, 10),
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
    this.buffPanel.refreshVisuals();
    if (this.focused) {
      this.focusedObject.refreshVisuals();
    }
  }

  openInventory (): void {
    this.focusObjectQueue.push(this.inventoryPanel);
  }

  createStartScreen () {
    this.focusObjectQueue.push(this.startScreen);
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
    this.gameState.fullRefresh();
  }

  openHelp (): void {
    this.focusObjectQueue.push(this.helpPanel);
  }
}


let uiManager = new UIManager();
export function getUIManager() {
  return uiManager;
}

export function logMessage(text: string) {
  uiManager.logPanel.addLogMessage(text);
}
