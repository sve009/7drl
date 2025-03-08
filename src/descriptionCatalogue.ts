export function descriptionCatalogue (key: string) {
  switch (key) {
    case "#":
      return "Wall: Just regular old stone";
    case ".":
      return "Ground: Unimpressive if you ask me"
    case "+":
      return "Door: What could be on the other side?"
    case "grass":
      return "Grass: The blades sway in the soft wind."
    case "bush":
      return "Bush: Is it rustling slightly, I hope there isn't a goblin hiding in there.";
    case "shrub":
      return "Shrub: We are the nights that say NEE!";
    case "altar":
      return "Altar: The priest talks about artifacts and "
    case "water":
      return "Deep Water: A little too deep for someone who doesn't know how to swim to enter."
    case "swater":
      return "Shallow Water: The water only reaches to your knees."
    case "leaf":
      return "Leaves: The birds tweet from the branches."
    case "hshelf":
      return "Shelf: The shelves seem older than the priest, and word is they're at least 100 years old."
    case "vshelf":
      return "Shelf: Where do these books come from, they're all written in languages unknown to you."
    case ">":
      return "Descending Stairs: What is hidden in the depths of the dungeon?"
    case "<":
      return "Ascending Stairs: Brings you back to safety!"
    case "carpet":
      return "Carpet: Red interesting choice."
    case "woodf":
      return "Wood Floor: "
    case "path":
      return "Path: Leads you around the monastery."
    case "statue1":
      return "Statue: "
    case "statue2":
      return "Statue: "
    case "lilypad":
      return "Lilypad: "
    case "reed":
      return "Reed: "
    case "ruin1":
      return "Ruin: "
    case "ruin2":
      return "Ruin: "
    case "ruin3":
      return "Ruin: "
    case "ruin4":
      return "Ruin: "
    case "ruin5":
      return "Ruin: "
    case "ruin6":
      return "Ruin: "
    case "artfloor":
      return "???"
    case "artpill":
      return "???";
    case "tele1":
      return "Teleporter: "
    case "tele2":
      return "Teleporter: "
    case "tele3":
      return "Teleporter: "
    case "tele4":
      return "Teleporter: "
    case "shopkeeper":
      return "Shopkeeper: "
    case "priest":
      return "Priest: "
    case "alchemist":
      return "Alchemist: "
    case "blacksmith":
      return "Blacksmith: "
    case "librarian":
      return "Librarian: "
    case "bat":
      return "Bat: "
    case "jackal":
      return "Jackal: "
    case "goblin":
      return "Goblin: "
    case "goblinarcher":
      return "Goblin Archer: "
    case "wolf":
      return "Wolf: "
    case "potion of confusion":
      return "Potion of confusion: "
    case "potion of healing":
      return "Potion of Healing: "
    case "potion of regeneration":
      return "Potion of Regeneration: "
    case "potion of invisibility":
      return "Potion of invisibility: "
    case "unstable potion":
      return "Unstable Potion: "
    case "potion of might":
      return "Potion of Might: "
    case "scroll of teleportation":
      return "Scroll of Teleportation: "
    case "scroll of omniscience":
      return "Scroll of Omniscience: "
    case "scroll of poison":
      return "Scroll of Poison: "
    case "dagger":
      return "Dagger: "
    case "spear":
      return "Spear: "
    case "sword":
      return "Sword: "
    case "axe":
      return "Axe: "
    case "glaive":
      return "Glaive: "
    case "leather armor":
      return "Leather Armor: "
    case "chain mail":
      return "Chain mail: "
    case "scale mail":
      return "Scale Mail: "
    case "plate armor":
      return "Plate Armor: "
    case "player":
      return "Player: That's you!"
    default:
      throw new Error("MESSAGE ID MISSING");
  }
}
