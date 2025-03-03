import { breakIndex, joinIndex } from "./utilities";

export class Grid {
  width: number;
  height: number;
  values: number[];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.values = [];

    for (let i = 0; i < this.width*this.height; i++) {
      this.values.push(0);
    }
  }

  drawCircle(x0: number, y0: number, r: number): void {
    for (let i = 0; i < this.width*this.height; i++) {
      const x = i % this.width;
      const y = Math.floor(i / this.width);
      const r2 = Math.pow(r, 2);
      if (Math.pow((x - x0), 2) + Math.pow((y - y0), 2) < r2) {
        this.values[i] = 1; 
      }
    }
  }

  drawRectangle(x: number, y: number, width: number, height: number): void {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        const x0 = x + i;
        const y0 = y + j;
        const k = x0 + y0*this.width;
        this.values[k] = 1;
      }
    }
  }

  fits(other: Grid, xOffset: number, yOffset: number): boolean {
    for (let i = 0; i < other.width*other.height; i++) {
      if (other.values[i]) {
        const { x, y } = breakIndex(i, other.width);
        const fx = x + xOffset;
        const fy = y + yOffset;

        if (fx < 2 || 
            fx > this.width - 2 ||
            fy < 2 ||
            fy > this.height - 2 ||
            this.values[joinIndex(fx, fy, this.width)]
        ) {
            return false;
        }
      }
    }

    return true;
  }

  // @pre this.fits(other, xOffset, yOffset) == true
  merge(other: Grid, xOffset: number, yOffset: number): void {
    for (let i = 0; i < other.width*other.height; i++) {
      if (other.values[i]) {
        const { x, y } = breakIndex(i, other.width);
        const fx = x + xOffset;
        const fy = y + yOffset;

        const j = joinIndex(fx, fy, this.width);
        this.values[j] = other.values[i];
      }
    }
  }
}
