import React, { useState } from 'react';
import { 
  DisasterSector, 
  GameResources, 
  Machine, 
  Operator, 
  Language 
} from '../types/game';
import { 
  ShieldAlert, 
  Truck, 
  Users, 
  Wrench, 
  Package, 
  DollarSign, 
  Fuel, 
  Award, 
  Play, 
  CheckCircle, 
  Lock, 
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface HQOverviewProps {
  missions: DisasterSector[];
  activeMissionId: string;
  onSelectMission: (missionId: string) => void;
  onDeployToMission: (missionId: string) => void;
  vehicles: Machine[];
  onBuyVehicle: (vehicleId: string) => void;
  onUpgradeVehicle: (vehicleId: string, upgradeId: string) => void;
  operators: Operator[];
  onHireOperator: (operatorId: string) => void;
  onAssignOperator: (operatorId: string, vehicleId: string | null) => void;
  resources: GameResources;
  onBuySupplies: (type: 'fuel' | 'steel' | 'concrete', cost: number, amount: number) => void;
  lang: Language;
}

export const HQOverview: React.FC<HQOverviewProps> = ({
  missions,
  activeMissionId,
  onDeployToMission,
  vehicles,
  onBuyVehicle,
  onUpgradeVehicle,
  operators,
  onHireOperator,
  onAssignOperator,
  resources,
  onBuySupplies,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'fleet' | 'personnel' | 'logistics'>('missions');
  const [selectedMachineId, setSelectedMachineId] = useState<string>(vehicles[0]?.id || '');
  const [selectedSectorId, setSelectedSectorId] = useState<string>(activeMissionId);

  const selectedMachine = vehicles.find(v => v.id === selectedMachineId) || vehicles[0];
  const selectedSector = missions.find(m => m.id === selectedSectorId) || missions[0];

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-6 flex flex-col gap-5 overflow-y-auto blueprint-grid">
      {/* Top Banner: Emergency Command Hub */}
      <div className="bg-stone-900 border-2 border-stone-800 rounded-xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 hazard-stripe-yellow" />
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-tech text-amber-500 uppercase tracking-wider mb-1">
              <span>● {lang === 'ar' ? 'غرفة العمليات المركزية المتنقلة' : 'Mobile Emergency Command Post'}</span>
              <span aria-hidden="true">·</span>
              <span>DEFCON-2</span>
            </div>
            <h1 className="text-xl sm:text-3xl font-heading font-black text-stone-100 tracking-tight">
              {lang === 'ar' ? 'المهندسون الأخيرون: جبهة الإنقاذ' : 'The Last Operators: Rescue Frontier'}
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-2xl leading-relaxed">
              {lang === 'ar' 
                ? 'إدارة الأسطول الهندسي لمواجهة الكوارث الطبيعية، فتح الشرايين الحيوية، وإنقاذ الأرواح العالقة في البيئات غير المستقرة.'
                : 'Command your fleet of disaster response heavy machinery. Open lifelines, divert floods, and save lives.'}
            </p>
          </div>

          {/* Key Resource Badges */}
          <div className="flex flex-wrap items-center gap-3 font-mono-tech text-xs">
            <div className="bg-stone-950 px-3 py-2 rounded-lg border border-stone-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[10px] text-stone-400">{lang === 'ar' ? 'ميزانية الطوارئ' : 'Emergency Funds'}</div>
                <div className="font-bold text-emerald-400 text-sm">${resources.funds.toLocaleString()}</div>
              </div>
            </div>

            <div className="bg-stone-950 px-3 py-2 rounded-lg border border-stone-800 flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-stone-400">{lang === 'ar' ? 'احتياطي الديزل' : 'Fuel Reserves'}</div>
                <div className="font-bold text-amber-400 text-sm">{resources.fuelReserves} L</div>
              </div>
            </div>

            <div className="bg-stone-950 px-3 py-2 rounded-lg border border-stone-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] text-stone-400">{lang === 'ar' ? 'السمعة الهندسية' : 'Reputation'}</div>
                <div className="font-bold text-cyan-400 text-sm">{resources.reputation} PTS</div>
              </div>
            </div>

            <div className="bg-stone-950 px-3 py-2 rounded-lg border border-stone-800 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-400" />
              <div>
                <div className="text-[10px] text-stone-400">{lang === 'ar' ? 'الناجون المنقذون' : 'Lives Saved'}</div>
                <div className="font-bold text-red-400 text-sm">{resources.totalSurvivorsRescued}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation (Segmented buttons) */}
        <div className="flex items-center gap-1.5 mt-5 border-t border-stone-800/80 pt-4 overflow-x-auto">
          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('missions');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'missions'
                ? 'bg-amber-500 text-stone-950 shadow-lg'
                : 'bg-stone-800/70 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{lang === 'ar' ? 'خريطة الكوارث والمهام' : 'Disaster Sectors'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('fleet');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'fleet'
                ? 'bg-amber-500 text-stone-950 shadow-lg'
                : 'bg-stone-800/70 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{lang === 'ar' ? 'مرآب الآليات والتطوير' : 'Fleet & Upgrades'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('personnel');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'personnel'
                ? 'bg-amber-500 text-stone-950 shadow-lg'
                : 'bg-stone-800/70 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'ar' ? 'طاقم المهندسين والسائقين' : 'Crew & Operators'}</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              setActiveTab('logistics');
            }}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition ${
              activeTab === 'logistics'
                ? 'bg-amber-500 text-stone-950 shadow-lg'
                : 'bg-stone-800/70 text-stone-300 hover:bg-stone-800'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>{lang === 'ar' ? 'المستودع ومواد البناء' : 'Logistics & Depot'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Disaster Sectors & Deployment */}
      {activeTab === 'missions' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sector List */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <h2 className="text-sm font-heading font-bold text-stone-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              {lang === 'ar' ? 'قطاعات الطوارئ الميدانية:' : 'Active Emergency Sectors:'}
            </h2>

            <div className="flex flex-col gap-2.5">
              {missions.map(m => {
                const isSelected = m.id === selectedSectorId;
                return (
                  <div
                    key={m.id}
                    onClick={() => {
                      if (m.unlocked) {
                        soundManager.playClick();
                        setSelectedSectorId(m.id);
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-right transition cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-stone-900 border-amber-500/80 shadow-lg ring-1 ring-amber-500/40'
                        : m.unlocked
                        ? 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                        : 'bg-stone-950/40 border-stone-900 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {/* Status corner badge */}
                    <div className="flex items-center justify-between mb-1.5 text-xs font-mono-tech">
                      <span className="flex items-center gap-1.5 text-stone-400">
                        {m.unlocked ? (
                          m.completed ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-bold">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {lang === 'ar' ? 'مكتمل بنجاح' : 'Secured'}
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold">
                              ● {lang === 'ar' ? 'نشط ميدانياً' : 'Active'}
                            </span>
                          )
                        ) : (
                          <span className="text-stone-500 flex items-center gap-1">
                            <Lock className="w-3.5 h-3.5" />
                            {lang === 'ar' ? 'مغلق حتى إنجاز السابق' : 'Locked'}
                          </span>
                        )}
                      </span>

                      <span className={`text-[11px] font-bold ${
                        m.dangerLevel === 'extreme' ? 'text-red-500' :
                        m.dangerLevel === 'critical' ? 'text-orange-400' :
                        'text-amber-400'
                      }`}>
                        {lang === 'ar' ? `الخطورة: ${m.dangerLevel}` : `Danger: ${m.dangerLevel}`}
                      </span>
                    </div>

                    <h3 className="font-heading font-bold text-stone-100 text-sm sm:text-base">
                      {lang === 'ar' ? m.titleAr : m.titleEn}
                    </h3>
                    <p className="text-xs text-stone-400 mt-1 line-clamp-2">
                      {lang === 'ar' ? m.subTitleAr : m.subTitleEn}
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-800/60 text-xs font-mono-tech text-stone-400">
                      <span>💰 +${m.rewardMoney.toLocaleString()}</span>
                      <span>⭐ +{m.rewardReputation} PTS</span>
                      <span>🚨 {m.survivorsCount} {lang === 'ar' ? 'عالقون' : 'victims'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Sector Briefing & Deployment */}
          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-xl p-5 sm:p-6 flex flex-col justify-between shadow-xl">
            <div>
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
                <div>
                  <span className="text-xs font-mono-tech text-amber-500 uppercase">
                    {lang === 'ar' ? 'تقرير استخبارات الطوارئ' : 'Emergency Tactical Briefing'}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-heading font-black text-stone-100 mt-0.5">
                    {lang === 'ar' ? selectedSector.titleAr : selectedSector.titleEn}
                  </h2>
                </div>

                <div className="text-right">
                  <div className="text-[11px] text-stone-400 font-mono-tech">{lang === 'ar' ? 'نوع الكارثة' : 'Disaster Classification'}</div>
                  <div className="text-sm font-bold text-amber-400">
                    {lang === 'ar' ? selectedSector.disasterTypeAr : selectedSector.disasterTypeEn}
                  </div>
                </div>
              </div>

              {/* Story Brief */}
              <div className="bg-stone-950 p-4 rounded-lg border border-stone-800/80 mb-4">
                <h4 className="text-xs font-bold text-stone-300 mb-1 flex items-center gap-1.5 font-mono-tech">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  {lang === 'ar' ? 'الموقف الميداني الراهن:' : 'Field Situation:'}
                </h4>
                <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                  {lang === 'ar' ? selectedSector.briefingAr : selectedSector.briefingEn}
                </p>
              </div>

              {/* Objectives List */}
              <div className="mb-5">
                <h4 className="text-xs font-bold text-stone-300 mb-2 font-mono-tech">
                  {lang === 'ar' ? 'الأهداف التشغيلية المطلوبة:' : 'Mandatory Mission Objectives:'}
                </h4>
                <div className="space-y-2">
                  {selectedSector.objectives.map(obj => (
                    <div key={obj.id} className="p-2.5 bg-stone-950/60 rounded border border-stone-800 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-stone-200">
                          {lang === 'ar' ? obj.titleAr : obj.titleEn}
                        </div>
                        <div className="text-stone-400 text-[11px]">
                          {lang === 'ar' ? obj.descriptionAr : obj.descriptionEn}
                        </div>
                      </div>
                      <div className="font-mono-tech text-amber-400 font-bold whitespace-nowrap pl-2">
                        {obj.target} {lang === 'ar' ? obj.unitAr : obj.unitEn}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Launch Mission Action Button */}
            <div className="pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-stone-400">
                {lang === 'ar' 
                  ? 'سيتم نشر جميع الآليات المملوكة في قطاع الطوارئ'
                  : 'All operational fleet units will deploy to this sector.'}
              </div>

              <button
                onClick={() => {
                  soundManager.playVictory();
                  onDeployToMission(selectedSector.id);
                }}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-black text-sm rounded-lg shadow-xl flex items-center gap-2 transition transform active:scale-95"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>{lang === 'ar' ? 'الانتقال إلى جبهة الكارثة' : 'Deploy Fleet to Sector'}</span>
                {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Fleet Garage & Workshop Upgrades */}
      {activeTab === 'fleet' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Machines Roster Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-2.5">
            <h2 className="text-sm font-heading font-bold text-stone-300 flex items-center gap-2">
              <Truck className="w-4 h-4 text-amber-500" />
              {lang === 'ar' ? 'أسطول الآليات الثقيلة:' : 'Machinery Fleet Catalog:'}
            </h2>

            <div className="space-y-2">
              {vehicles.map(v => {
                const isSelected = v.id === selectedMachineId;
                return (
                  <div
                    key={v.id}
                    onClick={() => {
                      soundManager.playClick();
                      setSelectedMachineId(v.id);
                    }}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-stone-900 border-amber-500 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-stone-900/60 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono-tech font-bold text-amber-400 text-xs">
                        {v.modelCode}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-200 text-sm">
                          {lang === 'ar' ? v.nameAr : v.nameEn}
                        </h4>
                        <div className="text-xs text-stone-400">
                          {v.owned ? (
                            <span className="text-emerald-400">✓ {lang === 'ar' ? 'في الخدمة الميدانية' : 'Owned & Active'}</span>
                          ) : (
                            <span className="text-amber-400 font-mono-tech">${v.price.toLocaleString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-mono-tech text-stone-400">
                      {v.type}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Machine Workshop Details */}
          <div className="lg:col-span-7 bg-stone-900 border border-stone-800 rounded-xl p-5 sm:p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between border-b border-stone-800 pb-3 mb-4">
              <div>
                <span className="text-xs font-mono-tech text-amber-500">
                  {selectedMachine.modelCode} · {selectedMachine.type}
                </span>
                <h3 className="text-xl sm:text-2xl font-heading font-black text-stone-100">
                  {lang === 'ar' ? selectedMachine.nameAr : selectedMachine.nameEn}
                </h3>
              </div>

              {!selectedMachine.owned ? (
                <button
                  onClick={() => onBuyVehicle(selectedMachine.id)}
                  disabled={resources.funds < selectedMachine.price}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-stone-950 font-bold text-xs rounded-lg shadow transition flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>{lang === 'ar' ? `شراء للأسطول ($${selectedMachine.price})` : `Purchase ($${selectedMachine.price})`}</span>
                </button>
              ) : (
                <span className="px-3 py-1 bg-emerald-950 border border-emerald-600 text-emerald-400 text-xs rounded font-bold">
                  {lang === 'ar' ? 'جاهزة للنشر الفوري' : 'Ready for Duty'}
                </span>
              )}
            </div>

            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4">
              {lang === 'ar' ? selectedMachine.descriptionAr : selectedMachine.descriptionEn}
            </p>

            {/* Performance Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-xs font-mono-tech">
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <div className="text-stone-400 text-[10px]">{lang === 'ar' ? 'قوة الحفر/الدفع' : 'Power Rating'}</div>
                <div className="font-bold text-amber-400 text-sm mt-0.5">
                  {Math.max(selectedMachine.digPower, selectedMachine.pushPower, selectedMachine.liftCapacity, selectedMachine.compactionPower)}
                </div>
              </div>
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <div className="text-stone-400 text-[10px]">{lang === 'ar' ? 'مقاومة الطين والوحل' : 'Mud Traction'}</div>
                <div className="font-bold text-amber-400 text-sm mt-0.5">
                  {Math.round(selectedMachine.mudTraction * 100)}%
                </div>
              </div>
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <div className="text-stone-400 text-[10px]">{lang === 'ar' ? 'السرعة القصوى' : 'Speed'}</div>
                <div className="font-bold text-amber-400 text-sm mt-0.5">
                  {selectedMachine.speed}x
                </div>
              </div>
              <div className="bg-stone-950 p-2.5 rounded border border-stone-800">
                <div className="text-stone-400 text-[10px]">{lang === 'ar' ? 'استهلاك الوقود' : 'Fuel Rate'}</div>
                <div className="font-bold text-amber-400 text-sm mt-0.5">
                  {selectedMachine.fuelConsumptionRate} /s
                </div>
              </div>
            </div>

            {/* Upgrades Workshop Tree */}
            <div>
              <h4 className="text-xs font-bold text-stone-300 mb-3 font-heading flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-500" />
                {lang === 'ar' ? 'تعديلات وتطويرات الورشة الهندسية:' : 'Engineering Upgrades & Mods:'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedMachine.upgrades.map(upg => (
                  <div
                    key={upg.id}
                    className={`p-3 rounded-lg border flex flex-col justify-between ${
                      upg.unlocked
                        ? 'bg-emerald-950/30 border-emerald-600/40 text-emerald-300'
                        : 'bg-stone-950 border-stone-800'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-200">
                        {lang === 'ar' ? upg.nameAr : upg.nameEn}
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                        {lang === 'ar' ? upg.descAr : upg.descEn}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between">
                      {upg.unlocked ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" />
                          {lang === 'ar' ? 'تم التركيب' : 'Installed'}
                        </span>
                      ) : (
                        <button
                          onClick={() => onUpgradeVehicle(selectedMachine.id, upg.id)}
                          disabled={!selectedMachine.owned || resources.funds < upg.cost}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs rounded transition flex items-center gap-1"
                        >
                          <span>{lang === 'ar' ? 'ترقية' : 'Upgrade'}</span>
                          <span className="font-mono-tech">(${upg.cost})</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Operators & Personnel Management */}
      {activeTab === 'personnel' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 sm:p-6 shadow-xl">
          <div className="border-b border-stone-800 pb-3 mb-4">
            <h2 className="text-lg sm:text-xl font-heading font-black text-stone-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              {lang === 'ar' ? 'سجل طاقم الطوارئ والمهندسين الميدانيين' : 'Emergency Crew Roster & Engineers'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {lang === 'ar' 
                ? 'تعيين المهندسين المتخصصين على الآليات يمنح مكافآت ضخمة لسرعة الحفر، وتوفير استهلاك الوقود، ومقاومة الأعطال الميكانيكية.'
                : 'Assign specialized operators to machinery to unlock major speed, fuel conservation, and repair bonuses.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {operators.map(op => {
              const assignedVehicle = vehicles.find(v => v.id === op.assignedVehicleId);
              return (
                <div key={op.id} className="bg-stone-950 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
                        {op.avatar}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-stone-100 text-sm">
                          {lang === 'ar' ? op.nameAr : op.nameEn}
                        </h4>
                        <div className="text-[11px] text-amber-400">
                          {lang === 'ar' ? op.roleAr : op.roleEn}
                        </div>
                      </div>
                    </div>

                    <div className="bg-stone-900/60 p-2.5 rounded border border-stone-800/60 text-xs mb-3">
                      <div className="text-[10px] text-stone-400 mb-0.5">{lang === 'ar' ? 'التخصص الاستثنائي:' : 'Specialty:'}</div>
                      <div className="text-stone-300 font-semibold leading-tight">
                        {lang === 'ar' ? op.specialtyAr : op.specialtyEn}
                      </div>
                    </div>

                    {/* Operator Bonuses */}
                    <div className="grid grid-cols-3 gap-1 text-[10px] font-mono-tech mb-3 text-center">
                      <div className="bg-stone-900 p-1.5 rounded">
                        <div className="text-stone-400">{lang === 'ar' ? 'السرعة' : 'Speed'}</div>
                        <div className="text-emerald-400 font-bold">+{Math.round(op.speedBonus * 100)}%</div>
                      </div>
                      <div className="bg-stone-900 p-1.5 rounded">
                        <div className="text-stone-400">{lang === 'ar' ? 'توفير ديزل' : 'Eco-Fuel'}</div>
                        <div className="text-amber-400 font-bold">+{Math.round(op.fuelEfficiencyBonus * 100)}%</div>
                      </div>
                      <div className="bg-stone-900 p-1.5 rounded">
                        <div className="text-stone-400">{lang === 'ar' ? 'مقاومة أعطال' : 'Reliability'}</div>
                        <div className="text-cyan-400 font-bold">+{Math.round(op.breakdownResistance * 100)}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-800/80">
                    {!op.hired ? (
                      <button
                        onClick={() => onHireOperator(op.id)}
                        disabled={resources.funds < op.salary}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs rounded transition flex items-center justify-center gap-1.5"
                      >
                        <span>{lang === 'ar' ? 'توظيف في الفريق' : 'Hire Operator'}</span>
                        <span className="font-mono-tech">(${op.salary})</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <select
                          value={op.assignedVehicleId || ''}
                          onChange={(e) => onAssignOperator(op.id, e.target.value || null)}
                          className="flex-1 bg-stone-900 border border-stone-700 text-xs rounded px-2 py-1.5 text-stone-200"
                        >
                          <option value="">{lang === 'ar' ? '-- بدون آلية معينة --' : '-- Unassigned --'}</option>
                          {vehicles.filter(v => v.owned).map(v => (
                            <option key={v.id} value={v.id}>
                              {v.modelCode} - {lang === 'ar' ? v.nameAr : v.nameEn}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: Logistics & Emergency Supplies */}
      {activeTab === 'logistics' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 sm:p-6 shadow-xl">
          <div className="border-b border-stone-800 pb-3 mb-4">
            <h2 className="text-lg sm:text-xl font-heading font-black text-stone-100 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              {lang === 'ar' ? 'مستودع المؤن الإنشائية والوقود' : 'Logistics Supply & Construction Depot'}
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              {lang === 'ar' 
                ? 'تخزين وقود الديزل الاحتياطي وعوارض الجسور الفولاذية والكتل الخرسانية لصد الفيضانات في الميدان.'
                : 'Purchase emergency fuel reserves, steel bridge girders, and precast flood breakwaters.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Fuel Barrels */}
            <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-400 mb-2 font-bold text-sm">
                  <Fuel className="w-5 h-5" />
                  <span>{lang === 'ar' ? 'براميل وقود الديزل (200L)' : 'Diesel Fuel Drum (200L)'}</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed mb-4">
                  {lang === 'ar' ? 'لتزويد الآليات العاملة في قلب الكوارث عندما تنفد خزاناتها.' : 'Refuel active machines on-site during prolonged emergency operations.'}
                </p>
                <div className="text-xs font-mono-tech text-stone-300 mb-2">
                  {lang === 'ar' ? 'المخزون الحالي:' : 'Current Stock:'} <strong>{resources.fuelReserves}L</strong>
                </div>
              </div>
              <button
                onClick={() => onBuySupplies('fuel', 200, 200)}
                disabled={resources.funds < 200}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 font-bold text-xs rounded transition flex items-center justify-center gap-1"
              >
                <span>{lang === 'ar' ? 'شراء 200 لتر' : 'Order 200L'}</span>
                <span className="font-mono-tech">($200)</span>
              </button>
            </div>

            {/* Steel Beams */}
            <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-cyan-400 mb-2 font-bold text-sm">
                  <Package className="w-5 h-5" />
                  <span>{lang === 'ar' ? 'عوارض جسور فولاذية (Bailey)' : 'Modular Steel Girders (x2)'}</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed mb-4">
                  {lang === 'ar' ? 'تستخدمها الرافعة لإنشاء معابر مؤقتة فوق الأودية والانهيارات الأرضية.' : 'Installed by heavy crane to create emergency bridge spans across chasms.'}
                </p>
                <div className="text-xs font-mono-tech text-stone-300 mb-2">
                  {lang === 'ar' ? 'المخزون الحالي:' : 'Current Stock:'} <strong>{resources.steelBeams}</strong>
                </div>
              </div>
              <button
                onClick={() => onBuySupplies('steel', 500, 2)}
                disabled={resources.funds < 500}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-stone-950 font-bold text-xs rounded transition flex items-center justify-center gap-1"
              >
                <span>{lang === 'ar' ? 'شراء عارضتين' : 'Order 2 Spans'}</span>
                <span className="font-mono-tech">($500)</span>
              </button>
            </div>

            {/* Concrete Levee Blocks */}
            <div className="bg-stone-950 border border-stone-800 p-4 rounded-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 mb-2 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5" />
                  <span>{lang === 'ar' ? 'كتل خرسانية لصد السيول (x3)' : 'Precast Concrete Blocks (x3)'}</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed mb-4">
                  {lang === 'ar' ? 'حواجز مضادة للمياه الهادرة توقف تمدد الفيضان نحو الأحياء السكنية.' : 'Heavy barriers placed to block raging water from flooding towns.'}
                </p>
                <div className="text-xs font-mono-tech text-stone-300 mb-2">
                  {lang === 'ar' ? 'المخزون الحالي:' : 'Current Stock:'} <strong>{resources.concreteBlocks}</strong>
                </div>
              </div>
              <button
                onClick={() => onBuySupplies('concrete', 400, 3)}
                disabled={resources.funds < 400}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-stone-950 font-bold text-xs rounded transition flex items-center justify-center gap-1"
              >
                <span>{lang === 'ar' ? 'شراء 3 كتل' : 'Order 3 Blocks'}</span>
                <span className="font-mono-tech">($400)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
