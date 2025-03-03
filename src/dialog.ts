import { Text } from "./renderer";
import { UI } from "./ui";

export class Dialog extends UI {

    async update() {

    }

    refreshVisual() {
        this.layer.addDrawable(new Text(1,1, "Hello WORLD"));
    }
    
}