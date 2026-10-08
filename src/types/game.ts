export type Language = 'ar' | 'en';

export type VehicleType = 
  | 'excavator' 
  | 'bulldozer' 
  | 'crane' 
  | 'dump_truck' 
  | 'roller' 
  | 'floodlight_rig';

export type TerrainType = 
  | 'rocky_ground' 
  | 'mud' 
  | 'deep_mud' 
  | 'water' 
  | 'compacted_road' 
  | 'collapsed_road' 
  | 'rubble_pile' 
  | 'concrete_slab' 
  | 'bridge_structure' 
  | 'levee_barrier' 
  | 'survivor_zone' 
  | 'depot_zone' 
  | 'safe_haven';

export type WeatherType = 'clear' | 'foggy' | 'rain' | 'torrential_storm' | 'night_clear' | 'night_storm';

export interface TerrainCell {
  x: number;
  y: number;
  type: TerrainType;
  elevation: number; // 0 to 10
  waterLevel: number; // 0 to 100%
  mudSaturation: number; // 0 to 100%
  debrisHealth: number; // For obstacles (rubble, concrete)
  hasSurvivor?: boolean;
  survivorHealth?: number; // 0-100, ticks down if underwater/untreated
  survivorName?: string;
  isTargeted?: boolean;
  isLit?: boolean;
}

export interface VehicleUpgrade {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  cost: number;
  unlocked: boolean;
  effectType: 'traction' | 'power' | 'fuel_efficiency' | 'armor' | 'reach' | 'lighting';
  effectValue: number;
}

export interface Operator {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  avatar: string;
  skillLevel: number; // 1 to 5
  specialtyAr: string;
  specialtyEn: string;
  speedBonus: number;
  fuelEfficiencyBonus: number;
  breakdownResistance: number;
  assignedVehicleId?: string | null;
  salary: number;
  hired: boolean;
}

export interface Machine {
  id: string;
  nameAr: string;
  nameEn: string;
  type: VehicleType;
  modelCode: string;
  descriptionAr: string;
  descriptionEn: string;
  price: number;
  owned: boolean;
  assignedOperatorId?: string | null;
  
  // Real-time state
  x: number; // Grid coordinates
  y: number;
  pixelX: number;
  pixelY: number;
  targetX?: number;
  targetY?: number;
  angle: number; // In radians
  turretAngle: number; // For excavators/cranes
  armProgress: number; // 0 to 1 animation progress
  isOperating: boolean;
  currentAction?: 'idle' | 'moving' | 'digging' | 'pushing' | 'lifting' | 'dumping' | 'compacting' | 'repairing' | 'towing';
  targetCell?: { x: number; y: number } | null;

  // Mechanical conditions
  fuel: number; // 0 to 100
  maxFuel: number;
  condition: number; // 0 to 100 (Health/Wear)
  isStuckInMud: boolean;
  isBrokenDown: boolean;
  breakdownReason?: 'track_snapped' | 'hydraulic_leak' | 'overheat' | 'out_of_fuel';
  
  // Machine Specs & Stats
  digPower: number; // Excavator
  pushPower: number; // Bulldozer
  liftCapacity: number; // Crane
  cargoCapacity: number; // Dump truck (0 to max)
  currentCargo: number;
  compactionPower: number; // Roller
  mudTraction: number; // 0 to 1 (resistance to sinking)
  fuelConsumptionRate: number; // per action
  speed: number;
  
  upgrades: VehicleUpgrade[];
}

export interface MissionObjective {
  id: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  current: number;
  target: number;
  unitAr: string;
  unitEn: string;
  completed: boolean;
  isMandatory: boolean;
}

export interface DisasterSector {
  id: string;
  titleAr: string;
  titleEn: string;
  subTitleAr: string;
  subTitleEn: string;
  briefingAr: string;
  briefingEn: string;
  disasterTypeAr: string;
  disasterTypeEn: string;
  dangerLevel: 'medium' | 'high' | 'critical' | 'extreme';
  rewardMoney: number;
  rewardReputation: number;
  unlocked: boolean;
  completed: boolean;
  gridWidth: number;
  gridHeight: number;
  initialWeather: WeatherType;
  weatherCycle: WeatherType[];
  initialWaterThreat: number; // 0 to 100
  survivorsCount: number;
  objectives: MissionObjective[];
  storyDialogue: {
    speakerAr: string;
    speakerEn: string;
    textAr: string;
    textEn: string;
  }[];
}

export interface GameResources {
  funds: number; // ميزانية الطوارئ بالدولار
  fuelReserves: number; // براميل الديزل الاحتياطية
  steelBeams: number; // عوارض فولاذية للجسور المؤقتة
  concreteBlocks: number; // كتل خرسانية لحواجز الفيضان
  gravelSupplies: number; // ركام وحصى لتمهيد الطرق
  reputation: number; // السمعة الهندسية
  totalSurvivorsRescued: number;
  missionsCompletedCount: number;
}

export interface RadioMessage {
  id: string;
  senderAr: string;
  senderEn: string;
  messageAr: string;
  messageEn: string;
  timestamp: string;
  type: 'emergency' | 'status' | 'engineer' | 'warning' | 'success';
}

export interface DynamicHazardEvent {
  id: string;
  type: 'flash_flood_surge' | 'rockslide' | 'mud_break' | 'lightning_strike' | 'survivor_beacon';
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  impactCell: { x: number; y: number };
  intensity: number;
}
