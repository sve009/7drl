import * as ROT from "rot-js";
import { Game } from "./game";
import { MapGenerator } from "./mapgen";
import { IOHandler } from "./io";
import { breakIndex, joinIndex } from "./utilities";

let display = new ROT.Display({width:80, height:40, fontSize: 20});
document.body.appendChild(display.getContainer());
display.getContainer().focus();

const generator = new MapGenerator(80, 40);
const handler = new IOHandler();
while(true) {
  const [room, doors] = generator.createRoom();
  for (let i = 0; i < generator.width*generator.height; i++) {
    if (room.values[i]) {
      const { x, y } = breakIndex(i, 80);
      display.draw(x, y, "x", "#999", "#999");
    }
  }
  for (const { x, y } of doors.values()) {
    console.log(`x: ${x}, y: ${y}`);
    display.draw(x, y, " ", "#5bba4e", "#5bba4e");
  }
  await handler.requestKey(); 
}

let game = new Game(display);
game.run();
