import { LogPanel } from "./logPanel";
import { getRenderer, Position } from "./renderer";
import { UIComponent } from "./gameObject";
import { PlayerPanel } from "./playerPanel";
import { InventoryPanel } from "./inventoryPanel";
import { ShopMenu } from "./shopPanel";
import { GameState } from "./gamestate";
import { LookModeCursor } from "./lookModeCursor";
import { DescriptorPanel } from "./descriptorPanel";
import { DialogPanel, DialogCallbacks } from "./dialogPanel";
import { Item } from "./item";
import { BuffsPanel } from "./buffsPanel";
import { Game } from "./game";
import { StartScreen } from "./startScreen";
import { HelpPanel } from "./helpPanel";
import { PausePanel } from "./pausePanel";
import { EndScreen } from "./endScreen";
import { EquipmentPanel } from "./equipmentPanel";
import { CreditsPanel } from "./creditsPanel";
import { descriptionCatalogue } from "./descriptionCatalogue";

export class UIManager {
  game: Game;
  startScreen: StartScreen;
  startScreenInset: number = 15;
  endScreen: EndScreen;
  endHorizontalPanelInset: number = 35;
  endVerticalPanelInset: number = 18;
  helpPanel: HelpPanel
  helpHorizontalPanelInset: number = 26;
  helpVerticalPanelInset: number = 10;
  pausePanel: PausePanel;
  pauseHorizontalPanelInset: number = 40;
  pauseVerticalPanelInset: number = 21;
  creditsPanel: CreditsPanel;
  creditsHorizontalPanelInset: number = 26;
  creditsVerticalPanelInset: number = 21;

  logPanel: LogPanel;
  playerPanel: PlayerPanel;
  inventoryPanel: InventoryPanel;
  descriptorPanel: DescriptorPanel;
  equipmentPanel: EquipmentPanel;
  buffPanel: BuffsPanel;
  lookModeCursor: LookModeCursor;
  gameState: GameState | null = null;
  playerPanelHeight: number = 7;
  equipPanelHeight: number = 10;
  buffPanelHeight: number = 8;
  inventoryPanelInset: number = 10;

  focusObjectQueue: Array<UIComponent> = new Array;
  tempObjectQueue: Array<UIComponent> = new Array;
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

    const helpPos = new Position(renderPos.getStartX() + this.helpHorizontalPanelInset,
    renderPos.getStartY() + this.helpVerticalPanelInset,
    renderPos.getWidth() - 2 * this.helpHorizontalPanelInset,
    renderPos.getHeight() - 2 * this.helpVerticalPanelInset);
    this.helpPanel = new HelpPanel(helpPos, Number.MAX_SAFE_INTEGER);

    const pausePos = new Position(renderPos.getStartX() + this.pauseHorizontalPanelInset,
    renderPos.getStartY() + this.pauseVerticalPanelInset,
    renderPos.getWidth() - 2 * this.pauseHorizontalPanelInset,
    renderPos.getHeight() - 2 * this.pauseVerticalPanelInset);
    this.pausePanel = new PausePanel(pausePos, Number.MAX_SAFE_INTEGER);

    const endScreenPos = new Position(renderPos.getStartX() + this.endHorizontalPanelInset,
    renderPos.getStartY() + this.endVerticalPanelInset,
    renderPos.getWidth() - 2 * this.endHorizontalPanelInset,
    renderPos.getHeight() - 2 * this.endVerticalPanelInset);
    this.endScreen = new EndScreen(endScreenPos, Number.MAX_SAFE_INTEGER-1);

    const creditScreenPos = new Position(renderPos.getStartX() + this.creditsHorizontalPanelInset,
    renderPos.getStartY() + this.creditsVerticalPanelInset,
    renderPos.getWidth() - 2 * this.creditsHorizontalPanelInset,
    renderPos.getHeight() - 2 * this.creditsVerticalPanelInset);
    this.creditsPanel = new CreditsPanel(creditScreenPos, Number.MAX_SAFE_INTEGER);

    this.logPanel = new LogPanel(3);
    this.playerPanel = new PlayerPanel(3);
    this.equipmentPanel = new EquipmentPanel(3);
    this.buffPanel = new BuffsPanel(3);
    this.inventoryPanel = new InventoryPanel(11);
    this.lookModeCursor = new LookModeCursor(10);
    this.descriptorPanel = new DescriptorPanel(3, this.lookModeCursor);
  }

  async updateContent() {
    let gameEvent = await this.focusedObject.updateContent();
    console.log(gameEvent);
    gameEvent.run(this.gameState);
  }

  updateUIComponentBoundaries() {
    const renderPos = getRenderer().renderSize;
    const endMapX = this.gameState.terrainLayer.position.getEndX() + 1;
    const endMapY = this.gameState.terrainLayer.position.getEndY() + 1;
    const logPanelPos = new Position(renderPos.getStartX(), endMapY, renderPos.getWidth(), renderPos.getHeight() - endMapY);
    const rightPanelWidth = renderPos.getEndX() - endMapX + 1;
    const playPanelPos = new Position(endMapX, renderPos.getStartY(), rightPanelWidth, this.playerPanelHeight);
    const equiPanelPos = new Position(endMapX, playPanelPos.getEndY() + 1, rightPanelWidth, this.equipPanelHeight) 
    const buffPanelPos = new Position(endMapX, equiPanelPos.getEndY() + 1, rightPanelWidth, this.buffPanelHeight);
    const descPanelPos = new Position(endMapX, buffPanelPos.getEndY() + 1, rightPanelWidth, endMapY - buffPanelPos.getEndY() - 1);
    this.logPanel.setBoundaries(logPanelPos);
    this.playerPanel.setBoundaries(playPanelPos);
    this.equipmentPanel.setBoundaries(equiPanelPos);
    this.buffPanel.setBoundaries(buffPanelPos);
    this.descriptorPanel.setBoundaries(descPanelPos);

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
    this.playerPanel.gameState = gameState;
    this.playerPanel.player = gameState.player;
    this.inventoryPanel.items = gameState.player.items;
    this.buffPanel.buffs = gameState.player.buffs;
    this.equipmentPanel.player = gameState.player;

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
    const fText = item 
      ? item.name 
      : null;
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
    this.equipmentPanel.refreshVisuals();
    if (this.focused) {
      this.focusedObject.refreshVisuals();
    }
  }

  openInventory (): void {
    this.focusObjectQueue.push(this.inventoryPanel);
  }

  openShop (shopName: string): void {
    const inventory = this.gameState.shopInventory(shopName);
    this.focusObjectQueue.push(new ShopMenu(inventory, this.gameState.player));
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
    if (!this.focusObjectQueue.length && this.tempObjectQueue.length) {
      this.focusObjectQueue = this.tempObjectQueue;
      this.tempObjectQueue = [];
    }
    this.gameState.fullRefresh();
  }

  openHelp (): void {
    this.tempObjectQueue = this.focusObjectQueue;
    this.focusObjectQueue = [this.helpPanel];
    this.gameState.fullRefresh();
  }

  openPauseMenu (): void {
    this.focusObjectQueue.push(this.pausePanel);
  }

  restartGame (): void {
    this.focusObjectQueue = [];
    this.logPanel.logs = [];
    this.gameState.fullRefresh();
    this.game.restartGame();
  }

  throwCursorMode (startPosition: { x: number, y: number }, radius: number): void {
    this.lookModeCursor.updatePosition(startPosition);
    this.lookModeCursor.lockToPlayer(radius);
    this.tempObjectQueue = this.focusObjectQueue;
    this.focusObjectQueue = [this.lookModeCursor];
    this.gameState.fullRefresh();
  }

  showEndScreen (win: boolean) {
    this.endScreen.win = win;
    this.focusObjectQueue.push(this.endScreen);
  }

  exitAllFocus (): void {
    this.focusObjectQueue = [];
    this.tempObjectQueue = [];
    this.gameState.fullRefresh();
  }

  showCredits () {
    this.tempObjectQueue = this.focusObjectQueue;
    this.focusObjectQueue = [this.creditsPanel];
    this.gameState.fullRefresh();
  }
}


let uiManager = new UIManager();
export function getUIManager() {
  return uiManager;
}

export function logMessage(text: string) {
  uiManager.logPanel.addLogMessage(text);
}
