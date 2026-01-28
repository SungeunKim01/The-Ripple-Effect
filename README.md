# The Ripple Effect

## Overview
The Ripple Effect is a grid-based strategy game built during GameJam 2026. Players place buildings and infrastructure on a grid, where each action creates positive or negative ripple effects on the environment, economy, and happiness.
The game focuses on decision-making, trade-offs, and long-term impact rather than speed or combat.

## Game Jam Project
This project was conceptualized and developed during a Game Jam (Dingo Cegep Game Jam). The focus was on engineering a playable game within a strict 48-hour timeframe following a given theme ("A Better World").

## Features
* **Ripple System:** Real-time radius calculations to show how buildings like Schools or Factories affect residents.
* **Radius Visualization:**
   * All Browsers: Click a tile to see its active radius of influence on resident's happiness.
   * Firefox Exclusive: Real-time hover highlights, providing instant feedback on happiness impact before placement
* **Interactive Grid:** Drag-and-drop mechanics with hover-previews and invalid-drop animations.
* **Live Stats Engine:** A dynamic balancing system that calculates Happiness, Environment, and Economy based on tile placement and global level modifiers.
* **Progressive Difficulty:** 5 unique levels that introduce new tiles almost every level (Bus Stops, Power Plants, Factories, Golf Courses) which each have different effects.
* **Save & Resume:** Browser cookies to track level unlock progression.

## Tech Stack
* React.js
* Vite
* CSS3

## How to run
1. Clone the repository
   `https://github.com/SungeunKim01/The-Ripple-Effect.git`
   
2. Install dependencies
   
   ` cd client; npm install`
   
4. Run the project
   - To run in development mode: `npm run dev`
   - To run in production mode: `npm run build; npm run preview`
   
9. Navigate to local URL provided in your terminal __(usually `http://localhost:5173` for development mode, and `http://localhost:4173` for production mode)__

## Attributions & Acknowledgements
* Icons & Images: [The Thiings Collection](https://www.thiings.co/things)
* Co-developers: [Ash Rebelo](https://github.com/ashrebelo) & [MelaniaChiru](https://github.com/MelaniaChiru)
