import { UIComponent } from "./gameObject";
import { BasicArmor, BasicWeapon, RangedWeapon, Weapon } from "./item";
import { Player } from "./player";
import { TextDrawable } from "./renderer";

export class EquipmentPanel extends UIComponent {
  player: Player

  constructor (layerIdx: number) {
    super();
    this.layer.index = layerIdx;

    this.title = "Equipment";
    this.showBorder = true;
  }

  refreshVisuals () {
    let dispText = Array<string>();
    let indentDispText = Array<string>();
    let indent2DispText = Array<string>();
    dispText.push("Weapon:");
    indentDispText.push("");
    indent2DispText.push("");
    const weapon = this.player.equipment.get("weapon");
    if (weapon && weapon instanceof BasicWeapon) {
      dispText.push("");
      indentDispText.push(weapon.profile.name);
      indent2DispText.push("");
      dispText.push("");
      indentDispText.push("");
      indent2DispText.push("Damage: +" + weapon.profile.damage);
      dispText.push("");
      indentDispText.push("");
      indent2DispText.push("Accuracy: +" + weapon.profile.accuracy);
    } else {
      dispText.push("");
      indentDispText.push("Bare Hands");
      indent2DispText.push("");
      dispText.push("");
      indentDispText.push("");
      indent2DispText.push("Damage: +0");
      dispText.push("");
      indentDispText.push("");
      indent2DispText.push("Accuracy: +0");
    }
    dispText.push("Armor:");
    indentDispText.push("");
    indent2DispText.push("");
    const armor = this.player.equipment.get("armor");
    if (armor && armor instanceof BasicArmor) {
      dispText.push("");
      indentDispText.push(armor.profile.name);
      indent2DispText.push("");
      dispText.push("");
      indentDispText.push("");
      indent2DispText.push("Protection: +" + armor.profile.armor);
      dispText.push("");
      indentDispText.push("");
      indent2DispText.push("Evasion: +" + armor.profile.dodge);
    } else {
      dispText.push("");
      indentDispText.push("Tattered robes");
      indent2DispText.push("");
      dispText.push("");
      indentDispText.push("");
      indent2DispText.push("Protection: +0");
      dispText.push("");
      indentDispText.push("");
      indent2DispText.push("Evasion: +0");
    }
    this.layer.addDrawable(new TextDrawable(1,1,dispText.join("\n")));
    this.layer.addDrawable(new TextDrawable(2,1,indentDispText.join("\n")));
    this.layer.addDrawable(new TextDrawable(4,1,indent2DispText.join("\n")));
    super.refreshVisuals();
  }
}