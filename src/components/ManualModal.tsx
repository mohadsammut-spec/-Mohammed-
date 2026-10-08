import React from 'react';
import { Language } from '../types/game';
import { X, BookOpen, Truck, ShieldAlert, Compass, Wrench, Droplet } from 'lucide-react';

interface ManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const ManualModal: React.FC<ManualModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-stone-900 border-2 border-stone-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-stone-200 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            <h3 className="font-heading font-black text-lg text-stone-100">
              {lang === 'ar' ? 'دليل التشغيل الميداني لفرقة الطوارئ' : 'Field Operations & Engineering Manual'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-stone-800 rounded text-stone-400 hover:text-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-stone-300 leading-relaxed">
          {/* Section 1: Machinery Roles */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2 font-heading">
              <Truck className="w-4 h-4" />
              {lang === 'ar' ? 'أدوار الآليات الثقيلة في الميدان:' : 'Machinery Operational Roles:'}
            </h4>
            <ul className="space-y-2 list-disc list-inside text-stone-300 text-xs">
              <li>
                <strong className="text-stone-100">{lang === 'ar' ? 'الحفارات العملاقة (Excavators):' : 'Excavators:'}</strong>{' '}
                {lang === 'ar' ? 'حفر قنوات تصريف المياه الجارفة، تفتيت كتل الصخور الضخمة، والبحث عن العالقين تحت الأنقاض واستخراجهم.' : 'Dig flood trenches, break heavy boulders, and extract victims from collapsed ruins.'}
              </li>
              <li>
                <strong className="text-stone-100">{lang === 'ar' ? 'البلدوزرات والجرافات (Bulldozers):' : 'Bulldozers:'}</strong>{' '}
                {lang === 'ar' ? 'شق وتسوية الطرق وسط الجبال المنهارة والوحل، واستخدام الونش الهيدروليكي لسحب الشاحنات والمركبات الغارقة.' : 'Plow lifelines through mud & rubble, and winch out stuck vehicles.'}
              </li>
              <li>
                <strong className="text-stone-100">{lang === 'ar' ? 'الرافعات الثقيلة (Cranes):' : 'Heavy Cranes:'}</strong>{' '}
                {lang === 'ar' ? 'رفع الكتل الإسمنتية الضخمة، وتركيب الجسور المعدنية المؤقتة فوق الهوات السحيقة، وتنزيل حواجز صد السيول.' : 'Hoist massive concrete slabs, deploy modular Bailey bridges over canyons, and drop levee blocks.'}
              </li>
              <li>
                <strong className="text-stone-100">{lang === 'ar' ? 'المداحل الاهتزازية (Rollers):' : 'Compactors & Rollers:'}</strong>{' '}
                {lang === 'ar' ? 'دمج الطين وتسويته ليتحول إلى مسار إسفلتي صلب يسمح بعبور سيارات الإسعاف وقوافل الإغاثة دون أن تغرز.' : 'Compact mud into paved roadways so relief ambulances can cross without sinking.'}
              </li>
              <li>
                <strong className="text-stone-100">{lang === 'ar' ? 'أبراج الإنارة (Floodlights):' : 'Floodlight Rigs:'}</strong>{' '}
                {lang === 'ar' ? 'إضاءة مناطق العمل الخطرة ليلاً ومنع الحوادث والأعطال الميكانيكية.' : 'Illuminate hazardous drop-offs and unlit terrain during night operations.'}
              </li>
            </ul>
          </div>

          {/* Section 2: Physics & Hazards */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800">
            <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2 font-heading">
              <Droplet className="w-4 h-4" />
              {lang === 'ar' ? 'فيزياء الطين والانهيارات وتدفق السيول:' : 'Mud Physics, Slopes & Flood Dynamics:'}
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed mb-2">
              {lang === 'ar'
                ? '• التربة ليست ثابتة! الأمطار والعواصف تزيد من نسبة تشبع الأرض بالوحل، مما يقلل تماسك الإطارات وقد يتسبب في غرز الشاحنات العادية.'
                : '• Dynamic soil: Rain increases mud saturation. Uncompacted soil bogs down wheeled vehicles unless towed or paved.'}
            </p>
            <p className="text-xs text-stone-300 leading-relaxed">
              {lang === 'ar'
                ? '• مياه الفيضان تتمدد طبيعياً نحو الخلايا ذات الارتفاع المنخفض ما لم يتم حفر قنوات تصريف توجهها بعيداً أو نصب سواتر وحواجز خرسانية أمامها.'
                : '• Water naturally surges toward lower elevations unless diverted by canal trenches or blocked by precast levees.'}
            </p>
          </div>

          {/* Section 3: Keyboard Controls */}
          <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 font-mono-tech text-xs">
            <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2 font-heading">
              <Compass className="w-4 h-4" />
              {lang === 'ar' ? 'اختصارات لوحة المفاتيح والتحكم الميداني:' : 'Tactical Keyboard Shortcuts:'}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-stone-300">
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-400">W / A / S / D</kbd> أو الأسهم : تحريك الآلية</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-400">Space</kbd> : تنفيذ المهمة الهندسية الأساسية</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-400">1 - 6</kbd> : التبديل السريع بين الآليات</div>
              <div><kbd className="bg-stone-800 px-1.5 py-0.5 rounded text-amber-400">R</kbd> : صيانة ميدانية وتزويد وقود سريع</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-stone-800 bg-stone-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-lg transition"
          >
            {lang === 'ar' ? 'فهمت، جاهز للمهمة' : 'Understood, Ready'}
          </button>
        </div>
      </div>
    </div>
  );
};
