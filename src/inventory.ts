import * as Items from "./item";

export class Inventory {
  gold: number;
  potions: Items.Potion[];
  scrolls: Items.Scroll[];
  weapons: Items.Weapon[];
  armor: Items.Armor[];
  rings: Items.Ring[];
  
  propsMap = [
    "potions",
    "scrolls",
    "weapons",
    "armor",
    "rings"
  ];
  expanded = [
    true,
    true,
    true,
    true,
    true
  ];
  [propName: string]: any;

  constructor() {
    this.gold = 0;
    this.potions = [];
    this.scrolls = [];
    this.weapons = [];
    this.armor = [];
    this.rings = [];
  }

  // Yuck, I see quick and dirty it is Sam
  addItem(item: Items.Item) {
    if (item instanceof Items.Gold) {
      this.gold += item.amount;
    } else if (item instanceof Items.Potion) {
      this.potions.push(item);
    } else if (item instanceof Items.Scroll) {
      this.scrolls.push(item);
    } else if (item instanceof Items.Weapon) {
      this.weapons.push(item);
    } else if (item instanceof Items.Armor) {
      this.armor.push(item);
    } else if (item instanceof Items.Ring) {
      this.rings.push(item);
    }
  }

  removeItem(item: Items.Item) {
    console.log('remove item');
    if (item instanceof Items.Potion) {
      this.doRemoveItem(item, "potions");
    } else if (item instanceof Items.Scroll) {
      this.doRemoveItem(item, "scrolls");
    } else if (item instanceof Items.Weapon) {
      this.doRemoveItem(item, "weapons");
    } else if (item instanceof Items.Armor) {
      this.doRemoveItem(item, "armor");
    } else if (item instanceof Items.Ring) {
      this.doRemoveItem(item, "rings");
    }
  }

  doRemoveItem(item: Items.Item, category: string) {
    console.log('really remove item', item, category);
    for (let i = 0; i < this[category].length; i++) {
      if (this[category][i] == item) {
        console.log('match', this[category]);
        this[category].splice(i, 1);
        console.log('after', this[category]);
      }
    }
  }
}
