/** 
 * these are helper functionus for level progress
 * we will focus on level1 for now, so:
 * - show progress percentage based on house and park only
 * -- houses are fixed, but park need to be placed in the right spot from solutions
 * in later level, we can include school/factory/power/etc by changing focusTypes
 */

//turning [r,c] into str key so easy for comparing positions
function positionKey(pos) {
    if (!Array.isArray(pos) || pos.length !== 2) {
        return null;
    }
    return `${pos[0]},${pos[1]}`;
}

// Get tile type from a id
//klike park-1 to park
export function getTileType(tileId) {
    return String(tileId).split("-")[0];
}

//build map from solutions
export function buildSolutionMap(solutions = []) {
    const map = new Map();
    for (const sol of solutions) {
        if (!sol || !sol.id) continue;
        map.set(sol.id, sol.position);
    }
    return map;
}

/**
 * find the target position for a tile
 * If it is listed in solutions, target = solutions position
 * else if the tile alr has fixed position in tiles[], target = tile.postion
 *else target = null --> ***IDK what to do it yet
 */
export function getTargetPosition(tile, solutionMap) {
    if (!tile) {
        return null;
    }
    // sol placements, movable tiles
    if (solutionMap && solutionMap.has(tile.id)) {
        return solutionMap.get(tile.id);
    }

    // fixed tiles that have real pos from json file
    const p = tile.postion;
    if (Array.isArray(p) && p.length === 2 && !(p[0] === -1 && p[1] === -1)) {
      return p;
    }
    return null;
}

// this check if a tile is exactly in the right spot
export function isTileCorrect(tile, currentPos, solutionMap) {
    const target = getTargetPosition(tile, solutionMap);
    if (!target) {
        return false;
    }
    return positionKey(currentPos) == positionKey(target);
}

// how far away player is
// so for examplr, (1,1) to (2,1) is one step awa
export function gridStepsBetween(a, b) {
    if (!a || !b) {
        return null;
    }
    //Math.abs returns the absolute valur of a num
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

/**
 * Score one tile from 0.0 to 1.0
 * 1.0 if correct, otherwise, partial point depending on how close it is...?
 * maxDistance is based on grid size
*/
export function scoreTile(tile, currentPos, solutionMap, gridSize) {
    const target = getTargetPosition(tile, solutionMap);
    if (!target) {
        return 0;
    }

    //match exactly
    if (positionKey(currentPos) === positionKey(target)) {
        return 1;
    }
    // partial score
    const [rows, cols] = Array.isArray(gridSize) ? gridSize : [6, 6];
    const maxDistance = (rows - 1) + (cols - 1);
  
    const dist = gridStepsBetween(currentPos, target);
    if (dist == null || maxDistance <= 0) return 0;
  
    // so for ex, dist = 0, the score is 1.0, dist = maxDistance, the score is 0.0
    const raw = 1 - dist / maxDistance;
    
    return Math.max(0, Math.min(1, raw));
}

/**
 *calculating progress percent
 * control wht tile types matter using focusTypes, but for now (Level 1), we will only count house and park
 * tilesDef = level.tiles
 * currentPlacements = Map(tileId -> [r,c]) or object { tileId: [r,c] }
*/
export function calculateProgressPercent({
    tilesDef = [],
    solutions = [],
    currentPlacements,
    gridSize,
    focusTypes = ["house", "park"]
}) {
    const solutionMap = buildSolutionMap(solutions);
    
    // this is helper to read current position from map / plain obj
    const getCurrentPos = (id) => {
        if (!currentPlacements) {
            return null;
        }
        if (currentPlacements instanceof Map) {
            return currentPlacements.get(id);
        }
        return currentPlacements[id];
    };
  
    // only score tiles we care, so for now, house and park
    const relevantTiles = tilesDef.filter((t) => focusTypes.includes(getTileType(t.name)));
  
    if (relevantTiles.length === 0) {
        return 0;
    }

    let totalScore = 0;
  
    for (const tile of relevantTiles) {
        // our tile objs use name but our solution ids use school-1, park-1, and etc, so
        //to avoid confusion, I'll store id as tile.name
        const tileObj = { ...tile, id: tile.name };
        const currentPos = getCurrentPos(tileObj.id);
        
        //if a tile has no currentPosition yet, treat as far or incorrect, so it's score is 0
        if (!Array.isArray(currentPos)) {
            totalScore += 0;
            continue;
        }
        totalScore += scoreTile(tileObj, currentPos, solutionMap, gridSize);
    }
    const percent = (totalScore / relevantTiles.length) * 100;
    return Math.round(percent);
}