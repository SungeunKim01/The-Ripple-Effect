import React, { useState } from 'react';
import Tile from './Tile.jsx';
import Palette from './Palette.jsx';
import House from '../../assets/images/house.png';
import Park from '../../assets/images/park.png';
import School from '../../assets/images/school.png';
import Factory from '../../assets/images/factory.png';
import WindTurbine from '../../assets/images/wind-turbine.png';
import NuclearPowerPlant from '../../assets/images/nuclear-power-plant.png';
import '../../styles/grid.css';
import StatsBar from './StatsBar.jsx';

function Grid({levelInfo}) {
    const GRID_SIZE = 6; // grid is always 6x6 per requirements
    const rows = GRID_SIZE;
    const cols = GRID_SIZE;

    // Build initial tiles with pre-placed (fixed) tiles from levelInfo
    const initialTiles = Array.from({ length: rows * cols }).map((_, i) => ({
        id: `tile-${i + 1}`,
        type: null,
        imgPath: null,
        fixed: false,
    }));

    // Place pre-placed tiles according to levelInfo.tiles positions
    const levelTiles = levelInfo?.tiles || [];

    // Map type -> number of available (unplaced) tiles
    const computeCounts = () => {
        const counts = {};
        for (const t of levelTiles) {
            const type = t.type;
            const pos = t.position || { r: -1, c: -1 };
            const r = pos.r ?? -1;
            const c = pos.c ?? -1;
            // treat as available if not placed within the 6x6 grid
            if (r < 1 || c < 1 || r > GRID_SIZE || c > GRID_SIZE) {
                counts[type] = (counts[type] || 0) + 1; // available to be placed
            }
        }
        return counts;
    }; 

    // helper to map a type to an image asset (fallback to House)
    const getImageForType = (type) => {
        switch (type) {
            case 'house': return House;
            case 'park': return Park;
            case 'school': return School;
            case 'factory': return Factory;
            case 'windmill': return WindTurbine;
            case 'powerplant': return NuclearPowerPlant;
            default: return House;
        }
    };

    const seededTiles = initialTiles.map((cell, idx) => {
        const r = Math.floor(idx / cols) + 1;
        const c = (idx % cols) + 1;
        // find a level tile that has this position
        const match = levelTiles.find((lt) => (lt.position?.r === r && lt.position?.c === c));
        if (match) {
            return {
                ...cell,
                type: match.type,
                imgPath: getImageForType(match.type),
                fixed: true,
            };
        }
        return cell;
    });

    const [tiles, setTiles] = useState(seededTiles);
    const [counts, setCounts] = useState(computeCounts());

    // base stats for the level (fallback to 40 if not provided)
    const BASE_STATS = levelInfo?.baseStats ?? { happiness: 40, environment: 40 };

    const [highlightedIds, setHighlightedIds] = useState([]);
    const [highlightCenter, setHighlightCenter] = useState(null);
    const RADIUS_MAP = { park: 1, school: 2 };

    const getPosFromId = (id) => {
        const idx = Number(id.split('-')[1]) - 1;
        return { r: Math.floor(idx / cols) + 1, c: (idx % cols) + 1 };
    };

    const getAffectedHouseIds = (centerId, radius) => {
        if (!centerId) return [];
        const center = getPosFromId(centerId);
        const ids = [];
        tiles.forEach((t) => {
            if (t.type !== 'house') return;
            const pos = getPosFromId(t.id);
            const dist = Math.abs(pos.r - center.r) + Math.abs(pos.c - center.c); // Manhattan distance
            if (dist <= radius) ids.push(t.id);
        });
        return ids;
    };

    // derive stats from placed tiles and level definitions
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const stats = React.useMemo(() => {
        let happiness = BASE_STATS.happiness ?? 40;
        let environment = BASE_STATS.environment ?? 40;

        // environment: always applied per placed tile using tile definition effect
        for (const t of tiles) {
            if (!t.type) continue;
            const def = levelTiles.find((lt) => lt.type === t.type);
            if (def && def.effect) {
                environment += def.effect.environment ?? 0;
            }
        }

        // happiness: only from parks and schools and only counts houses in their radius
        for (const t of tiles) {
            if (!t.type) continue;
            if (t.type === 'park' || t.type === 'school') {
                const def = levelTiles.find((lt) => lt.type === t.type);
                if (def && def.effect) {
                    const radius = RADIUS_MAP[t.type] ?? 0;
                    const affected = getAffectedHouseIds(t.id, radius);
                    const perHouse = def.effect.happiness ?? 0;
                    // add per-house happiness for each affected house
                    happiness += perHouse * affected.length;
                }
            }
        }

        // clamp to [0,100]
        environment = Math.max(0, Math.min(100, environment));
        happiness = Math.max(0, Math.min(100, happiness));
        return { environment, happiness };
    }, [tiles, levelTiles, BASE_STATS.happiness, BASE_STATS.environment]);

    const [levelComplete, setLevelComplete] = useState(false);

    React.useEffect(() => {
        // require that there are no remaining tiles in the palette (all placed)
        const allPlaced = Object.values(counts).every((c) => c === 0);
        setLevelComplete(allPlaced && stats.environment >= 70 && stats.happiness >= 70);
    }, [stats.environment, stats.happiness, counts]);



    const clearHighlights = () => {
        setHighlightedIds([]);
        setHighlightCenter(null);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        // also update hover preview while moving
        const tileEl = e.target.closest('.tile');
        if (!tileEl) return;
        try {
            const data = e.dataTransfer.getData('application/json');
            if (!data) return;
            const payload = JSON.parse(data);
            const rType = payload.type;
            if (rType === 'park' || rType === 'school') {
                const radius = RADIUS_MAP[rType];
                const ids = getAffectedHouseIds(tileEl.id, radius);
                setHighlightedIds(ids);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragEnter = (e) => {
        const tile = e.target.closest('.tile');
        if (tile) tile.classList.add('drag-over');
        // compute and show radius preview if dragging a park/school
        try {
            const data = e.dataTransfer.getData('application/json');
            if (!data) return;
            const payload = JSON.parse(data);
            const rType = payload.type;
            if (rType === 'park' || rType === 'school') {
                const radius = RADIUS_MAP[rType];
                const ids = getAffectedHouseIds(tile?.id, radius);
                setHighlightedIds(ids);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDragLeave = (e) => {
        const tile = e.target.closest('.tile');
        if (tile) tile.classList.remove('drag-over');
        // clear preview
        clearHighlights();
    };

    const flashInvalid = (tileEl) => {
        if (!tileEl) return;
        tileEl.classList.add('invalid-drop');
        setTimeout(() => tileEl.classList.remove('invalid-drop'), 300);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const data = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text');
        let payload;
        try {
            payload = JSON.parse(data);
        } catch (err) {
            payload = { type: data, error: err };
        }
        const tileEl = e.target.closest('.tile');
        if (!tileEl) return;
        const targetId = tileEl.id;

        // prevent dropping onto fixed tile
        const targetTile = tiles.find((t) => t.id === targetId);
        if (targetTile?.fixed) {
            flashInvalid(tileEl);
            tileEl.classList.remove('drag-over');
            clearHighlights();
            return;
        }

        // if coming from palette (originId === null) -> copy, must have counts
        if (payload.originId === null || payload.originId === undefined) {
            const available = counts[payload.type] || 0;
            if (available <= 0) {
                flashInvalid(tileEl);
                tileEl.classList.remove('drag-over');
                clearHighlights();
                return;
            }

            // if target has an existing non-fixed tile, return it to counts
            const previousType = targetTile?.type;
            setTiles((prev) => prev.map((t) => (t.id === targetId ? { ...t, type: payload.type, imgPath: payload.imgPath ?? getImageForType(payload.type) } : t)));

            setCounts((prev) => {
                const next = { ...prev, [payload.type]: (prev[payload.type] || 1) - 1 };
                if (previousType) next[previousType] = (next[previousType] || 0) + 1;
                return next;
            });

        } else {
            // moving from another tile within the grid
            const originId = payload.originId;
            if (originId === targetId) {
                tileEl.classList.remove('drag-over');
                clearHighlights();
                return;
            }

            setTiles((prev) => prev.map((t) => {
                const originTile = prev.find((p) => p.id === originId);
                const targetTileLocal = prev.find((p) => p.id === targetId);

                // swap types between origin and target
                if (t.id === targetId) return { ...t, type: originTile?.type ?? null, imgPath: originTile?.imgPath ?? null };
                if (t.id === originId) return { ...t, type: targetTileLocal?.type ?? null, imgPath: targetTileLocal?.imgPath ?? null };
                return t;
            }));
        }

        tileEl.classList.remove('drag-over');
        clearHighlights();
    };

    const handleClick = (e) => {
        if (e.target && e.target.matches('img')) {
            const tileEl = e.target.parentNode;
            const type = tileEl.getAttribute('data-type');

            // if clicking on park/school on the grid, show effected houses
            if (type === 'park' || type === 'school') {
                const radius = RADIUS_MAP[type];
                // toggle if same center
                if (highlightCenter === tileEl.id) {
                    clearHighlights();
                    return;
                }
                const ids = getAffectedHouseIds(tileEl.id, radius);
                setHighlightedIds(ids);
                setHighlightCenter(tileEl.id);
                return;
            }

            // otherwise log click and clear highlights
            const tile = tileEl;
            console.log(`Tile ID: ${tile.id}, Type: ${tile.getAttribute('data-type')}`);
            clearHighlights();
        } else {
            // click outside tiles clears highlight
            clearHighlights();
        }
    };

    return ( 
        <section class='grid-section'>
            <div className="tiles" id='tiles' onDragOver={handleDragOver} onDrop={handleDrop} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onClick={handleClick} >
                {tiles.map((tile) => (
                    <Tile key={tile.id} id={tile.id} type={tile.type} imgPath={tile.imgPath} fixed={tile.fixed} highlighted={highlightedIds.includes(tile.id)} />
                ))}
            </div>
            <Palette counts={counts} />
            <div className="stats-container">
                <StatsBar happiness={stats.happiness} environment={stats.environment} />
                {levelComplete && (
                    <div className="level-complete">✅ Level Complete! Both Environment and Happiness ≥ 70</div>
                )}
            </div>
        </section>
    );
}

export default Grid;