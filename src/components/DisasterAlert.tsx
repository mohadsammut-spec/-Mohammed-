import React from 'react';
import { DynamicHazardEvent, Language } from '../types/game';
import { AlertOctagon, X } from 'lucide-react';

interface DisasterAlertProps {
  event: DynamicHazardEvent | null;
  onDismiss: () => void;
  lang: Language;
}

export const DisasterAlert: React.FC<DisasterAlertProps> = ({
  event,
  onDismiss,
  lang,
}) => {
  if (!event) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 max-w-xl w-11/12 animate-bounce">
      <div className="bg-red-950/95 border-2 border-red-500 rounded-xl p-3 sm:p-4 text-red-100 shadow-2xl flex items-center justify-between gap-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600/30 rounded-lg text-red-400">
            <AlertOctagon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-mono-tech uppercase tracking-wider text-red-400">
              🚨 {lang === 'ar' ? 'إنذار طوارئ فوري' : 'Critical Hazard Alert'}
            </div>
            <h4 className="font-heading font-black text-sm sm:text-base text-stone-100">
              {lang === 'ar' ? event.titleAr : event.titleEn}
            </h4>
            <p className="text-xs text-red-200 mt-0.5 leading-snug">
              {lang === 'ar' ? event.descAr : event.descEn}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1.5 hover:bg-red-800/40 rounded text-red-300 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
