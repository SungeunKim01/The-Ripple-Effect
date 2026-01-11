import React from 'react';
import House from '../../assets/images/house.png';
import Park from '../../assets/images/park.png';
import School from '../../assets/images/school.png';
import Factory from '../../assets/images/factory.png';
import '../../styles/grid.css';

const items = [
    { type: 'house', imgPath: House },
    { type: 'school', imgPath: School },
    { type: 'park', imgPath: Park },
    { type: 'factory', imgPath: Factory },
];

function Palette({ counts = {} }) {
    const handleDragStart = (e, item) => {
        const payload = { ...item, originId: null };
        e.dataTransfer.setData('application/json', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <aside class="palette" id="palette">
            <h3>Palette</h3>
            <div className="palette-items">
                {items.map((it) => {
                    const available = counts[it.type] ?? 0;
                    const disabled = available <= 0;
                    return (
                        <div key={it.type} className={`palette-item ${disabled ? 'disabled' : ''}`} draggable={!disabled} onDragStart={(e) => !disabled && handleDragStart(e, it)}>
                            <img src={it.imgPath} alt={it.type} width={40} />
                            <div className="palette-label">{it.type} <span className="palette-count">{available}</span></div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}

export default Palette;
