const translation: Array<string> = [
  "left",
  "down",
  "up",
  "right",
  "upleft",
  "upright",
  "downright",
  "downleft"
]

export class MovementControl {
  static keys: Array<string>;
  static preference: string = "hjkl"
  static readonly modes: Array<string> = ["hjkl", "wasd", "arrow"];

  static setPreference (preference: string): void {
    if (MovementControl.modes.indexOf(preference) == -1) {
      throw new Error("Non-Existant Preference");
    }
    let newKeys = Array<string>();
    switch (preference) {
      case "hjkl":
        newKeys = ["h", "j", "k", "l", "y", "u", "n", "b"];
        break
      case "wasd":
        newKeys = ["a", "s", "w", "d", "q", "e", "x", "z"];
        break
      case "arrow":
        newKeys = ["left arrow", "down arrow", "up arrow", "right arrow", "shift + up arrow", "shift + right arrow", "shift + down arrow", "shift + left arrow"];
        break
    }
    MovementControl.preference = preference;
    MovementControl.keys = newKeys;
  }

  static convertIfDirection (key: string): string {
    console.log(key, MovementControl.keys)
    const idx = MovementControl.keys.indexOf(key);
    return (idx == -1)
      ? key
      : translation[idx];
  }

  static convertDirectionToKey (direction: string): string {
    return MovementControl.keys[translation.indexOf(direction)]
  }
}

MovementControl.setPreference("hjkl");
