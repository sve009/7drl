import { RNG } from "rot-js";

export function randi(start: number, end: number): number {
  const r = RNG.getUniform();
  return Math.floor((end - start)*r + start); 
}

export function joinIndex(x: number, y: number, w: number): number {
  return x + y*w;
}

export function breakIndex(i: number, w: number): { x: number; y: number; } {
  return {
    x: i % w,
    y: Math.floor(i / w),
  };
}
