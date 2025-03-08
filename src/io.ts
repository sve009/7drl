import { KEYS } from "rot-js";
import { MovementControl } from "./movementControl";

/**
 * Handle all keyboard input
 */
export class IOHandler {
  shifting: boolean;
  lastKey: string | null;
  keyPressCallback: (value: string | PromiseLike<string>) => void;

  constructor() {
    this.shifting = false;
    window.addEventListener("keydown", this.handleKeyDown.bind(this));
    window.addEventListener("keyup", this.handleKeyUp.bind(this));
  }

  async requestKey(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.keyPressCallback = resolve;
    });
  }

  handleKeyDown(event: KeyboardEvent) {
    this.lastKey = null;

    let code = event.keyCode;
    switch (code) {
      case KEYS.VK_SHIFT: {
        this.shifting = true;
        return;
      }
      case KEYS.VK_H: {
        if (!this.shifting) {
          this.lastKey = "h";    
        }
        break;
      } 
      case KEYS.VK_J: {
        if (!this.shifting) {
          this.lastKey = "j";    
        }
        break;
      } 
      case KEYS.VK_K: {
        if (!this.shifting) {
          this.lastKey = "k";    
        }
        break;
      } 
      case KEYS.VK_L: {
        if (!this.shifting) {
          this.lastKey = "l";    
        }
        break;
      } 
      case KEYS.VK_Y: {
        if (!this.shifting) {
          this.lastKey = "y";    
        }
        break;
      } 
      case KEYS.VK_U: {
        if (!this.shifting) {
          this.lastKey = "u";    
        }
        break;
      } 
      case KEYS.VK_B: {
        if (!this.shifting) {
          this.lastKey = "b";    
        }
        break;
      } 
      case KEYS.VK_N: {
        if (!this.shifting) {
          this.lastKey = "n";    
        }
        break;
      } 
      case KEYS.VK_PERIOD: {
        if (!this.shifting) {
          this.lastKey = ".";    
        } else {
          this.lastKey = ">";
        }
        break;
      } 
      case KEYS.VK_I: {
        if (!this.shifting) {
          this.lastKey = "i";
        }
        break
      }
      case KEYS.VK_RETURN: {
        if (!this.shifting) {
          this.lastKey = "enter";
        }
        break
      }
      case KEYS.VK_ESCAPE: {
        if (!this.shifting) {
          this.lastKey = "escape";
        }
        break
      }
      case KEYS.VK_COMMA: {
        if (!this.shifting) {
          this.lastKey = ",";
        } else {
          this.lastKey = "<";
        }
        break;
      }
      case KEYS.VK_SEMICOLON: {
        if (!this.shifting) {
          this.lastKey = ";";
        }
        break;
      }
      case 186: {
        if (!this.shifting) {
          this.lastKey = ";";
        } else {
          this.lastKey = ":";
        }
      }
      case KEYS.VK_SLASH: {
        if (!this.shifting) {
          this.lastKey = "/";
        } else {
          this.lastKey = "?";
        }
        break;
      }
      case KEYS.VK_UP: {
        if (!this.shifting) {
          this.lastKey = "up arrow";
        } else {
          this.lastKey = "shift + up arrow";
        }
        break;
      }
      case KEYS.VK_DOWN: {
        if (!this.shifting) {
          this.lastKey = "down arrow";
        } else {
          this.lastKey = "shift + down arrow";
        }
        break;
      }
      case KEYS.VK_LEFT: {
        if (!this.shifting) {
          this.lastKey = "left arrow";
        } else {
          this.lastKey = "shift + left arrow";
        }
        break;
      }
      case KEYS.VK_RIGHT: {
        if (!this.shifting) {
          this.lastKey = "right arrow";
        } else {
          this.lastKey = "shift + right arrow";
        }
        break;
      }
      case KEYS.VK_Q: {
        if (!this.shifting) {
          this.lastKey = "q";
        }
        break;
      }
      case KEYS.VK_W: {
        if (!this.shifting) {
          this.lastKey = "w";
        }
        break;
      }
      case KEYS.VK_E: {
        if (!this.shifting) {
          this.lastKey = "e";
        }
        break;
      }
      case KEYS.VK_A: {
        if (!this.shifting) {
          this.lastKey = "a";
        }
        break;
      }
      case KEYS.VK_S: {
        if (!this.shifting) {
          this.lastKey = "s";
        }
        break;
      }
      case KEYS.VK_D: {
        if (!this.shifting) {
          this.lastKey = "d";
        }
        break;
      }
      case KEYS.VK_Z: {
        if (!this.shifting) {
          this.lastKey = "z";
        }
        break;
      }
      case KEYS.VK_X: {
        if (!this.shifting) {
          this.lastKey = "x";
        }
        break;
      }
    }

    this.lastKey = MovementControl.convertIfDirection(this.lastKey);

    if (this.keyPressCallback && this.lastKey) {
      this.keyPressCallback(this.lastKey);
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    let code = event.keyCode;
    if (code == KEYS.VK_SHIFT) {
      this.shifting = false;
    }
  }
}
