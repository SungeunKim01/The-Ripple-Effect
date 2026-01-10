import React, { useState } from 'react';
import Tile from './Tile.jsx';
import Palette from './Palette.jsx';
import House from '../../assets/images/house.png';
import '../../styles/grid.css';
import StatsBar from './StatsBar.jsx';

function Grid() {
    const size = 6;

    const initialTiles = Array.from({ length: size * size }).map((_, i) => ({
        id: `tile-${i + 1}`,
        type: null,
        imgPath: null,
    }));

    const [tiles, setTiles] = useState(initialTiles);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDragEnter = (e) => {
        const tile = e.target.closest('.tile');
        if (tile) tile.classList.add('drag-over');
    };

    const handleDragLeave = (e) => {
        const tile = e.target.closest('.tile');
        if (tile) tile.classList.remove('drag-over');
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

        setTiles((prev) => prev.map((t) => {
            // Place payload into target
            if (t.id === targetId) return { ...t, type: payload.type, imgPath: payload.imgPath };
            // If this came from another tile (originId), clear the origin tile
            if (payload.originId && t.id === payload.originId && payload.originId !== targetId) return { ...t, type: null, imgPath: null };
            return t;
        }));

        tileEl.classList.remove('drag-over');
    };

    const handleClick = (e) => {
        if (e.target && e.target.matches('img')) {
            const tile = e.target.parentNode;
            console.log(`Tile ID: ${tile.id}, Type: ${tile.getAttribute('data-type')}`);
        }
    }; 

    return ( 
        <section className='grid-section'>
            <div className="tiles" id='tiles' onDragOver={handleDragOver} onDrop={handleDrop} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave} onClick={handleClick} >
                {tiles.map((tile) => (
                    <Tile key={tile.id} id={tile.id} type={tile.type} imgPath={tile.imgPath} />
                ))}
            </div>

            <Palette />
            <StatsBar happiness="40" environment="40"/>


        </section>
    );
}

export default Grid;