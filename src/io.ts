import { KEYS } from "rot-js";

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
    let key = this.lastKey;
    if (key) {
      this.lastKey = null;
      return key;
    } else {
      return new Promise((resolve, reject) => {
        this.keyPressCallback = resolve;
      });
    }
  }

  handleKeyDown(event: KeyboardEvent) {
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
    }

    if (this.keyPressCallback) {
      this.keyPressCallback(this.lastKey);
    }
  }

  handleKeyUp(event: KeyboardEvent) {
    let code = event.keyCode;
    if (code == KEYS.VK_SHIFT) {
      this.shifting = true;
    }
  }
}
