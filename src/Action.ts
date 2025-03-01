export abstract class Action {
  abstract run(): void;
}

export class NoAction extends Action {
  run() {}
}

