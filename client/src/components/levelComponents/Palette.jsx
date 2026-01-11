import React from 'react';
import House from '../../assets/images/house.png';
import Park from '../../assets/images/park.png';
import School from '../../assets/images/school.png';
import Factory from '../../assets/images/factory.png';
import WindTurbine from '../../assets/images/wind-turbine.png';
import NuclearPowerPlant from '../../assets/images/nuclear-power-plant.png';
import Recycle from '../../assets/images/recycle.png';
import Bus from '../../assets/images/bus.png';
import SkyScraper from '../../assets/images/skyscraper.png';
import Golf from '../../assets/images/golf.png';
import Jet from '../../assets/images/jet.png';
import Garden from '../../assets/images/garden.png';
import '../../styles/Grid.css';

const items = [
    { type: 'house', imgPath: House, label: 'House' },
    { type: 'school', imgPath: School, label: 'School' },
    { type: 'park', imgPath: Park, label: 'Park' },
    { type: 'factory', imgPath: Factory, label: 'Factory' },
    { type: 'windmill', imgPath: WindTurbine, label: 'Windmill' },
    { type: 'powerplant', imgPath: NuclearPowerPlant, label: 'Power Plant' },
    { type: 'recycle', imgPath: Recycle, label: 'Recycle' },
    { type: 'bus', imgPath: Bus, label: 'Bus' },
    { type: 'skyscraper', imgPath: SkyScraper, label: 'Skyscraper' },
    { type: 'golf', imgPath: Golf, label: 'Golf Course' },
    { type: 'jet', imgPath: Jet, label: 'Jet' },
    { type: 'garden', imgPath: Garden, label: 'Garden' },
];

function Palette({ counts = {} }) {
    const handleDragStart = (e, item) => {
        const payload = { ...item, originId: null };
        e.dataTransfer.setData('application/json', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copy';
    };

    // 1. Get a list of tile types that are actually used in this level
    // This includes types that are currently 0 but WERE in the counts object initially
    const activeLevelTypes = Object.keys(counts);

    return (
        <aside className="palette" id="palette">
            <h3>Drag & Drop the tiles</h3>
            <div className="palette-items">
                {items
                    // 2. Filter the items list to only show types present in 'counts'
                    .filter((it) => activeLevelTypes.includes(it.type))
                    .map((it) => {
                        const available = counts[it.type] ?? 0;
                        const disabled = available <= 0;
                        
                        return (
                            <div 
                                key={it.type} 
                                className={`palette-item ${disabled ? 'disabled' : ''}`} 
                                draggable={!disabled} 
                                onDragStart={(e) => !disabled && handleDragStart(e, it)}
                            >
                                <img src={it.imgPath} alt={it.type} width={40} />
                                <div className="palette-label">
                                    {it.label ?? it.type} 
                                    <span className="palette-count">({available})</span>
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        </aside>
    );
}

export default Palette;
