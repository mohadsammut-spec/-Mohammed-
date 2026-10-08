import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Machine, 
  TerrainCell, 
  WeatherType, 
  Language 
} from '../types/game';
import { soundManager } from '../utils/audio';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  type: 'rain' | 'dust' | 'mud' | 'smoke' | 'spark' | 'water_splash';
}

interface SimulationCanvasProps {
  grid: TerrainCell[][];
  vehicles: Machine[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  onCellAction: (x: number, y: number) => void;
  weather: WeatherType;
  lang: Language;
  onVehicleStuck?: (vehicleId: string) => void;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  grid,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  onCellAction,
  weather,
  lang,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const tickCounter = useRef<number>(0);

  const CELL_SIZE = 64; // pixels per grid cell
  const gridWidth = grid[0]?.length || 14;
  const gridHeight = grid.length || 10;
  const canvasWidth = gridWidth * CELL_SIZE;
  const canvasHeight = gridHeight * CELL_SIZE;

  // Emit visual particles
  const spawnParticles = useCallback((x: number, y: number, type: 'dust' | 'mud' | 'water_splash' | 'spark' | 'smoke', count = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 0.5;
      let color = '#a8a29e';
      if (type === 'mud') color = '#78350f';
      if (type === 'water_splash') color = '#38bdf8';
      if (type === 'spark') color = '#facc15';
      if (type === 'smoke') color = 'rgba(100, 100, 100, 0.4)';

      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'smoke' ? 1.2 : 0),
        life: 1.0,
        maxLife: Math.random() * 25 + 15,
        color,
        size: Math.random() * 3 + 2,
        type,
      });
    }
  }, []);

  // Main rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    const render = () => {
      if (!isRunning) return;
      tickCounter.current++;
      const t = tickCounter.current;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // 1. Draw Terrain Cells
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const cell = grid[y][x];
          const px = x * CELL_SIZE;
          const py = y * CELL_SIZE;

          // Base cell background based on terrain
          ctx.save();
          if (cell.type === 'rocky_ground') {
            ctx.fillStyle = '#44403c';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            // Rocky texture lines
            ctx.strokeStyle = '#292524';
            ctx.lineWidth = 1;
            ctx.strokeRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            ctx.fillStyle = '#57534e';
            ctx.beginPath();
            ctx.arc(px + 16, py + 22, 3, 0, Math.PI * 2);
            ctx.arc(px + 45, py + 40, 4, 0, Math.PI * 2);
            ctx.fill();
          } 
          else if (cell.type === 'mud' || cell.type === 'deep_mud') {
            const isDeep = cell.type === 'deep_mud';
            ctx.fillStyle = isDeep ? '#3b1d0c' : '#572c13';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            
            // Mud ripples & wet sheen
            ctx.strokeStyle = isDeep ? '#271207' : '#452310';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px + 20, py + 30, 10, 0, Math.PI);
            ctx.arc(px + 45, py + 20, 12, 0, Math.PI);
            ctx.stroke();

            // Sinking warning bubbles
            if (isDeep && t % 30 < 15) {
              ctx.fillStyle = '#92400e';
              ctx.beginPath();
              ctx.arc(px + 32, py + 32, 4 + Math.sin(t * 0.2) * 2, 0, Math.PI * 2);
              ctx.fill();
            }
          } 
          else if (cell.type === 'water') {
            // Water gradient
            const waveOffset = Math.sin((x * 10 + y * 10 + t) * 0.1) * 3;
            ctx.fillStyle = '#0369a1';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);

            // Flow wave ripples
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px, py + 20 + waveOffset);
            ctx.bezierCurveTo(px + 20, py + 10 + waveOffset, px + 40, py + 30 + waveOffset, px + CELL_SIZE, py + 20 + waveOffset);
            ctx.stroke();

            // Foam spots
            ctx.fillStyle = '#bae6fd';
            ctx.beginPath();
            ctx.arc(px + (t % CELL_SIZE), py + 32, 2, 0, Math.PI * 2);
            ctx.fill();
          } 
          else if (cell.type === 'compacted_road') {
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            // Road asphalt texture with center dashed line or hazard curbs
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.moveTo(px + CELL_SIZE / 2, py);
            ctx.lineTo(px + CELL_SIZE / 2, py + CELL_SIZE);
            ctx.stroke();
            ctx.setLineDash([]);
          } 
          else if (cell.type === 'collapsed_road') {
            ctx.fillStyle = '#292524';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            // Jagged fracture cracks
            ctx.strokeStyle = '#78350f';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(px + 5, py + 10);
            ctx.lineTo(px + 30, py + 40);
            ctx.lineTo(px + 55, py + 20);
            ctx.stroke();
          } 
          else if (cell.type === 'rubble_pile') {
            ctx.fillStyle = '#44403c';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            // 3D Boulders
            ctx.fillStyle = '#78716c';
            ctx.strokeStyle = '#292524';
            ctx.lineWidth = 1.5;
            // Rock 1
            ctx.beginPath();
            ctx.rect(px + 10, py + 12, 22, 18);
            ctx.fill();
            ctx.stroke();
            // Rock 2
            ctx.fillStyle = '#a8a29e';
            ctx.beginPath();
            ctx.arc(px + 42, py + 38, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            // Dust indicator
            ctx.fillStyle = '#d6d3d1';
            ctx.fillRect(px + 24, py + 26, 8, 8);
          } 
          else if (cell.type === 'concrete_slab') {
            ctx.fillStyle = '#57534e';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            // Rebar steel bars sticking out
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px + 4, py + 16);
            ctx.lineTo(px + 60, py + 16);
            ctx.moveTo(px + 10, py + 48);
            ctx.lineTo(px + 50, py + 48);
            ctx.stroke();
            // Big grey block
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(px + 12, py + 12, 40, 40);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(px + 12, py + 12, 40, 40);
          } 
          else if (cell.type === 'bridge_structure') {
            // Modular Steel Bailey Bridge
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            // Yellow steel truss borders
            ctx.fillStyle = '#eab308';
            ctx.fillRect(px, py + 2, CELL_SIZE, 6);
            ctx.fillRect(px, py + CELL_SIZE - 8, CELL_SIZE, 6);
            // Cross diagonal bracing
            ctx.strokeStyle = '#ca8a04';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(px, py + 8);
            ctx.lineTo(px + CELL_SIZE, py + CELL_SIZE - 8);
            ctx.moveTo(px + CELL_SIZE, py + 8);
            ctx.lineTo(px, py + CELL_SIZE - 8);
            ctx.stroke();
          } 
          else if (cell.type === 'levee_barrier') {
            // High Concrete & Sandbag Levee Barrier
            ctx.fillStyle = '#155e75';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            ctx.fillStyle = '#0891b2';
            ctx.fillRect(px + 8, py + 8, CELL_SIZE - 16, CELL_SIZE - 16);
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 8, py + 8, CELL_SIZE - 16, CELL_SIZE - 16);
            // Shield icon / barrier crest
            ctx.fillStyle = '#facc15';
            ctx.fillRect(px + 24, py + 24, 16, 16);
          } 
          else if (cell.type === 'safe_haven') {
            // Evacuation & Mobilization Depot Base
            ctx.fillStyle = '#064e3b';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
            // Helipad / cross marking
            ctx.strokeStyle = '#34d399';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(px + CELL_SIZE / 2, py + CELL_SIZE / 2, 22, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = '#ecfdf5';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('HQ', px + CELL_SIZE / 2, py + CELL_SIZE / 2 + 6);
          } 
          else {
            ctx.fillStyle = '#44403c';
            ctx.fillRect(px, py, CELL_SIZE, CELL_SIZE);
          }
          ctx.restore();

          // Survivor Beacon Pulse Animation
          if (cell.hasSurvivor) {
            ctx.save();
            const pulse = (Math.sin(t * 0.1) + 1) / 2;
            const radius = 14 + pulse * 8;
            
            // Beacon rings
            ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 - pulse * 0.4})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(px + CELL_SIZE / 2, py + CELL_SIZE / 2, radius, 0, Math.PI * 2);
            ctx.stroke();

            // Center beacon icon / survivor life indicator
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(px + CELL_SIZE / 2, py + CELL_SIZE / 2, 8, 0, Math.PI * 2);
            ctx.fill();

            // Life percent bar if in peril
            if ((cell.survivorHealth ?? 100) < 95) {
              const h = cell.survivorHealth ?? 100;
              ctx.fillStyle = '#0f172a';
              ctx.fillRect(px + 10, py + 4, CELL_SIZE - 20, 6);
              ctx.fillStyle = h > 50 ? '#22c55e' : '#ef4444';
              ctx.fillRect(px + 10, py + 4, ((CELL_SIZE - 20) * h) / 100, 6);
            }

            // Text SOS label
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('SOS', px + CELL_SIZE / 2, py + CELL_SIZE / 2 + 3);
            ctx.restore();
          }

          // Cell Elevation badge (small subtle corner indicator)
          if (cell.elevation > 0 && cell.type !== 'safe_haven') {
            ctx.save();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.font = '9px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${cell.elevation}m`, px + CELL_SIZE - 4, py + 12);
            ctx.restore();
          }

          // Hover highlight
          if (hoveredCell && hoveredCell.x === x && hoveredCell.y === y) {
            ctx.save();
            ctx.strokeStyle = '#38bdf8';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
            ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            ctx.restore();
          }
        }
      }

      // 2. Render Vehicles
      vehicles.forEach(v => {
        if (!v.owned) return;
        const vx = v.pixelX;
        const vy = v.pixelY;
        const isSelected = v.id === selectedVehicleId;

        ctx.save();
        ctx.translate(vx, vy);

        // Selection ring
        if (isSelected) {
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 3;
          ctx.setLineDash([6, 6]);
          ctx.beginPath();
          ctx.arc(0, 0, 32, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);

          // Directional target line
          if (v.targetX !== undefined && v.targetY !== undefined) {
            ctx.save();
            ctx.translate(-vx, -vy);
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(vx, vy);
            ctx.lineTo(v.targetX * CELL_SIZE + CELL_SIZE / 2, v.targetY * CELL_SIZE + CELL_SIZE / 2);
            ctx.stroke();
            ctx.restore();
          }
        }

        // Vehicle Base Chassis Rotation
        ctx.rotate(v.angle);

        // Stuck in mud warning graphic
        if (v.isStuckInMud) {
          ctx.fillStyle = 'rgba(120, 53, 15, 0.6)';
          ctx.beginPath();
          ctx.arc(0, 0, 24, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw Specific Machine Types
        if (v.type === 'excavator') {
          // Dual Crawler Tracks
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(-18, -16, 36, 8); // Top track
          ctx.fillRect(-18, 8, 36, 8);  // Bottom track
          // Track treads
          ctx.strokeStyle = '#44403c';
          ctx.lineWidth = 1;
          for (let tx = -16; tx <= 16; tx += 6) {
            ctx.beginPath();
            ctx.moveTo(tx, -16);
            ctx.lineTo(tx, -8);
            ctx.moveTo(tx, 8);
            ctx.lineTo(tx, 16);
            ctx.stroke();
          }

          // Rotating Turret Cab
          ctx.save();
          ctx.rotate(v.turretAngle - v.angle);
          
          // Main Body (Industrial Yellow)
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-14, -10, 26, 20);
          // Counterweight in back
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(-14, -10, 8, 20);
          // Glass Operator Cabin
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(0, -9, 10, 7);
          
          // Heavy Articulated Boom & Arm
          const boomProgress = Math.sin(t * 0.15) * 0.4;
          const armExtend = v.isOperating ? boomProgress : 0;
          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(10, 0);
          ctx.lineTo(26 + armExtend * 10, -2);
          ctx.stroke();

          // Bucket (Steel Gray with teeth)
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          const bx = 26 + armExtend * 10;
          ctx.arc(bx, -2, 6, 0, Math.PI);
          ctx.fill();
          
          ctx.restore();
        } 
        else if (v.type === 'bulldozer') {
          // Crawler Dozer Body
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(-18, -15, 36, 7);
          ctx.fillRect(-18, 8, 36, 7);

          // Yellow engine hood
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-12, -8, 26, 16);
          // Cab
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-6, -6, 12, 12);
          ctx.fillStyle = '#67e8f9';
          ctx.fillRect(-4, -4, 8, 8);

          // Heavy Curved Dozer Blade in front
          ctx.fillStyle = '#334155';
          ctx.fillRect(16, -18, 6, 36);
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1;
          ctx.strokeRect(16, -18, 6, 36);
        }
        else if (v.type === 'crane') {
          // Multi-axle Mobile Crane Chassis
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-22, -12, 44, 24);
          // Wheels
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(-20, -15, 8, 4);
          ctx.fillRect(-6, -15, 8, 4);
          ctx.fillRect(8, -15, 8, 4);
          ctx.fillRect(-20, 11, 8, 4);
          ctx.fillRect(-6, 11, 8, 4);
          ctx.fillRect(8, 11, 8, 4);

          // Telescopic Boom extending outward
          ctx.save();
          ctx.rotate(v.turretAngle - v.angle);
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#ca8a04';
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(34, 0);
          ctx.stroke();

          // Steel Cable & Hook
          ctx.strokeStyle = '#cbd5e1';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(34, 0);
          ctx.lineTo(34, 10);
          ctx.stroke();

          ctx.fillStyle = '#ef4444';
          ctx.fillRect(32, 10, 4, 4);
          ctx.restore();
        }
        else if (v.type === 'dump_truck') {
          // Hauler Cab
          ctx.fillStyle = '#eab308';
          ctx.fillRect(6, -12, 16, 24);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(12, -8, 8, 16);

          // Articulated Dump Bed
          ctx.fillStyle = '#475569';
          ctx.fillRect(-22, -13, 26, 26);
          // If carrying cargo, show gravel inside
          if (v.currentCargo > 0) {
            ctx.fillStyle = '#78716c';
            ctx.fillRect(-18, -9, 18, 18);
          }
          // 4 Big Tires
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(8, -16, 10, 5);
          ctx.fillRect(8, 11, 10, 5);
          ctx.fillRect(-18, -16, 10, 5);
          ctx.fillRect(-18, 11, 10, 5);
        }
        else if (v.type === 'roller') {
          // Steel Drum in front
          ctx.fillStyle = '#475569';
          ctx.fillRect(10, -16, 12, 32);
          ctx.strokeStyle = '#94a3b8';
          ctx.strokeRect(10, -16, 12, 32);

          // Engine & Cab
          ctx.fillStyle = '#eab308';
          ctx.fillRect(-18, -10, 26, 20);
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(-12, -7, 12, 14);

          // Rear Wheels
          ctx.fillStyle = '#1c1917';
          ctx.fillRect(-16, -15, 10, 6);
          ctx.fillRect(-16, 9, 10, 6);
        }
        else if (v.type === 'floodlight_rig') {
          // Generator Rig Box
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-14, -10, 28, 20);
          // Tower Mast
          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.arc(0, 0, 7, 0, Math.PI * 2);
          ctx.fill();
        }

        // Breakdown warning exclamation indicator
        if (v.isBrokenDown) {
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(0, -22, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('!', 0, -18);
        }

        ctx.restore();

        // Floodlight Radiance Glow (Dynamic Lighting)
        const isNight = weather.includes('night');
        if (isNight || v.type === 'floodlight_rig') {
          ctx.save();
          const lightRadius = v.type === 'floodlight_rig' ? 140 : 80;
          const gradient = ctx.createRadialGradient(vx, vy, 10, vx, vy, lightRadius);
          gradient.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
          gradient.addColorStop(0.7, 'rgba(253, 224, 71, 0.15)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(vx, vy, lightRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Small fuel & condition bar beneath vehicle
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.7)';
        ctx.fillRect(vx - 18, vy + 24, 36, 4);
        ctx.fillStyle = v.fuel > 30 ? '#22c55e' : '#ef4444';
        ctx.fillRect(vx - 18, vy + 24, (36 * Math.max(0, v.fuel)) / 100, 4);
        ctx.restore();
      });

      // 3. Render Night & Fog Atmosphere Overlay
      if (weather.includes('night')) {
        ctx.save();
        ctx.fillStyle = weather === 'night_storm' ? 'rgba(5, 7, 15, 0.65)' : 'rgba(10, 15, 25, 0.5)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      } else if (weather === 'foggy') {
        ctx.save();
        ctx.fillStyle = 'rgba(214, 211, 209, 0.28)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
      }

      // 4. Update and Render Particles (Rain, Mud, Dust, Splash)
      const isRaining = weather === 'rain' || weather === 'torrential_storm' || weather === 'night_storm';
      if (isRaining && Math.random() < 0.6) {
        // Spawn rain drop
        particlesRef.current.push({
          x: Math.random() * canvasWidth,
          y: 0,
          vx: -2.5,
          vy: Math.random() * 8 + 12,
          life: 1.0,
          maxLife: 35,
          color: 'rgba(186, 230, 253, 0.6)',
          size: 1.5,
          type: 'rain',
        });
      }

      // Lightning flash occasionally in storms
      if ((weather === 'torrential_storm' || weather === 'night_storm') && Math.random() < 0.003) {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.restore();
        soundManager.playLandslide();
      }

      // Render Active Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1 / p.maxLife;

        if (p.life <= 0 || p.y > canvasHeight || p.x < 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        if (p.type === 'rain') {
          ctx.strokeStyle = p.color;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - 3, p.y + 10);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [grid, vehicles, selectedVehicleId, weather, canvasWidth, canvasHeight, gridHeight, gridWidth, hoveredCell]);

  // Mouse & Touch Interaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    // Check if clicked directly on an existing vehicle
    for (const v of vehicles) {
      if (!v.owned) continue;
      const dist = Math.hypot(clickX - v.pixelX, clickY - v.pixelY);
      if (dist <= 28) {
        soundManager.playClick();
        onSelectVehicle(v.id);
        return;
      }
    }

    // Otherwise, click on terrain cell
    const cellX = Math.floor(clickX / CELL_SIZE);
    const cellY = Math.floor(clickY / CELL_SIZE);

    if (cellX >= 0 && cellX < gridWidth && cellY >= 0 && cellY < gridHeight) {
      soundManager.playClick();
      spawnParticles(clickX, clickY, 'dust', 6);
      onCellAction(cellX, cellY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;

    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    const cx = Math.floor(mx / CELL_SIZE);
    const cy = Math.floor(my / CELL_SIZE);

    if (cx >= 0 && cx < gridWidth && cy >= 0 && cy < gridHeight) {
      if (!hoveredCell || hoveredCell.x !== cx || hoveredCell.y !== cy) {
        setHoveredCell({ x: cx, y: cy });
      }
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center justify-center bg-stone-950 p-2 sm:p-4 select-none">
      <div className="relative max-w-full overflow-auto rounded-lg border-2 border-stone-800 shadow-2xl bg-stone-900">
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="cursor-crosshair block max-w-none"
          style={{
            width: `${Math.min(canvasWidth, 960)}px`,
            height: 'auto',
            aspectRatio: `${canvasWidth} / ${canvasHeight}`,
          }}
        />
      </div>

      {/* Tactile Cell Hover Metadata Bar (No-pill discipline) */}
      {hoveredCell && grid[hoveredCell.y]?.[hoveredCell.x] && (
        <div className="mt-2 text-xs text-stone-400 flex flex-wrap items-center justify-center gap-2 font-mono-tech">
          <span>{lang === 'ar' ? `الخلية [${hoveredCell.x}, ${hoveredCell.y}]` : `Cell [${hoveredCell.x}, ${hoveredCell.y}]`}</span>
          <span aria-hidden="true">·</span>
          <span>
            {lang === 'ar' ? 'النوع:' : 'Type:'}{' '}
            <strong className="text-amber-400">
              {grid[hoveredCell.y][hoveredCell.x].type}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {lang === 'ar' ? 'الارتفاع:' : 'Elevation:'}{' '}
            {grid[hoveredCell.y][hoveredCell.x].elevation}m
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {lang === 'ar' ? 'تشبع الوحل:' : 'Mud:'}{' '}
            {Math.round(grid[hoveredCell.y][hoveredCell.x].mudSaturation)}%
          </span>
          {grid[hoveredCell.y][hoveredCell.x].hasSurvivor && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-red-400 font-bold animate-pulse">
                ⚠️ {lang === 'ar' ? 'إشارة استغاثة (عالقون)' : 'SOS Beacon Detected'}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};
