export function descriptionCatalogue (key: string): string {
  if (key.includes("gold")) {
    return key;
  }
  switch (key) {
    case "#":
      return "A rough-hewn stone wall, with pocks running all through it";
    case ".":
      return "A bare and uneven stone floor";
    case "+":
      return "A simple but sturdy door. What awaits on the other side?"
    case "grass":
      return "A matted tuft of grass, its blades swaying in the a gentle breeze"
    case "bush":
      return "A squat bush, rustling slightly. Hopefully there aren't any goblins lurking within";
    case "shrub":
      return "Shrubbery, NEE!";
    case "altar":
      return "A plain altarpiece, fitting for its humber surroundings";
    case "water":
      return "A swarth of deep water. Anything could lurk beneath its calm surface";
    case "swater":
      return "A shallow puddle. The water reaches to your knees at its deepest";
    case "leaf":
      return "A dense mesh of leaves and branches. Birds tweet from atop its branches";
    case "hshelf":
      return "An ancient shelf, its wood grain detailing its life's saga";
    case "vshelf":
      return "A shelf filled with tomes. Each is unique, and they're all written in languages unknown to you";
    case ">":
      return "Stairs descending into a thick pool of darkness";
    case "<":
      return "Stairs ascending up into a lighter realm";
    case "carpet":
      return "Tattered red carpet, far removed its once pristine glory";
    case "woodf":
      return "A scratched and stained wooden floor panel";
    case "path":
      return "A dirt path, kept clear via constant food traffic";
    case "statue1":
      return "A regal statue, its significance lost to time";
    case "statue2":
      return "A glittering statue, casting prismlike reflections upon the ground";
    case "lilypad":
      return "A lilypad, eking out an existance atop the surface of the grimy puddle";
    case "reed":
      return "Swaying reeds, bending but never breaking";
    case "ruin1":
      return "A partially broken down ruin, yet to fully be reclaimed by the dungeon";
    case "ruin2":
      return "A partially broken down ruin, yet to fully be reclaimed by the dungeon";
    case "ruin3":
      return "A partially broken down ruin, yet to fully be reclaimed by the dungeon";
    case "ruin4":
      return "A partially broken down ruin, yet to fully be reclaimed by the dungeon";
    case "ruin5":
      return "A partially broken down ruin, yet to fully be reclaimed by the dungeon";
    case "ruin6":
      return "A partially broken down ruin, yet to fully be reclaimed by the dungeon";
    case "artfloor":
      return "A glowing geometric mesh cuts across the floor. Its alienity causes you discomfort";
    case "artpill":
      return "A pillar covered in glowing runes. Despite its well-worn surroundings it looks untouched";
    case "tele1":
      return "A glowing pad on the floor, ready to send an adventurer into the depths of the dungeon";
    case "tele2":
      return "A glowing pad on the floor, ready to send an adventurer into the depths of the dungeon";
    case "tele3":
      return "A glowing pad on the floor, ready to send an adventurer into the depths of the dungeon";
    case "tele4":
      return "A glowing pad on the floor, ready to send an adventurer into the depths of the dungeon";
    case "shopkeeper":
      return "shopkeeper"
    case "priest":
      return "A lively priest, pacing and reciting prayers";
    case "alchemist":
      return "A manic alchemist, offering you a variety of helpful potions for the right price";
    case "blacksmith":
      return "A grizzled blacksmith, she can make sure you're equipped for your adventures";
    case "librarian":
      return "A frail librarian, he's an expert in ancient scrolls";
    case "bat":
      return "An evasive bat. Frail, but not to be underestimated due to the difficulty in hitting it in combat";
    case "jackal":
      return "A hungry jackal. A minor threat in individual combat, but potentially life ending when supported by other creatures";
    case "goblin":
      return "An ugly stout goblin. Its vision and memory are poor, so it's easier to avoid than fight";
    case "goblinarcher":
      return "This goblin seems to have found itself a bow. Its vision is significantly better than its melee compatriot, and it will attempt to keep its distance";
    case "wolf":
      return "A grizzled wolf, a survivor of many previous fights";
    case "cavespider":
      return "A small spider. It's sturdier than it looks, and very evasive";
    case "potion of confusion":
      return "A potion containing a peculiar liquid which confuses all it comes into contact with. Somehow benign to ingest"
    case "potion of healing":
      return "A miracle brew, able to fully restore any entity's life force";
    case "potion of regeneration":
      return "An ichor which promotes rapid recovery. Entities who come in contact with it will rapidly heal";
    case "potion of invisibility":
      return "A substance which when consumed hides an entity's presence from others";
    case "unstable potion":
      return "Make sure that you're the pitcher and not the receiver if you're going to play catch...";
    case "potion of might":
      return "A potion which imbues entities with herculean strength and dexterity";
    case "scroll of teleportation":
      return "A scroll which when read entangles the reader across space causing them to end up elsewhere";
    case "scroll of omniscience":
      return "A scroll which reveals all for a single level";
    case "scroll of poison":
      return "A scroll which poisons all entities within line of sight of the reader";
    case "dagger":
      return "A short but wicked blade";
    case "spear":
      return "A sharp point affixed to a long staff";
    case "sword":
      return "A sharp and balanced blade";
    case "axe":
      return "A heavy double-bladed battleaxe";
    case "glaive":
      return "The result of a spear and an axe having a child";
    case "leather armor":
      return "Armor made from pliable leather";
    case "chain mail":
      return "Armor made by many interlocking chain links";
    case "scale mail":
      return "Armor formed from linking together protective metal scales";
    case "plate armor":
      return "Armor consisting of large, solid metal plates joined together to fit the wearer's form";
    case "player":
      return "You"
    case "fence":
      return "A mysterious metal barricade";
    default:
      return key;
  }
}
