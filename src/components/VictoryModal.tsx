import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { DisasterSector, Language } from '../types/game';
import { Award, DollarSign, Users, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { soundManager } from '../utils/audio';

interface VictoryModalProps {
  mission: DisasterSector;
  lang: Language;
  onContinue: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  mission,
  lang,
  onContinue,
}) => {
  useEffect(() => {
    soundManager.playVictory();
    // Confetti burst
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#eab308', '#22c55e', '#38bdf8', '#f97316'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-stone-900 border-2 border-amber-500 rounded-2xl max-w-lg w-full p-6 text-stone-100 shadow-2xl relative overflow-hidden text-center animate-scale-up">
        <div className="absolute top-0 left-0 right-0 h-2 hazard-stripe-yellow" />

        <div className="w-16 h-16 bg-amber-500/20 border-2 border-amber-500 rounded-full mx-auto flex items-center justify-center text-3xl mb-4 mt-2">
          🏆
        </div>

        <span className="text-xs font-mono-tech text-amber-400 uppercase tracking-widest">
          {lang === 'ar' ? 'نجاح المهمة الهندسية!' : 'Mission Accomplished!'}
        </span>

        <h2 className="text-2xl sm:text-3xl font-heading font-black text-stone-100 mt-1">
          {lang === 'ar' ? 'تم تأمين قطاع الكارثة بنجاح' : 'Sector Successfully Secured'}
        </h2>

        <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
          {lang === 'ar' 
            ? `بفضل كفاءة فرقة المهندسين الأخيرين، تم فتح الشريان الحيوي وتصريف المياه وإنقاذ جميع العالقين في ${mission.titleAr}. قوافل الإسعاف والإغاثة تعبر بأمان الآن!`
            : `Thanks to the courage and heavy machinery of The Last Operators, the vital corridor in ${mission.titleEn} is restored! Relief convoys are crossing safely!`}
        </p>

        {/* Animated Relief Convoy Visual */}
        <div className="my-5 p-3 bg-stone-950 rounded-xl border border-stone-800 overflow-hidden relative">
          <div className="text-[11px] text-stone-400 font-mono-tech mb-2">
            {lang === 'ar' ? 'قافلة الإغاثة الوطنية تعبر الطريق الممهد:' : 'Relief Convoy Crossing Safe Lifeline:'}
          </div>
          <div className="flex items-center justify-around text-2xl py-2">
            <span className="animate-bounce">🚑</span>
            <span className="animate-pulse">🚛</span>
            <span className="animate-bounce">🚒</span>
            <span>🚙</span>
          </div>
          <div className="h-1.5 w-full bg-emerald-500/80 rounded" />
        </div>

        {/* Rewards Breakdown */}
        <div className="grid grid-cols-3 gap-2 text-xs font-mono-tech mb-6">
          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <DollarSign className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <div className="text-stone-400 text-[10px]">{lang === 'ar' ? 'المكافأة' : 'Funds'}</div>
            <div className="font-bold text-emerald-400 text-sm">+${mission.rewardMoney.toLocaleString()}</div>
          </div>

          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <Award className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
            <div className="text-stone-400 text-[10px]">{lang === 'ar' ? 'السمعة' : 'Reputation'}</div>
            <div className="font-bold text-cyan-400 text-sm">+{mission.rewardReputation} PTS</div>
          </div>

          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800">
            <Users className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <div className="text-stone-400 text-[10px]">{lang === 'ar' ? 'الأرواح' : 'Survivors'}</div>
            <div className="font-bold text-red-400 text-sm">+{mission.survivorsCount}</div>
          </div>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onContinue();
          }}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-heading font-black text-sm rounded-xl shadow-xl transition flex items-center justify-center gap-2 transform active:scale-95"
        >
          <span>{lang === 'ar' ? 'استلام المكافآت والعودة للمقر العام' : 'Collect Rewards & Return to HQ'}</span>
          {lang === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
