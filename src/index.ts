import * as ROT from "rot-js";
import { IOHandler } from "./io";

let display = new ROT.Display({width:80, height:40, fontSize: 20});
document.body.appendChild(display.getContainer());
display.getContainer().focus();

let handler = new IOHandler();

let map = new ROT.Map.Digger(40, 25);
map.create(display.DEBUG);
let drawDoor = (x: number, y: number) => {
    display.draw(x, y, "", "", "red");
}

let rooms = map.getRooms();
for (let i=0; i<rooms.length; i++) {
    let room = rooms[i];
    room.getDoors(drawDoor);
}

console.log("Press a key");
let s = await handler.requestKey();
console.log("Got " + s);
