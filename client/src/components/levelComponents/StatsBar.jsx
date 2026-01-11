import React from 'react';
import '../../styles/StatsBar.css'
import Happy from '../../assets/icons/happy.png';
import Environment from '../../assets/icons/environment.png';
import Economy from '../../assets/icons/economy.png';

const StatsBar = ({ happiness=-1, environment=-1, economy=-1 }) => {
  return (
    <div className="stats-container">
      {/* Happiness Stat */}
      <div className="stat-item">
        <div className="stat-header">
			<span className="stat-label stat-label--happy"> 
				<img src={Happy} alt="Smiling Emoji " />
				Happiness
			</span>
			<span className="stat-value">{Math.round(happiness)}</span>
        </div>
        <div className="progress-track">
          {/* The Target Win Zone Marker */}
          <div className="win-zone-marker"></div>
          {/* The Actual Progress Fill */}
          <div 
            className={`progress-fill happiness-fill ${happiness > 80 ? 'over-optimized' : ''}`} 
            style={{ width: `${happiness}%` }}
          ></div>
        </div>
      </div>

      {/* Environment Stat */}
      <div className="stat-item">
        <div className="stat-header">
          <span className="stat-label"> 
				<img src={Environment} alt="Green Earth" />
				Environment
			</span>
          <span className="stat-value">{Math.round(environment)}</span>
        </div>
        <div className="progress-track">
          <div className="win-zone-marker"></div>
          <div 
            className={`progress-fill environment-fill ${environment > 80 ? 'over-optimized' : ''}`} 
            style={{ width: `${environment}%` }}
          ></div>
        </div>
      </div>
    
    {/* Economy Stat */}
    {economy >= 0 && (
      <div className="stat-item">
        <div className="stat-header">
          <span className="stat-label"> 
            <img src={Economy} alt="Economy Icon" />
            Economy
          </span>
            <span className="stat-value">{Math.round(economy)}</span>
          </div>
          <div className="progress-track">
            <div className="win-zone-marker"></div>
            <div 
              className={`progress-fill economy-fill ${economy > 80 ? 'over-optimized' : ''}`} 
              style={{ width: `${economy}%` }}
            ></div>
          </div>
      </div>
    )}
    </div>
  );
};

export default StatsBar;