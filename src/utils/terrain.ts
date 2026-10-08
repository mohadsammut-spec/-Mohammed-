import { TerrainCell, TerrainType, DisasterSector, WeatherType } from '../types/game';

export function generateSectorGrid(mission: DisasterSector): TerrainCell[][] {
  const { gridWidth, gridHeight, id } = mission;
  const grid: TerrainCell[][] = [];

  for (let y = 0; y < gridHeight; y++) {
    const row: TerrainCell[] = [];
    for (let x = 0; x < gridWidth; x++) {
      let type: TerrainType = 'rocky_ground';
      let elevation = 4;
      let waterLevel = 0;
      let mudSaturation = 20;
      let debrisHealth = 0;
      let hasSurvivor = false;
      let survivorHealth = 100;
      let survivorName = undefined;

      // Base safe zone & depot on bottom-left / left side
      if (x <= 2 && y >= gridHeight - 3) {
        type = (x === 0 && y === gridHeight - 1) ? 'safe_haven' : 'compacted_road';
        elevation = 3;
        mudSaturation = 0;
      }
      // Top right is usually the disaster epicentre or destination
      else if (x === gridWidth - 1 && y <= 2) {
        type = 'safe_haven';
        elevation = 3;
        mudSaturation = 0;
      }

      // Mission-specific procedural layouts
      if (id === 'mission_1') {
        // Mudslide Valley
        // Highway runs from left (y=7) diagonally to top right (y=2, x=13)
        const isHighwayPath = Math.abs((y - 7) + (x * 0.4)) < 1.2;
        if (isHighwayPath) {
          type = 'collapsed_road';
          mudSaturation = 65;
          elevation = 3;
        }

        // Landslide rubble piles right across the middle
        if (x >= 4 && x <= 9 && y >= 3 && y <= 6) {
          type = 'rubble_pile';
          debrisHealth = 100;
          elevation = 6;
          mudSaturation = 70;
        }

        // Deep mud pools around the landslide
        if ((x === 5 || x === 6 || x === 8) && (y === 6 || y === 7)) {
          type = 'deep_mud';
          mudSaturation = 95;
          elevation = 2;
        }

        // Trapped civilian vehicle / survivors
        if ((x === 6 && y === 5) || (x === 8 && y === 4) || (x === 10 && y === 3) || (x === 5 && y === 7)) {
          hasSurvivor = true;
          survivorName = `عالق #${x}`;
        }
      } 
      else if (id === 'mission_2') {
        // Emerald Dam Breach & Flood
        // River flowing from top middle (x=5..7, y=0) toward bottom right
        if ((x >= 5 && x <= 7 && y <= 4) || (x >= 7 && x <= 10 && y >= 4 && y <= 7)) {
          type = 'water';
          waterLevel = 80;
          mudSaturation = 100;
          elevation = 1;
        } else if (x >= 3 && x <= 8 && y >= 4 && y <= 6) {
          type = 'deep_mud';
          mudSaturation = 90;
          elevation = 2;
        } else if (x >= 8 && y >= 2 && y <= 4) {
          type = 'rocky_ground';
          elevation = 5;
        }

        // Precast concrete rubble near dam wall
        if ((x === 5 && y === 1) || (x === 6 && y === 2) || (x === 7 && y === 1)) {
          type = 'concrete_slab';
          debrisHealth = 120;
          elevation = 3;
        }

        // Survivors on high mounds surrounded by water
        if ((x === 4 && y === 4) || (x === 8 && y === 5) || (x === 9 && y === 3) || (x === 11 && y === 6) || (x === 3 && y === 2)) {
          hasSurvivor = true;
          type = 'survivor_zone';
          elevation = 4;
          survivorName = `قروي معزول #${x}`;
        }
      }
      else if (id === 'mission_3') {
        // Seismic Metropolis
        // Deep fissure / chasm running vertically in the middle (x=6, x=7)
        if (x === 6 || x === 7) {
          type = 'water'; // deep ravine
          elevation = 0;
          waterLevel = 40;
        }

        // Huge collapsed concrete slabs
        if ((x === 5 && y === 3) || (x === 5 && y === 5) || (x === 8 && y === 4) || (x === 8 && y === 6)) {
          type = 'concrete_slab';
          debrisHealth = 150;
          elevation = 5;
        }

        // Rubble everywhere
        if ((x === 3 && y === 2) || (x === 9 && y === 7) || (x === 10 && y === 2) || (x === 4 && y === 7)) {
          type = 'rubble_pile';
          debrisHealth = 90;
        }

        // Survivors
        if ((x === 4 && y === 3) || (x === 5 && y === 6) || (x === 8 && y === 3) || (x === 9 && y === 5) || (x === 11 && y === 2) || (x === 10 && y === 7)) {
          hasSurvivor = true;
          survivorName = `ناجٍ تحت الأنقاض #${x}`;
        }
      }
      else if (id === 'mission_4') {
        // Black Ridge Mountain
        elevation = Math.floor((14 - x) * 0.6 + y * 0.4);
        if (x >= 4 && x <= 8 && y >= 3 && y <= 7) {
          type = (x + y) % 2 === 0 ? 'deep_mud' : 'rubble_pile';
          debrisHealth = 100;
          mudSaturation = 90;
        }
        if ((x === 5 && y === 4) || (x === 7 && y === 5) || (x === 9 && y === 3) || (x === 6 && y === 7) || (x === 10 && y === 6)) {
          hasSurvivor = true;
          survivorName = `فريق رصد #${x}`;
        }
      }
      else {
        // The Great Levee: Final Frontier
        if (x >= 6 && x <= 8) {
          type = 'water';
          waterLevel = 90;
          elevation = 1;
        } else if (x <= 5 && y >= 3 && y <= 6) {
          type = 'deep_mud';
          mudSaturation = 95;
          elevation = 2;
        } else if (x >= 9 && (y === 2 || y === 4 || y === 6)) {
          type = 'rubble_pile';
          debrisHealth = 110;
        }

        if ((x === 3 && y === 3) || (x === 4 && y === 5) || (x === 5 && y === 2) || (x === 9 && y === 3) || (x === 10 && y === 5) || (x === 11 && y === 4) || (x === 2 && y === 6) || (x === 12 && y === 6)) {
          hasSurvivor = true;
          survivorName = `مواطن محاصر #${x}`;
        }
      }

      row.push({
        x,
        y,
        type,
        elevation,
        waterLevel,
        mudSaturation,
        debrisHealth,
        hasSurvivor,
        survivorHealth,
        survivorName,
        isTargeted: false,
        isLit: !mission.initialWeather.includes('night'),
      });
    }
    grid.push(row);
  }

  return grid;
}

// Simulates water and mud physics dynamic tick
export function stepPhysics(grid: TerrainCell[][], weather: WeatherType): {
  grid: TerrainCell[][];
  floodedCount: number;
  muddyCount: number;
} {
  const height = grid.length;
  const width = grid[0].length;
  const nextGrid = grid.map(row => row.map(cell => ({ ...cell })));
  let floodedCount = 0;
  let muddyCount = 0;

  const isRaining = weather === 'rain' || weather === 'torrential_storm' || weather === 'night_storm';
  const stormIntensity = weather === 'torrential_storm' ? 4 : isRaining ? 2 : 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const current = grid[y][x];
      const target = nextGrid[y][x];

      // If raining, increase mud and water
      if (isRaining && target.type !== 'compacted_road' && target.type !== 'bridge_structure' && target.type !== 'levee_barrier' && target.type !== 'safe_haven') {
        target.mudSaturation = Math.min(100, target.mudSaturation + stormIntensity * 1.5);
        if (target.mudSaturation > 80 && target.type === 'rocky_ground') {
          target.type = 'mud';
        } else if (target.mudSaturation > 92 && target.type === 'mud') {
          target.type = 'deep_mud';
        }
      }

      // Water spreading to lower elevation adjacent cells unless blocked by levee
      if (current.type === 'water' || current.waterLevel > 30) {
        floodedCount++;
        const neighbors = [
          { nx: x + 1, ny: y },
          { nx: x - 1, ny: y },
          { nx: x, ny: y + 1 },
          { nx: x, ny: y - 1 },
        ];

        for (const { nx, ny } of neighbors) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nCell = nextGrid[ny][nx];
            // If neighbor is levee barrier, it resists water!
            if (nCell.type === 'levee_barrier') continue;

            // Water spreads to lower elevation or already wet cells
            if (nCell.elevation <= current.elevation && nCell.type !== 'safe_haven') {
              if (isRaining && current.waterLevel > 60) {
                nCell.waterLevel = Math.min(100, nCell.waterLevel + 12);
                if (nCell.waterLevel > 50 && nCell.type !== 'bridge_structure') {
                  nCell.type = 'water';
                }
              }
            }
          }
        }
      }

      if (target.type === 'mud' || target.type === 'deep_mud') {
        muddyCount++;
      }

      // Check survivor peril in water
      if (target.hasSurvivor && target.type === 'water') {
        target.survivorHealth = Math.max(0, (target.survivorHealth ?? 100) - 2);
      }
    }
  }

  return { grid: nextGrid, floodedCount, muddyCount };
}
