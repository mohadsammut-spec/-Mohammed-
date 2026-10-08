import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  DisasterSector, 
  GameResources, 
  Language, 
  Machine, 
  Operator, 
  RadioMessage, 
  TerrainCell, 
  WeatherType,
  DynamicHazardEvent
} from './types/game';
import { DISASTER_SECTORS } from './data/missions';
import { INITIAL_MACHINES, INITIAL_OPERATORS } from './data/vehicles';
import { generateSectorGrid, stepPhysics } from './utils/terrain';
import { soundManager } from './utils/audio';

import { TacticalHUD } from './components/TacticalHUD';
import { SimulationCanvas } from './components/SimulationCanvas';
import { TacticalVehicleControls } from './components/TacticalVehicleControls';
import { HQOverview } from './components/HQOverview';
import { VictoryModal } from './components/VictoryModal';
import { DisasterAlert } from './components/DisasterAlert';
import { ManualModal } from './components/ManualModal';

export default function App() {
  const [lang, setLang] = useState<Language>('ar');
  const [gameMode, setGameMode] = useState<'hq' | 'mission'>('hq');
  const [activeMissionId, setActiveMissionId] = useState<string>('mission_1');
  const [missions, setMissions] = useState<DisasterSector[]>(DISASTER_SECTORS);
  const [vehicles, setVehicles] = useState<Machine[]>(INITIAL_MACHINES);
  const [operators, setOperators] = useState<Operator[]>(INITIAL_OPERATORS);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>('mach_exc_1');

  const [resources, setResources] = useState<GameResources>({
    funds: 4800,
    fuelReserves: 600,
    steelBeams: 4,
    concreteBlocks: 6,
    gravelSupplies: 120,
    reputation: 150,
    totalSurvivorsRescued: 0,
    missionsCompletedCount: 0,
  });

  const [grid, setGrid] = useState<TerrainCell[][]>([]);
  const [weather, setWeather] = useState<WeatherType>('rain');
  const weatherIndexRef = useRef<number>(0);
  const [radioLog, setRadioLog] = useState<RadioMessage[]>([]);
  const [activeAlert, setActiveAlert] = useState<DynamicHazardEvent | null>(null);
  const [showVictory, setShowVictory] = useState<boolean>(false);
  const [showManual, setShowManual] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const activeMission = missions.find(m => m.id === activeMissionId) || missions[0];
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Sync document title and direction with language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Append message to radio log
  const pushRadioMessage = useCallback((
    senderAr: string,
    senderEn: string,
    messageAr: string,
    messageEn: string,
    type: 'emergency' | 'status' | 'engineer' | 'warning' | 'success' = 'status'
  ) => {
    soundManager.playRadioBleep();
    setRadioLog(prev => [
      ...prev.slice(-6),
      {
        id: `msg_${Date.now()}_${Math.random()}`,
        senderAr,
        senderEn,
        messageAr,
        messageEn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type,
      },
    ]);
  }, []);

  // Deploy to a selected disaster sector
  const handleDeployToMission = useCallback((missionId: string) => {
    const targetMission = missions.find(m => m.id === missionId) || missions[0];
    setActiveMissionId(missionId);
    const newGrid = generateSectorGrid(targetMission);
    setGrid(newGrid);
    setWeather(targetMission.initialWeather);
    weatherIndexRef.current = 0;
    setShowVictory(false);
    setGameMode('mission');

    // Place owned vehicles safely at the staging zone
    setVehicles(prev =>
      prev.map((v, index) => {
        if (!v.owned) return v;
        const startX = Math.min(2, index);
        const startY = targetMission.gridHeight - 2;
        return {
          ...v,
          x: startX,
          y: startY,
          pixelX: startX * 64 + 32,
          pixelY: startY * 64 + 32,
          isStuckInMud: false,
          isBrokenDown: false,
          fuel: Math.max(v.fuel, 65),
          targetX: undefined,
          targetY: undefined,
          currentAction: 'idle',
        };
      })
    );

    // Initial mission radio briefing
    if (targetMission.storyDialogue && targetMission.storyDialogue.length > 0) {
      targetMission.storyDialogue.forEach((d, i) => {
        setTimeout(() => {
          pushRadioMessage(d.speakerAr, d.speakerEn, d.textAr, d.textEn, 'emergency');
        }, (i + 1) * 800);
      });
    } else {
      pushRadioMessage(
        'غرفة العمليات المركزية',
        'Command Post',
        'وصلت الفرقة الهندسية إلى قطاع الكارثة. ابدأوا فتح المسارات فوراً!',
        'Engineering fleet on-site. Commence route clearance immediately!',
        'emergency'
      );
    }
  }, [missions, pushRadioMessage]);

  // Dynamic Physics & Environmental Weather Loop
  useEffect(() => {
    if (gameMode !== 'mission' || grid.length === 0) return;

    const physicsInterval = setInterval(() => {
      setGrid(currentGrid => {
        const { grid: nextGrid } = stepPhysics(currentGrid, weather);
        return nextGrid;
      });
    }, 3800);

    return () => clearInterval(physicsInterval);
  }, [gameMode, grid.length, weather]);

  // Weather Cycle shift timer
  useEffect(() => {
    if (gameMode !== 'mission' || !activeMission.weatherCycle || activeMission.weatherCycle.length <= 1) return;

    const weatherInterval = setInterval(() => {
      weatherIndexRef.current = (weatherIndexRef.current + 1) % activeMission.weatherCycle.length;
      const nextWeather = activeMission.weatherCycle[weatherIndexRef.current];
      setWeather(nextWeather);

      if (nextWeather === 'torrential_storm') {
        soundManager.playSiren();
        setActiveAlert({
          id: `alert_${Date.now()}`,
          type: 'flash_flood_surge',
          titleAr: 'عاصفة مطرية جارفة وطوفان مياه!',
          titleEn: 'Torrential Deluge & Flash Flood Surge!',
          descAr: 'اشتداد الأمطار يرفع منسوب المياه ويحول المسارات الجبلية إلى مستنقعات طين!',
          descEn: 'Severe rain is swelling floodwaters and turning tracks into impassable mud!',
          impactCell: { x: 7, y: 5 },
          intensity: 3,
        });
        pushRadioMessage(
          'أرصاد الطوارئ',
          'Disaster Met',
          'تحذير! أمطار طوفانية قادمة خلال دقائق. احفروا قنوات التصريف واحموا الممرات!',
          'Warning! Deluge incoming. Dig diversion channels and shield roads!',
          'warning'
        );
      } else if (nextWeather === 'night_storm') {
        soundManager.playAlarm();
        pushRadioMessage(
          'المقر العام',
          'HQ Dispatch',
          'حلول الظلام وانعدام الرؤية! انشروا أبراج الإضاءة الكاشفة لحماية المعدات.',
          'Zero visibility nightfall! Deploy floodlight rigs to safeguard crews.',
          'warning'
        );
      }
    }, 28000);

    return () => clearInterval(weatherInterval);
  }, [gameMode, activeMission, pushRadioMessage]);

  // Check Mission Objectives & Victory State
  useEffect(() => {
    if (gameMode !== 'mission' || showVictory) return;

    const allMandatoryDone = activeMission.objectives
      .filter(o => o.isMandatory)
      .every(o => o.completed);

    if (allMandatoryDone && activeMission.objectives.length > 0) {
      setShowVictory(true);
      // Mark current mission completed & unlock next
      setMissions(prev => {
        const updated = prev.map(m => {
          if (m.id === activeMission.id) {
            return { ...m, completed: true };
          }
          return m;
        });

        // Unlock next sector
        const currentIndex = updated.findIndex(m => m.id === activeMission.id);
        if (currentIndex !== -1 && currentIndex + 1 < updated.length) {
          updated[currentIndex + 1].unlocked = true;
        }
        return updated;
      });

      // Award resources
      setResources(r => ({
        ...r,
        funds: r.funds + activeMission.rewardMoney,
        reputation: r.reputation + activeMission.rewardReputation,
        totalSurvivorsRescued: r.totalSurvivorsRescued + activeMission.survivorsCount,
        missionsCompletedCount: r.missionsCompletedCount + 1,
      }));

      pushRadioMessage(
        'قائد الطوارئ',
        'Operations Chief',
        'أنجزتم المستحيل يا أبطال المهندسين! الطريق سالك والناجون في أمان!',
        'Mission accomplished! Lifeline secured and survivors evacuated!',
        'success'
      );
    }
  }, [gameMode, activeMission, showVictory, pushRadioMessage]);

  // Move vehicle manually (WASD / D-Pad)
  const handleMoveVehicle = useCallback((dx: number, dy: number) => {
    if (!selectedVehicle || !selectedVehicle.owned) return;
    if (selectedVehicle.isStuckInMud || selectedVehicle.isBrokenDown) {
      soundManager.playAlarm();
      return;
    }

    const nextX = Math.max(0, Math.min((grid[0]?.length || 14) - 1, selectedVehicle.x + dx));
    const nextY = Math.max(0, Math.min(grid.length - 1, selectedVehicle.y + dy));

    if (nextX === selectedVehicle.x && nextY === selectedVehicle.y) return;

    const targetCell = grid[nextY]?.[nextX];
    let angle = selectedVehicle.angle;
    if (dx > 0) angle = 0;
    else if (dx < 0) angle = Math.PI;
    else if (dy > 0) angle = Math.PI / 2;
    else if (dy < 0) angle = -Math.PI / 2;

    // Mud check & traction
    const isDeepMud = targetCell?.type === 'deep_mud';
    const hasTractionUpgrade = selectedVehicle.upgrades.some(u => u.unlocked && u.effectType === 'traction');
    const stuckChance = isDeepMud && !hasTractionUpgrade ? 0.35 : 0;
    const becomesStuck = Math.random() < stuckChance;

    if (becomesStuck) {
      soundManager.playAlarm();
      pushRadioMessage(
        selectedVehicle.nameAr,
        selectedVehicle.nameEn,
        'انغرزت عجلات الآلية في الوحل العميق! نحتاج مساعدة بلدوزر أو ونش سحب!',
        'Vehicle mired in deep mud! Need bulldozer recovery winch!',
        'warning'
      );
    }

    // Fuel consumption
    const fuelCost = selectedVehicle.fuelConsumptionRate * (isDeepMud ? 2.2 : 1.0);
    const newFuel = Math.max(0, selectedVehicle.fuel - fuelCost);
    const outOfFuel = newFuel <= 0;

    setVehicles(prev =>
      prev.map(v => {
        if (v.id !== selectedVehicle.id) return v;
        return {
          ...v,
          x: nextX,
          y: nextY,
          pixelX: nextX * 64 + 32,
          pixelY: nextY * 64 + 32,
          angle,
          turretAngle: angle,
          fuel: newFuel,
          isStuckInMud: becomesStuck,
          isBrokenDown: outOfFuel,
          breakdownReason: outOfFuel ? 'out_of_fuel' : v.breakdownReason,
          currentAction: 'moving',
        };
      })
    );

    // Soil compaction by road roller on movement
    if (selectedVehicle.type === 'roller' && targetCell && (targetCell.type === 'mud' || targetCell.type === 'collapsed_road')) {
      soundManager.playCompact();
      setGrid(prev =>
        prev.map((row, rY) =>
          row.map((cell, cX) => {
            if (cX === nextX && rY === nextY) {
              return {
                ...cell,
                type: 'compacted_road',
                mudSaturation: 0,
              };
            }
            return cell;
          })
        )
      );

      // Update compact road objective
      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('compact')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );
    }
  }, [selectedVehicle, grid, activeMission.id, pushRadioMessage]);

  // Perform targeted action on specific cell (via click or action button)
  const handlePerformCellAction = useCallback((targetX: number, targetY: number, customAction?: string) => {
    if (!selectedVehicle || !selectedVehicle.owned) return;
    if (selectedVehicle.isBrokenDown) {
      soundManager.playAlarm();
      return;
    }

    const cell = grid[targetY]?.[targetX];
    if (!cell) return;

    const action = customAction || (
      selectedVehicle.type === 'excavator' ? (cell.hasSurvivor ? 'rescue_survivor' : cell.type === 'rubble_pile' ? 'clear_rubble' : 'dig_canal') :
      selectedVehicle.type === 'bulldozer' ? (cell.type === 'rubble_pile' ? 'push_rubble' : 'plow_road') :
      selectedVehicle.type === 'crane' ? (cell.type === 'concrete_slab' ? 'lift_slab' : 'install_bridge') :
      selectedVehicle.type === 'dump_truck' ? 'load_rubble' :
      selectedVehicle.type === 'roller' ? 'compact_road' : 'toggle_light'
    );

    // 1. Excavator: Dig canal trench
    if (action === 'dig_canal') {
      soundManager.playDig();
      setGrid(prev =>
        prev.map((row, rY) =>
          row.map((c, cX) => {
            if (cX === targetX && rY === targetY) {
              return {
                ...c,
                type: 'water',
                elevation: Math.max(0, c.elevation - 2),
                waterLevel: 50,
              };
            }
            return c;
          })
        )
      );

      // Progress canal objective
      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('canal') || obj.id.includes('divert')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );

      pushRadioMessage(
        selectedVehicle.nameAr,
        selectedVehicle.nameEn,
        `تم حفر قناة تصريف عند [${targetX}, ${targetY}]. المياه تتحول عن المسار!`,
        `Canal trench excavated at [${targetX}, ${targetY}]. Flood waters diverted!`,
        'engineer'
      );
    }

    // 2. Clear Rubble (Excavator / Bulldozer)
    else if (action === 'clear_rubble' || action === 'push_rubble') {
      soundManager.playPush();
      setGrid(prev =>
        prev.map((row, rY) =>
          row.map((c, cX) => {
            if (cX === targetX && rY === targetY) {
              return {
                ...c,
                type: 'rocky_ground',
                debrisHealth: 0,
              };
            }
            return c;
          })
        )
      );

      // Progress rubble objective
      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('rubble')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );
    }

    // 3. Rescue Survivor
    else if (action === 'rescue_survivor' || cell.hasSurvivor) {
      soundManager.playBeaconPing();
      setGrid(prev =>
        prev.map((row, rY) =>
          row.map((c, cX) => {
            if (cX === targetX && rY === targetY) {
              return {
                ...c,
                hasSurvivor: false,
                type: c.type === 'survivor_zone' ? 'rocky_ground' : c.type,
              };
            }
            return c;
          })
        )
      );

      // Progress rescue objective
      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('rescue')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );

      setResources(r => ({ ...r, totalSurvivorsRescued: r.totalSurvivorsRescued + 1, reputation: r.reputation + 40 }));
      pushRadioMessage(
        'مسعف الميدان',
        'Field Medic',
        'تم استخراج الناجي بنجاح ونقله إلى مركبة الإسعاف! حالة مستقرة.',
        'Survivor safely extracted and transferred to medical transport!',
        'success'
      );
    }

    // 4. Crane: Lift Slab
    else if (action === 'lift_slab') {
      soundManager.playCraneLift();
      setGrid(prev =>
        prev.map((row, rY) =>
          row.map((c, cX) => {
            if (cX === targetX && rY === targetY) {
              return { ...c, type: 'rocky_ground' };
            }
            return c;
          })
        )
      );

      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('slab')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );
    }

    // 5. Crane: Erect Bailey Bridge
    else if (action === 'install_bridge') {
      if (resources.steelBeams <= 0) {
        soundManager.playAlarm();
        pushRadioMessage(
          'الرافعة أطلس',
          'Crane Operator',
          'لا توجد عوارض فولاذية كافية! يلزم شراء عوارض من المستودع.',
          'Not enough steel beams in inventory! Order more at HQ Depot.',
          'warning'
        );
        return;
      }

      soundManager.playCraneLift();
      setResources(r => ({ ...r, steelBeams: Math.max(0, r.steelBeams - 1) }));
      setGrid(prev =>
        prev.map((row, rY) =>
          row.map((c, cX) => {
            if (cX === targetX && rY === targetY) {
              return { ...c, type: 'bridge_structure', elevation: 3 };
            }
            return c;
          })
        )
      );

      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('bridge')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );

      pushRadioMessage(
        'كابتن ليلى',
        'Capt. Layla',
        'تم تثبيت قطاع الجسر الفولاذي بنجاح فوق الهوة! المعبر مفتوح.',
        'Modular Bailey bridge span locked into place! Crossing secured.',
        'success'
      );
    }

    // 6. Crane / Truck: Place Flood Levee
    else if (action === 'place_levee') {
      if (resources.concreteBlocks <= 0) {
        soundManager.playAlarm();
        return;
      }

      soundManager.playCraneLift();
      setResources(r => ({ ...r, concreteBlocks: Math.max(0, r.concreteBlocks - 1) }));
      setGrid(prev =>
        prev.map((row, rY) =>
          row.map((c, cX) => {
            if (cX === targetX && rY === targetY) {
              return { ...c, type: 'levee_barrier', elevation: 5, waterLevel: 0 };
            }
            return c;
          })
        )
      );

      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('levee')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );
    }

    // 7. Roller: Compact Road
    else if (action === 'compact_road' || action === 'plow_road') {
      soundManager.playCompact();
      setGrid(prev =>
        prev.map((row, rY) =>
          row.map((c, cX) => {
            if (cX === targetX && rY === targetY) {
              return { ...c, type: 'compacted_road', mudSaturation: 0 };
            }
            return c;
          })
        )
      );

      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('compact')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );
    }

    // 8. Winch & Tow
    else if (action === 'winch_tow') {
      soundManager.playPush();
      setVehicles(prev =>
        prev.map(v => (v.isStuckInMud ? { ...v, isStuckInMud: false } : v))
      );

      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('tow')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );

      pushRadioMessage(
        'المعلم سعيد',
        'Abu Saeed',
        'تم سحب المركبة الغارقة بنجاح بالونش! تم تحرير المسار.',
        'Stranded vehicle winched out of mud trap to firm ground!',
        'success'
      );
    }

    // 9. Light Rig: Toggle 360 lights
    else if (action === 'toggle_light') {
      soundManager.playClick();
      setGrid(prev =>
        prev.map((row, rY) =>
          row.map((c, cX) => {
            const dist = Math.hypot(cX - targetX, rY - targetY);
            if (dist <= 3) {
              return { ...c, isLit: true };
            }
            return c;
          })
        )
      );

      setMissions(prevMissions =>
        prevMissions.map(m => {
          if (m.id !== activeMission.id) return m;
          return {
            ...m,
            objectives: m.objectives.map(obj => {
              if (obj.id.includes('light')) {
                const nextVal = Math.min(obj.target, obj.current + 1);
                return { ...obj, current: nextVal, completed: nextVal >= obj.target };
              }
              return obj;
            }),
          };
        })
      );
    }
  }, [selectedVehicle, grid, activeMission.id, resources.steelBeams, resources.concreteBlocks, pushRadioMessage]);

  // Keyboard shortcut listener
  useEffect(() => {
    if (gameMode !== 'mission') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // WASD / Arrow Keys for manual movement
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleMoveVehicle(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleMoveVehicle(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMoveVehicle(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMoveVehicle(1, 0);
      } else if (e.key === ' ') {
        // Space: Perform primary action on current cell
        e.preventDefault();
        if (selectedVehicle) {
          handlePerformCellAction(selectedVehicle.x, selectedVehicle.y);
        }
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        // Quick vehicle switch
        const idx = parseInt(e.key, 10) - 1;
        const ownedList = vehicles.filter(v => v.owned);
        if (ownedList[idx]) {
          soundManager.playClick();
          setSelectedVehicleId(ownedList[idx].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameMode, handleMoveVehicle, handlePerformCellAction, selectedVehicle, vehicles]);

  // Field Refuel action
  const handleRefuel = () => {
    if (!selectedVehicle || resources.fuelReserves <= 0) return;
    const needed = selectedVehicle.maxFuel - selectedVehicle.fuel;
    const toAdd = Math.min(needed, 50, resources.fuelReserves);

    setResources(r => ({ ...r, fuelReserves: r.fuelReserves - toAdd }));
    setVehicles(prev =>
      prev.map(v =>
        v.id === selectedVehicle.id
          ? { ...v, fuel: Math.min(v.maxFuel, v.fuel + toAdd), isBrokenDown: false }
          : v
      )
    );
  };

  // Field Repair action
  const handleRepair = () => {
    if (!selectedVehicle || resources.funds < 150) return;
    setResources(r => ({ ...r, funds: r.funds - 150 }));
    setVehicles(prev =>
      prev.map(v =>
        v.id === selectedVehicle.id
          ? { ...v, condition: 100, isBrokenDown: false, breakdownReason: undefined }
          : v
      )
    );
  };

  // Self Winch Pull
  const handleWinchPull = () => {
    if (!selectedVehicle) return;
    soundManager.playPush();
    setVehicles(prev =>
      prev.map(v => (v.id === selectedVehicle.id ? { ...v, isStuckInMud: false } : v))
    );
  };

  // Purchase new vehicle
  const handleBuyVehicle = (vehicleId: string) => {
    const target = vehicles.find(v => v.id === vehicleId);
    if (!target || resources.funds < target.price) return;

    soundManager.playVictory();
    setResources(r => ({ ...r, funds: r.funds - target.price }));
    setVehicles(prev =>
      prev.map(v => (v.id === vehicleId ? { ...v, owned: true } : v))
    );
  };

  // Upgrade vehicle
  const handleUpgradeVehicle = (vehicleId: string, upgradeId: string) => {
    const machine = vehicles.find(v => v.id === vehicleId);
    const upgrade = machine?.upgrades.find(u => u.id === upgradeId);
    if (!machine || !upgrade || resources.funds < upgrade.cost) return;

    soundManager.playHydraulic();
    setResources(r => ({ ...r, funds: r.funds - upgrade.cost }));
    setVehicles(prev =>
      prev.map(v => {
        if (v.id !== vehicleId) return v;
        const newUpgrades = v.upgrades.map(u => (u.id === upgradeId ? { ...u, unlocked: true } : u));
        let newTraction = v.mudTraction;
        let newDig = v.digPower;
        let newPush = v.pushPower;
        if (upgrade.effectType === 'traction') newTraction = Math.min(1.0, newTraction + 0.3);
        if (upgrade.effectType === 'power') {
          newDig += 15;
          newPush += 20;
        }
        return {
          ...v,
          upgrades: newUpgrades,
          mudTraction: newTraction,
          digPower: newDig,
          pushPower: newPush,
        };
      })
    );
  };

  // Hire operator
  const handleHireOperator = (opId: string) => {
    const op = operators.find(o => o.id === opId);
    if (!op || resources.funds < op.salary) return;

    soundManager.playClick();
    setResources(r => ({ ...r, funds: r.funds - op.salary }));
    setOperators(prev =>
      prev.map(o => (o.id === opId ? { ...o, hired: true } : o))
    );
  };

  // Assign operator to vehicle
  const handleAssignOperator = (opId: string, vehicleId: string | null) => {
    soundManager.playClick();
    setOperators(prev =>
      prev.map(o => (o.id === opId ? { ...o, assignedVehicleId: vehicleId } : o))
    );
    setVehicles(prev =>
      prev.map(v => (v.id === vehicleId ? { ...v, assignedOperatorId: opId } : v))
    );
  };

  // Buy logistics supplies
  const handleBuySupplies = (type: 'fuel' | 'steel' | 'concrete', cost: number, amount: number) => {
    if (resources.funds < cost) return;
    soundManager.playClick();
    setResources(r => {
      const next = { ...r, funds: r.funds - cost };
      if (type === 'fuel') next.fuelReserves += amount;
      if (type === 'steel') next.steelBeams += amount;
      if (type === 'concrete') next.concreteBlocks += amount;
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans select-none overflow-x-hidden">
      {/* Top Main Navigation Header */}
      <nav className="w-full bg-stone-900/90 border-b border-stone-800 px-3 sm:px-6 py-2.5 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center font-heading font-black text-stone-950 text-xl shadow">
            🏗️
          </div>
          <div>
            <h1 className="font-heading font-black text-sm sm:text-base text-stone-100 leading-tight">
              {lang === 'ar' ? 'المهندسون الأخيرون: جبهة الإنقاذ' : 'The Last Operators: Rescue Frontier'}
            </h1>
            <div className="text-[10px] text-stone-400 font-mono-tech flex items-center gap-1.5">
              <span>{lang === 'ar' ? 'محاكي الاستجابة للكوارث الطبيعية' : 'Disaster Heavy Engineering Sim'}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400 font-semibold">{gameMode === 'hq' ? (lang === 'ar' ? 'المقر العام' : 'Base HQ') : (lang === 'ar' ? 'الجبهة الميدانية' : 'Active Sector')}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Manual button */}
          <button
            onClick={() => setShowManual(true)}
            className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 transition flex items-center gap-1.5"
          >
            <span>📖</span>
            <span className="hidden sm:inline">{lang === 'ar' ? 'دليل التشغيل' : 'Manual'}</span>
          </button>

          {/* Mode Switcher */}
          {gameMode === 'mission' ? (
            <button
              onClick={() => setGameMode('hq')}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-heading font-bold rounded-lg transition shadow"
            >
              {lang === 'ar' ? 'العودة للمقر المتنقل' : 'Return to Base HQ'}
            </button>
          ) : (
            <button
              onClick={() => handleDeployToMission(activeMissionId)}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-heading font-bold rounded-lg transition shadow flex items-center gap-1.5"
            >
              <span>🚨</span>
              <span>{lang === 'ar' ? 'نشر الأسطول في الميدان' : 'Deploy to Sector'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={() => setLang(l => (l === 'ar' ? 'en' : 'ar'))}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-xs font-bold text-amber-400 rounded-lg border border-stone-700 transition"
          >
            {lang === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </nav>

      {/* Main Views */}
      {gameMode === 'hq' ? (
        <HQOverview
          missions={missions}
          activeMissionId={activeMissionId}
          onSelectMission={setActiveMissionId}
          onDeployToMission={handleDeployToMission}
          vehicles={vehicles}
          onBuyVehicle={handleBuyVehicle}
          onUpgradeVehicle={handleUpgradeVehicle}
          operators={operators}
          onHireOperator={handleHireOperator}
          onAssignOperator={handleAssignOperator}
          resources={resources}
          onBuySupplies={handleBuySupplies}
          lang={lang}
        />
      ) : (
        <div className="flex-1 flex flex-col justify-between">
          {/* Tactical HUD Header */}
          <TacticalHUD
            mission={activeMission}
            resources={resources}
            weather={weather}
            radioLog={radioLog}
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onSelectVehicle={setSelectedVehicleId}
            lang={lang}
            onToggleLang={() => setLang(l => (l === 'ar' ? 'en' : 'ar'))}
            onReturnToHQ={() => setGameMode('hq')}
            soundEnabled={soundEnabled}
            onToggleSound={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              soundManager.enabled = next;
            }}
          />

          {/* Interactive Simulation Viewport */}
          <div className="flex-1 flex items-center justify-center relative">
            <SimulationCanvas
              grid={grid}
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onSelectVehicle={setSelectedVehicleId}
              onCellAction={(x, y) => handlePerformCellAction(x, y)}
              weather={weather}
              lang={lang}
            />
          </div>

          {/* Tactical Controls & D-Pad Bottom Panel */}
          <div className="p-2 sm:p-4 bg-stone-950 border-t border-stone-800 max-w-5xl w-full mx-auto">
            <TacticalVehicleControls
              vehicle={selectedVehicle}
              onMoveManual={handleMoveVehicle}
              onPerformAction={(act) => {
                if (selectedVehicle) {
                  handlePerformCellAction(selectedVehicle.x, selectedVehicle.y, act);
                }
              }}
              onRefuel={handleRefuel}
              onRepair={handleRepair}
              onWinchPull={handleWinchPull}
              lang={lang}
              funds={resources.funds}
              fuelReserves={resources.fuelReserves}
              currentCell={selectedVehicle && grid[selectedVehicle.y]?.[selectedVehicle.x]}
            />
          </div>
        </div>
      )}

      {/* Dynamic Disaster Alert */}
      <DisasterAlert
        event={activeAlert}
        onDismiss={() => setActiveAlert(null)}
        lang={lang}
      />

      {/* Victory Modal */}
      {showVictory && (
        <VictoryModal
          mission={activeMission}
          lang={lang}
          onContinue={() => {
            setShowVictory(false);
            setGameMode('hq');
          }}
        />
      )}

      {/* Engineering Manual Modal */}
      <ManualModal
        isOpen={showManual}
        onClose={() => setShowManual(false)}
        lang={lang}
      />
    </div>
  );
}
