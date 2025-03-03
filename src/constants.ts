// Direction map
let map = new Map();
map.set(0, { x: -1, y: 0 });
map.set(1, { x: 0, y: 1 });
map.set(2, { x: 1, y: 0 });
map.set(3, { x: 0, y: -1 });
map.set(4, { x: -1, y: 1 });
map.set(5, { x: 1, y: 1 });
map.set(6, { x: 1, y: -1 });
map.set(7, { x: -1, y: -1 });
export const dirMap = map;

let oppMap = new Map();
oppMap.set(0, 2);
oppMap.set(1, 3);
oppMap.set(2, 0);
oppMap.set(3, 1);
oppMap.set(4, 6);
oppMap.set(5, 7);
oppMap.set(6, 4);
oppMap.set(7, 5);
export const oppDir = oppMap;
