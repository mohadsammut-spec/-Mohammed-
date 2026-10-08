import React from 'react';
import { 
  DisasterSector, 
  GameResources, 
  RadioMessage, 
  WeatherType, 
  Language, 
  Machine 
} from '../types/game';
import { 
  CloudRain, 
  Moon, 
  Sun, 
  CloudLightning, 
  DollarSign, 
  Fuel, 
  Users, 
  Radio, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Languages, 
  Layers,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface TacticalHUDProps {
  mission: DisasterSector;
  resources: GameResources;
  weather: WeatherType;
  radioLog: RadioMessage[];
  vehicles: Machine[];
  selectedVehicleId: string | null;
  onSelectVehicle: (id: string) => void;
  lang: Language;
  onToggleLang: () => void;
  onReturnToHQ: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TacticalHUD: React.FC<TacticalHUDProps> = ({
  mission,
  resources,
  weather,
  radioLog,
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  lang,
  onToggleLang,
  onReturnToHQ,
  soundEnabled,
  onToggleSound,
}) => {
  const getWeatherIcon = (w: WeatherType) => {
    switch (w) {
      case 'clear':
        return <Sun className="w-4 h-4 text-amber-400" />;
      case 'rain':
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
      case 'torrential_storm':
        return <CloudLightning className="w-4 h-4 text-cyan-300 animate-bounce" />;
      case 'night_clear':
        return <Moon className="w-4 h-4 text-indigo-300" />;
      case 'night_storm':
        return <CloudLightning className="w-4 h-4 text-red-400 animate-pulse" />;
      default:
        return <CloudRain className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getWeatherLabel = (w: WeatherType) => {
    if (lang === 'ar') {
      switch (w) {
        case 'clear': return 'طقس مستقر';
        case 'rain': return 'أمطار غزيرة';
        case 'torrential_storm': return 'طوفان / عاصفة رعدية';
        case 'night_clear': return 'عمليات ليلية';
        case 'night_storm': return 'عاصفة ليلية عاتية';
        default: return 'ضباب كثيف';
      }
    } else {
      switch (w) {
        case 'clear': return 'Clear Sky';
        case 'rain': return 'Heavy Rain';
        case 'torrential_storm': return 'Deluge Storm';
        case 'night_clear': return 'Night Ops';
        case 'night_storm': return 'Severe Night Storm';
        default: return 'Heavy Fog';
      }
    }
  };

  return (
    <header className="w-full flex flex-col gap-2 p-2 sm:p-3 bg-stone-950/90 border-b border-stone-800 text-stone-200 shadow-md">
      {/* Top Operations Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Mission Title & Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={onReturnToHQ}
            className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded text-xs text-amber-400 font-semibold flex items-center gap-1.5 transition"
            title={lang === 'ar' ? 'العودة لمركز القيادة' : 'Back to Command HQ'}
          >
            {lang === 'ar' ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
            <span>{lang === 'ar' ? 'المقر العام' : 'HQ Command'}</span>
          </button>

          <div>
            <div className="flex items-center gap-2 text-xs font-heading font-bold text-amber-400">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span>{lang === 'ar' ? mission.titleAr : mission.titleEn}</span>
            </div>
            <div className="text-[11px] text-stone-400">
              {lang === 'ar' ? mission.disasterTypeAr : mission.disasterTypeEn}
            </div>
          </div>
        </div>

        {/* Resources & Gauges */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs font-mono-tech">
          {/* Emergency Funds */}
          <div className="flex items-center gap-1 text-emerald-400">
            <DollarSign className="w-4 h-4" />
            <span className="font-bold">${resources.funds.toLocaleString()}</span>
          </div>

          {/* Fuel reserves */}
          <div className="flex items-center gap-1 text-amber-400">
            <Fuel className="w-4 h-4" />
            <span>{resources.fuelReserves}L</span>
          </div>

          {/* Rescued Survivors */}
          <div className="flex items-center gap-1 text-red-400">
            <Users className="w-4 h-4" />
            <span className="font-bold">{resources.totalSurvivorsRescued}</span>
            <span className="text-[10px] text-stone-400">{lang === 'ar' ? 'تم إنقاذهم' : 'rescued'}</span>
          </div>

          {/* Weather Indicator */}
          <div className="flex items-center gap-1.5 bg-stone-900 px-2 py-1 rounded border border-stone-800">
            {getWeatherIcon(weather)}
            <span className="text-[11px] text-stone-300">{getWeatherLabel(weather)}</span>
          </div>

          {/* Sound & Language Toggles */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 transition"
              title={soundEnabled ? 'كتم الصوت' : 'تشغيل الصوت'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-400" />}
            </button>
            <button
              onClick={onToggleLang}
              className="px-2 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold transition flex items-center gap-1"
              title="تغيير اللغة"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Operations Grid: Mission Objectives Tracker + Radio Dispatch Stream */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 pt-1 border-t border-stone-800/80">
        {/* Objectives Progress Tracker */}
        <div className="md:col-span-7 bg-stone-900/60 p-2 rounded border border-stone-800/60 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] text-amber-400 font-semibold">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              {lang === 'ar' ? 'أهداف المهمة الإلزامية:' : 'Critical Objectives:'}
            </span>
            <span className="text-stone-400 font-mono-tech">
              {mission.objectives.filter(o => o.completed).length} / {mission.objectives.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {mission.objectives.map(obj => (
              <div 
                key={obj.id} 
                className={`p-1.5 rounded border text-[11px] flex flex-col justify-between ${
                  obj.completed 
                    ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300' 
                    : 'bg-stone-950/40 border-stone-800 text-stone-300'
                }`}
              >
                <div className="font-semibold truncate">
                  {obj.completed ? '✓ ' : '○ '}
                  {lang === 'ar' ? obj.titleAr : obj.titleEn}
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-stone-400 font-mono-tech">
                  <span>
                    {obj.current} / {obj.target} {lang === 'ar' ? obj.unitAr : obj.unitEn}
                  </span>
                  <span>{Math.round((obj.current / obj.target) * 100)}%</span>
                </div>
                <div className="w-full h-1 bg-stone-800 rounded mt-0.5 overflow-hidden">
                  <div 
                    className={`h-full ${obj.completed ? 'bg-emerald-400' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(100, (obj.current / obj.target) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Emergency Radio Feed */}
        <div className="md:col-span-5 bg-stone-900/60 p-2 rounded border border-stone-800/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono-tech mb-1">
            <span className="flex items-center gap-1 text-cyan-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              {lang === 'ar' ? 'بث اللاسلكي الميداني:' : 'Live Tactical Radio:'}
            </span>
            <span className="text-[10px] text-stone-500">CH-09 RESCUE</span>
          </div>

          <div className="overflow-hidden h-12 flex flex-col justify-end text-[11px] leading-tight">
            {radioLog.slice(-1).map(msg => (
              <div key={msg.id} className="animate-fade-in">
                <span className="text-amber-400 font-semibold font-heading">
                  [{lang === 'ar' ? msg.senderAr : msg.senderEn}]:{' '}
                </span>
                <span className="text-stone-300">
                  {lang === 'ar' ? msg.messageAr : msg.messageEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Machinery Fleet Switcher Dock */}
      <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5">
        <span className="text-[11px] text-stone-400 font-mono-tech whitespace-nowrap pl-1">
          {lang === 'ar' ? 'الآليات الميدانية:' : 'Fleet Dock:'}
        </span>
        {vehicles.filter(v => v.owned).map(v => {
          const isSelected = v.id === selectedVehicleId;
          return (
            <button
              key={v.id}
              onClick={() => {
                soundManager.playClick();
                onSelectVehicle(v.id);
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                isSelected
                  ? 'bg-amber-500 text-stone-950 shadow-md font-bold'
                  : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
              }`}
            >
              <span className="font-mono-tech text-[10px]">{v.modelCode}</span>
              <span>{lang === 'ar' ? v.nameAr.split(' ')[0] : v.nameEn.split(' ')[0]}</span>
              {v.isStuckInMud && <span className="text-amber-950 font-bold">⚠️</span>}
              {v.isBrokenDown && <span className="text-red-500 font-bold">!</span>}
            </button>
          );
        })}
      </div>
    </header>
  );
};
