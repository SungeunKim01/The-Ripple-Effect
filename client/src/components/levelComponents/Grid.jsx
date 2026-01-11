/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import Tile from './Tile.jsx';
import Palette from './Palette.jsx';
import House from '../../assets/images/house.png';
import Park from '../../assets/images/park.png';
import School from '../../assets/images/school.png';
import Factory from '../../assets/images/factory.png';
import WindTurbine from '../../assets/images/wind-turbine.png';
import NuclearPowerPlant from '../../assets/images/nuclear-power-plant.png';
import Recycle from '../../assets/images/recycle.png';
import Bus from '../../assets/images/bus.png';
import Skyscraper from '../../assets/images/skyscraper.png';
import Golf from '../../assets/images/golf.png';
import Garden from '../../assets/images/garden.png';
import Jet from '../../assets/images/jet.png';
import '../../styles/Grid.css';
import StatsBar from './StatsBar.jsx';



function Grid({ levelInfo, onLevelCompleteChange }) {
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
            case 'recycle': return Recycle;
            case 'bus': return Bus;
            case 'skyscraper': return Skyscraper;
            case 'golf': return Golf;
            case 'garden': return Garden;
            case 'jet': return Jet;
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
    // track whether we've just loaded the level so that the initial autosave doesn't overwrite persisted placements
    const initialLoadRef = useRef(false);

    // recompute counts whenever level definition changes (e.g., new tile types)
    useEffect(() => {
        const next = computeCounts();
        // console.debug so devs can see new counts when levels change
        console.debug("recomputed counts", next);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCounts(next);
    }, [levelTiles]);

    // base stats for the level (fallback to 40 if not provided)
    const BASE_STATS = levelInfo?.baseStats ?? { happiness: 10, environment: 40, economy: 40 };

    const [highlightedIds, setHighlightedIds] = useState([]);
    const [highlightCenter, setHighlightCenter] = useState(null);
    const [highlightType, setHighlightType] = useState(null); // 'positive' | 'negative' | null
    const RADIUS_MAP = { park: 1, school: 2, factory: 1, recycle: 1, bus: 3, powerplant: 2, windmill: 1, garden: 1, skyscraper: 3, jet: 3, golf: 0 };

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

    // --- Helpers: completed cookie (minimal) and saved placements (localStorage) ---
    const readCompletedFromCookie = () => {
        if (typeof document === 'undefined') return {};
        const name = 'game_progress=';
        const found = document.cookie.split('; ').find((c) => c.startsWith(name));
        if (!found) return {};
        const raw = found.split('=').slice(1).join('=');
        try {
            const parsed = JSON.parse(raw) || {};
            // normalize older formats: if cookie held { saved: ..., completed: {...} }
            if (parsed && typeof parsed === 'object') {
                if (parsed.completed && typeof parsed.completed === 'object') {
                    return parsed.completed;
                }
                // If top-level mapping already matches { "1": true, ... } return only boolean-true entries
                const filtered = {};
                for (const k of Object.keys(parsed)) {
                    if (parsed[k] === true) filtered[k] = true;
                }
                return filtered;
            }
            return {};
        } catch (err) {
            console.debug('Failed to parse game_progress cookie, resetting', err);
            return {};
        }
    };

    const writeCompletedToCookie = (completedObj) => {
        if (typeof document === 'undefined') return;
        try {
            const cookieName = 'game_progress';
            const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString(); // 1 year
            // only store the completed mapping as plain JSON, e.g. {"1":true}
            document.cookie = `${cookieName}=${JSON.stringify(completedObj)}; expires=${expires}; path=/; samesite=lax`;
        } catch (err) {
            console.error('Failed to write game_progress cookie', err);
        }
    };

    const readSavedFromStorage = () => {
        if (typeof window === 'undefined' || !window.localStorage) return {};
        try {
            const raw = window.localStorage.getItem('game_progress_saved');
            if (!raw) return {};
            return JSON.parse(raw) || {};
        } catch (err) {
            console.debug('Failed to parse saved progress from localStorage', err);
            return {};
        }
    };

    const writeSavedToStorage = (obj) => {
        if (typeof window === 'undefined' || !window.localStorage) return;
        try {
            window.localStorage.setItem('game_progress_saved', JSON.stringify(obj));
        } catch (err) {
            console.error('Failed to write saved progress to localStorage', err);
        }
    };

    // On navigation to a level page: clear any non-fixed tiles so the grid starts empty
    React.useEffect(() => {
        if (!levelInfo) return;
        const levelId = levelInfo?.id ?? levelInfo?.levelNumber;
        if (!levelId) return;

        // clear any non-fixed tiles so the grid appears empty on page navigation
        setTiles((prev) => prev.map((t) => (t.fixed ? t : { ...t, type: null, imgPath: null })));

        // recompute counts for the fresh grid
        const base = computeCounts();
        setCounts(base);

        // mark that we've just initialized and should skip the immediate autosave (to avoid overwriting saved placements)
        initialLoadRef.current = true;
    }, [levelInfo]);

    // derive stats from placed tiles and level definitions
    // eslint-disable-next-line react-hooks/preserve-manual-memoization
    const stats = React.useMemo(() => {
        let happiness = BASE_STATS.happiness ?? 10;
        let environment = BASE_STATS.environment ?? 40;
        let economy = BASE_STATS.economy ?? 40;

        // environment: always applied per placed tile using tile definition effect
        for (const t of tiles) {
            if (!t.type) continue;
            const def = levelTiles.find((lt) => lt.type === t.type);
            if (def && def.effect) {
                environment += def.effect.environment ?? 0;
            }
        }

        // happiness: parks/schools/factories/bus/recycle/garden/skyscraper/jet affect houses in radius; golf adds a global happiness bonus
        for (const t of tiles) {
            if (!t.type) continue;
            const def = levelTiles.find((lt) => lt.type === t.type);
            if (!def || !def.effect) continue;

            if (t.type === 'golf') {
                // golf: global happiness bonus regardless of position
                happiness += def.effect.happiness ?? 0;
            } else if (['park', 'school', 'factory', 'bus', 'recycle', 'powerplant', 'windmill', 'garden', 'skyscraper', 'jet'].includes(t.type)) {
                const radius = RADIUS_MAP[t.type] ?? 0;
                const affected = getAffectedHouseIds(t.id, radius);
                const perHouseHappiness = def.effect.happiness ?? 0;
                happiness += perHouseHappiness * affected.length;
            }
        }
        for (const t of tiles) {
            if (!t.type) continue;
            const def = levelTiles.find((lt) => lt.type === t.type);
            if (def && def.effect) {
                economy += def.effect.economy ?? 0;
            }
        }

        // clamp to [0,100]
        environment = Math.max(0, Math.min(100, environment));
        happiness = Math.max(0, Math.min(100, happiness));
        economy = Math.max(0, Math.min(100, economy));
        return { environment, happiness, economy };
    }, [tiles, levelTiles, BASE_STATS.happiness, BASE_STATS.environment, BASE_STATS.economy]);

    const [levelComplete, setLevelComplete] = useState(false);

    React.useEffect(() => {
        // require that there are no remaining tiles in the palette (all placed)
        const allPlaced = Object.values(counts).every((c) => c === 0);
        // debug values so we can see why completion may not trigger
        console.debug('completion check:', { allPlaced, environment: stats.environment, happiness: stats.happiness, economy: stats.economy, counts });
        // require Environment and Happiness >= 75 (economy not required for completion)
        setLevelComplete(allPlaced && stats.environment >= 75 && stats.happiness >= 75 && stats.economy >= 75);
    }, [stats.environment, stats.happiness, stats.economy, counts]);
    
    // tell LevelComponent so it can show the Next Level button
    useEffect(() => {
        if (typeof onLevelCompleteChange === 'function') {
            onLevelCompleteChange(levelComplete);
        }
    }, [levelComplete, onLevelCompleteChange]);
    
    // When a level becomes complete, mark it in the `game_progress` cookie (completed mapping only) and also persist saved state to localStorage
    React.useEffect(() => {
        if (!levelComplete) return;
        const levelId = levelInfo?.id ?? levelInfo?.levelNumber ?? null;
        if (!levelId) return;

        // update cookie with minimal map { "1": true, "2": true }
        const current = readCompletedFromCookie();
        // mark this level completed
        current[String(levelId)] = true;
        // also unlock the next level (e.g., completing 1 unlocks 2)
        const nextLevel = String(Number(levelId) + 1);
        current[nextLevel] = true;

        // delete existing cookie then recreate it to avoid legacy payloads
        const deleteCookie = (name) => {
            try {
                document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=lax`;
            } catch (err) {
                console.error('Failed to delete cookie', err);
            }
        };
        console.debug('Deleting existing game_progress cookie (before):', document.cookie);
        deleteCookie('game_progress');
        console.debug('After deletion:', document.cookie);

        // write new minimal mapping
        writeCompletedToCookie(current);
        console.debug('Recreated game_progress cookie (after):', document.cookie);

        // also persist saved info to localStorage for restoration (not in cookie)
        const savedAll = readSavedFromStorage();
        savedAll[String(levelId)] = savedAll[String(levelId)] || {};
        savedAll[String(levelId)].completed = true;
        writeSavedToStorage(savedAll);
    }, [levelComplete, levelInfo, tiles, counts]);


    const clearHighlights = () => {
        setHighlightedIds([]);
        setHighlightCenter(null);
        setHighlightType(null);
    };

    // persist placements (and counts) to localStorage on any change so user can return later; cookie only stores completed map
    React.useEffect(() => {
        if (!levelInfo) return;
        const levelId = levelInfo?.id ?? levelInfo?.levelNumber ?? null;
        if (!levelId) return;

        // If we just loaded the level (navigation), skip the first autosave so that we don't overwrite any persisted placements
        if (initialLoadRef.current) {
            initialLoadRef.current = false;
            console.debug('Skipped initial autosave after level load for', levelId);
            return;
        }

        const savedAll = readSavedFromStorage();
        savedAll[String(levelId)] = savedAll[String(levelId)] || {};

        // store non-fixed tile placements
        const placements = {};
        tiles.forEach((t) => {
            if (!t || !t.type) return;
            if (t.fixed) return; // don't save fixed placements
            placements[t.id] = t.type;
        });
        savedAll[String(levelId)].placements = placements;
        savedAll[String(levelId)].counts = counts;
        savedAll[String(levelId)].lastSaved = Date.now();

        writeSavedToStorage(savedAll);
        // debug log to confirm
        console.debug('saved progress (localStorage) for level', levelId, savedAll[String(levelId)]);
    }, [tiles, counts, levelInfo]);

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
            if (['park', 'school', 'factory', 'bus', 'recycle', 'powerplant', 'windmill', 'garden', 'skyscraper', 'jet'].includes(rType)) {
                const radius = RADIUS_MAP[rType];
                const ids = getAffectedHouseIds(tileEl.id, radius);
                setHighlightedIds(ids);
                // negative impact types
                setHighlightType((['factory', 'powerplant', 'skyscraper', 'jet'].includes(rType)) ? 'negative' : 'positive');
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
            if (['park', 'school', 'factory', 'bus', 'recycle', 'powerplant', 'windmill', 'garden', 'skyscraper', 'jet'].includes(rType)) {
                const radius = RADIUS_MAP[rType];
                const ids = getAffectedHouseIds(tile?.id, radius);
                setHighlightedIds(ids);
                setHighlightType((['factory', 'powerplant', 'skyscraper', 'jet'].includes(rType)) ? 'negative' : 'positive');
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

            // if clicking on park/school/factory/bus/recycle on the grid, show effected houses
            if (type === 'park' || type === 'school' || type === 'factory' || type === 'bus' || type === 'recycle') {
                const radius = RADIUS_MAP[type];
                // toggle if same center
                if (highlightCenter === tileEl.id) {
                    clearHighlights();
                    return;
                }
                const ids = getAffectedHouseIds(tileEl.id, radius);
                setHighlightedIds(ids);
                setHighlightCenter(tileEl.id);
                setHighlightType(type === 'factory' ? 'negative' : 'positive');
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
        
            <section className='grid-section'>
                <div className="tiles" id='tiles' onDragOver={handleDragOver} onDrop={handleDrop} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onClick={handleClick} >
                    {tiles.map((tile) => (
                        <Tile key={tile.id} id={tile.id} type={tile.type} imgPath={tile.imgPath} fixed={tile.fixed} highlighted={highlightedIds.includes(tile.id) ? highlightType : false} />
                    ))}
                </div>
                <Palette counts={counts} />
                <div className="stats-container">
                    {levelInfo.id == 1 && 
                        <StatsBar happiness={stats.happiness} environment={stats.environment} />
                    }

                {levelInfo.id > 1 && 
                    <StatsBar happiness={stats.happiness} environment={stats.environment} economy={stats.economy} />
                }
                {levelComplete && (
                    <div className="level-complete">
                        {levelInfo?.id === 1
                            ? "✅ Level Complete! Environment, Happiness ≥ 75"
                            : "✅ Level Complete! Environment, Happiness, Economy ≥ 75"}
                    </div>
                )}
            </div>
        </section>
    );
}

export default Grid;