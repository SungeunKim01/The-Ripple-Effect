import * as fs from "fs/promises";
import path from "path";

// this reads server/data/info.json
const cwd = process.cwd();
const DATA_PATH = cwd.endsWith("/server") ? path.join(cwd, "data", "info.json") : path.join(cwd, "data", "info.json");

export async function readInfoJson() {
  const raw = await fs.readFile(DATA_PATH, "utf-8");
  return JSON.parse(raw);
}

// normalizes the tile shape for frontend
//json use postion
export function normalizeTiles(tiles = []) {
  return tiles.map((tile) => {
    const [type] = String(tile.name).split("-");
    const pos = tile.postion || [-1, -1];

    return {
      id: tile.name,
      type,
      img: tile.img,
      tileColour: tile.tileColour || null,
      position: { r: pos[0], c: pos[1] },
      effect: tile.effect
    };
  });
}

//normalize solution bc solutions are just { id, position }
export function normalizeSolutions(solutions = []) {
  return solutions.map((s) => ({
    id: s.id,
    position: { r: s.position?.[0], c: s.position?.[1] }
  }));
}
