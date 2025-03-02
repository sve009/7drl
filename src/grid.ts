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
}
