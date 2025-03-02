import * as ROT from "rot-js";
import { Game } from "./game";

const display = new ROT.Display({width:80, height:40, fontSize: 20});
document.body.appendChild(display.getContainer());
display.getContainer().focus();

let game = new Game(display);
game.run();
