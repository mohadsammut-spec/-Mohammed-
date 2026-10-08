import React from 'react';
import { Machine, Language, TerrainCell } from '../types/game';
import { 
  Fuel, 
  Wrench, 
  AlertTriangle, 
  Compass, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight,
  Shield,
  Zap
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TacticalVehicleControlsProps {
  vehicle: Machine | undefined;
  onMoveManual: (dx: number, dy: number) => void;
  onPerformAction: (actionType: string) => void;
  onRefuel: () => void;
  onRepair: () => void;
  onWinchPull: () => void;
  lang: Language;
  funds: number;
  fuelReserves: number;
  currentCell?: TerrainCell;
}

export const TacticalVehicleControls: React.FC<TacticalVehicleControlsProps> = ({
  vehicle,
  onMoveManual,
  onPerformAction,
  onRefuel,
  onRepair,
  onWinchPull,
  lang,
  funds,
  fuelReserves,
  currentCell,
}) => {
  if (!vehicle) {
    return (
      <div className="bg-stone-900 border border-stone-800 p-4 rounded-lg text-center text-stone-400 text-sm">
        {lang === 'ar' 
          ? 'حدد آلية من الأسطول بالنقر عليها على الخريطة أو من شريط الآليات للتحكم بها'
          : 'Select a machinery unit from the map or fleet dock to initiate field operations.'}
      </div>
    );
  }

  const isExcavator = vehicle.type === 'excavator';
  const isBulldozer = vehicle.type === 'bulldozer';
  const isCrane = vehicle.type === 'crane';
  const isDumpTruck = vehicle.type === 'dump_truck';
  const isRoller = vehicle.type === 'roller';
  const isLightRig = vehicle.type === 'floodlight_rig';

  return (
    <div className="bg-stone-900/95 border-2 border-stone-800 rounded-lg p-3 sm:p-4 text-stone-200 shadow-xl backdrop-blur">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 text-sm">
            {vehicle.modelCode}
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-amber-400">
              {lang === 'ar' ? vehicle.nameAr : vehicle.nameEn}
            </h3>
            <div className="text-xs text-stone-400 flex items-center gap-2">
              <span>{lang === 'ar' ? `الموقع: [${vehicle.x}, ${vehicle.y}]` : `Position: [${vehicle.x}, ${vehicle.y}]`}</span>
              <span aria-hidden="true">·</span>
              <span>{lang === 'ar' ? `الحالة:` : `Status:`} {vehicle.currentAction || 'idle'}</span>
            </div>
          </div>
        </div>

        {/* Vital Gauges */}
        <div className="flex items-center gap-4 text-xs font-mono-tech">
          {/* Fuel */}
          <div className="flex items-center gap-1.5">
            <Fuel className={`w-4 h-4 ${vehicle.fuel < 25 ? 'text-red-500 animate-pulse' : 'text-amber-400'}`} />
            <div>
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>{lang === 'ar' ? 'الوقود' : 'Fuel'}</span>
                <span>{Math.round(vehicle.fuel)}%</span>
              </div>
              <div className="w-16 h-1.5 bg-stone-800 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${vehicle.fuel < 25 ? 'bg-red-500' : 'bg-amber-400'}`} 
                  style={{ width: `${Math.max(0, vehicle.fuel)}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Condition / Wear */}
          <div className="flex items-center gap-1.5">
            <Wrench className={`w-4 h-4 ${vehicle.condition < 35 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`} />
            <div>
              <div className="flex justify-between text-[10px] text-stone-400">
                <span>{lang === 'ar' ? 'الكفاءة' : 'Wear'}</span>
                <span>{Math.round(vehicle.condition)}%</span>
              </div>
              <div className="w-16 h-1.5 bg-stone-800 rounded overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${vehicle.condition < 35 ? 'bg-red-500' : 'bg-emerald-400'}`} 
                  style={{ width: `${Math.max(0, vehicle.condition)}%` }} 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown or Stuck alert bar */}
      {vehicle.isStuckInMud && (
        <div className="mb-3 p-2 bg-amber-950/80 border border-amber-600/50 rounded flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 animate-bounce" />
            <span>
              {lang === 'ar' 
                ? '⚠️ الآلية غارقة في الوحل العميق! استخدم ونش البلدوزر لسحبها أو خفف الحمل.'
                : '⚠️ Vehicle mired in deep mud! Deploy bulldozer winch or reduce payload.'}
            </span>
          </div>
          <button 
            onClick={onWinchPull}
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded text-xs transition"
          >
            {lang === 'ar' ? 'محاولة السحب الذاتي' : 'Winch Out'}
          </button>
        </div>
      )}

      {vehicle.isBrokenDown && (
        <div className="mb-3 p-2 bg-red-950/80 border border-red-600/50 rounded flex items-center justify-between text-xs text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />
            <span>
              {lang === 'ar' 
                ? `عطل ميكانيكي حرج: ${vehicle.breakdownReason === 'out_of_fuel' ? 'نفاد الوقود' : 'كسر جنزير / تسريب هيدروليك'}!`
                : `Critical Mechanical Breakdown: ${vehicle.breakdownReason || 'Hardware failure'}!`}
            </span>
          </div>
          <button 
            onClick={onRepair}
            disabled={funds < 250}
            className="px-2.5 py-1 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded text-xs transition"
          >
            {lang === 'ar' ? 'إصلاح طوارئ ($250)' : 'Emergency Repair ($250)'}
          </button>
        </div>
      )}

      {/* Main Grid: D-Pad Navigation + Tactical Work Actions */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Directional Pad */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-2 bg-stone-950/60 rounded border border-stone-800">
          <span className="text-[10px] text-stone-400 mb-1 flex items-center gap-1 font-mono-tech">
            <Compass className="w-3 h-3" />
            {lang === 'ar' ? 'التحكم الميداني المباشر (WASD)' : 'Direct Drive (WASD)'}
          </span>
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              onClick={() => onMoveManual(0, -1)}
              className="w-10 h-10 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 rounded flex items-center justify-center font-bold text-stone-200 transition active:scale-95"
              title="Move Up (W)"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
            <div />

            <button
              onClick={() => onMoveManual(-1, 0)}
              className="w-10 h-10 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 rounded flex items-center justify-center font-bold text-stone-200 transition active:scale-95"
              title="Move Left (A)"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 flex items-center justify-center text-xs text-stone-500 font-mono-tech">
              ●
            </div>
            <button
              onClick={() => onMoveManual(1, 0)}
              className="w-10 h-10 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 rounded flex items-center justify-center font-bold text-stone-200 transition active:scale-95"
              title="Move Right (D)"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <div />
            <button
              onClick={() => onMoveManual(0, 1)}
              className="w-10 h-10 bg-stone-800 hover:bg-amber-500 hover:text-stone-950 rounded flex items-center justify-center font-bold text-stone-200 transition active:scale-95"
              title="Move Down (S)"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <div />
          </div>
        </div>

        {/* Operational Engineering Actions */}
        <div className="md:col-span-8 flex flex-col gap-2">
          <div className="text-[11px] text-stone-400 font-mono-tech flex items-center justify-between">
            <span>{lang === 'ar' ? 'المهام الهندسية التكتيكية:' : 'Tactical Engineering Actions:'}</span>
            <span className="text-stone-400">
              {lang === 'ar' ? 'الموقع الحالي:' : 'At Cell:'} {currentCell?.type || 'ground'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {/* Context-aware buttons for excavator */}
            {isExcavator && (
              <>
                <button
                  onClick={() => onPerformAction('dig_canal')}
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded text-amber-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">⛏️</span>
                  <span>{lang === 'ar' ? 'حفر قناة تصريف' : 'Dig Canal Trench'}</span>
                </button>
                <button
                  onClick={() => onPerformAction('clear_rubble')}
                  className="p-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded text-stone-200 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🪨</span>
                  <span>{lang === 'ar' ? 'تفتيت وإزالة الركام' : 'Break Rubble'}</span>
                </button>
                <button
                  onClick={() => onPerformAction('rescue_survivor')}
                  className="p-2 bg-red-500/15 hover:bg-red-500/25 border border-red-500/40 rounded text-red-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🚨</span>
                  <span>{lang === 'ar' ? 'استخراج العالقين' : 'Extract Survivors'}</span>
                </button>
              </>
            )}

            {/* Context-aware buttons for bulldozer */}
            {isBulldozer && (
              <>
                <button
                  onClick={() => onPerformAction('plow_road')}
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded text-amber-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🚜</span>
                  <span>{lang === 'ar' ? 'تسوية وشق الطريق' : 'Plow & Grade Road'}</span>
                </button>
                <button
                  onClick={() => onPerformAction('push_rubble')}
                  className="p-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded text-stone-200 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">💥</span>
                  <span>{lang === 'ar' ? 'إزاحة الكتل الصخرية' : 'Push Big Debris'}</span>
                </button>
                <button
                  onClick={() => onPerformAction('winch_tow')}
                  className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 rounded text-cyan-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🪝</span>
                  <span>{lang === 'ar' ? 'سحب المركبات الغارقة' : 'Winch Stranded Truck'}</span>
                </button>
              </>
            )}

            {/* Crane */}
            {isCrane && (
              <>
                <button
                  onClick={() => onPerformAction('lift_slab')}
                  className="p-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded text-stone-200 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🏗️</span>
                  <span>{lang === 'ar' ? 'رفع الكتل الإسمنتية' : 'Hoist Concrete Slab'}</span>
                </button>
                <button
                  onClick={() => onPerformAction('install_bridge')}
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded text-amber-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🌉</span>
                  <span>{lang === 'ar' ? 'تركيب جسر فولاذي' : 'Install Bailey Bridge'}</span>
                </button>
                <button
                  onClick={() => onPerformAction('place_levee')}
                  className="p-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/40 rounded text-teal-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🛡️</span>
                  <span>{lang === 'ar' ? 'إنزال حاجز الفيضان' : 'Place Levee Barrier'}</span>
                </button>
              </>
            )}

            {/* Dump truck */}
            {isDumpTruck && (
              <>
                <button
                  onClick={() => onPerformAction('load_rubble')}
                  className="p-2 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded text-stone-200 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🚛</span>
                  <span>{lang === 'ar' ? 'تحميل الردميات' : 'Load Debris'}</span>
                </button>
                <button
                  onClick={() => onPerformAction('dump_aggregate')}
                  className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 rounded text-amber-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">⛰️</span>
                  <span>{lang === 'ar' ? 'نثر الحصى للتثبيت' : 'Spread Aggregate'}</span>
                </button>
                <button
                  onClick={() => onPerformAction('transport_depot')}
                  className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">♻️</span>
                  <span>{lang === 'ar' ? 'تفريغ في مركز التدوير' : 'Dump at Depot'}</span>
                </button>
              </>
            )}

            {/* Roller */}
            {isRoller && (
              <>
                <button
                  onClick={() => onPerformAction('compact_road')}
                  className="col-span-2 p-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 rounded text-amber-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">🚜</span>
                  <span>{lang === 'ar' ? 'دمج ورصف الطريق بالاهتزاز' : 'Vibratory Road Compacting'}</span>
                </button>
              </>
            )}

            {/* Light rig */}
            {isLightRig && (
              <>
                <button
                  onClick={() => onPerformAction('toggle_light')}
                  className="col-span-2 p-2 bg-yellow-500/15 hover:bg-yellow-500/25 border border-yellow-500/40 rounded text-yellow-300 font-semibold text-xs flex flex-col items-center gap-1 transition"
                >
                  <span className="text-base">💡</span>
                  <span>{lang === 'ar' ? 'تشغيل / توجيه الكشافات' : 'Toggle 360° Lights'}</span>
                </button>
              </>
            )}

            {/* Standard Field Support Actions */}
            <button
              onClick={() => {
                soundManager.playHydraulic();
                onRefuel();
              }}
              disabled={fuelReserves <= 0 || vehicle.fuel >= 95}
              className="p-2 bg-stone-950 hover:bg-stone-800 disabled:opacity-40 border border-stone-800 rounded text-xs flex flex-col items-center gap-1 text-stone-300 transition"
              title="تزويد بالوقود من الاحتياطي"
            >
              <Fuel className="w-4 h-4 text-amber-400" />
              <span>{lang === 'ar' ? 'تزويد وقود' : 'Refuel Tank'}</span>
            </button>

            <button
              onClick={() => {
                soundManager.playHydraulic();
                onRepair();
              }}
              disabled={funds < 150 || vehicle.condition >= 95}
              className="p-2 bg-stone-950 hover:bg-stone-800 disabled:opacity-40 border border-stone-800 rounded text-xs flex flex-col items-center gap-1 text-stone-300 transition"
              title="صيانة ميدانية"
            >
              <Wrench className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'ar' ? 'صيانة سريعة ($150)' : 'Field Tune ($150)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
