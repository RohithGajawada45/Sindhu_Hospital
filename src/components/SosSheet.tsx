import React, { useState } from 'react';
import { CheckCircle2, MapPin, PhoneCall, ShieldAlert } from 'lucide-react';
import { BottomSheet } from './ui/Primitives';
import type { Language } from '../types/patient';
import { t } from '../i18n/translations';

export function SosSheet({
  open,
  onClose,
  patientName,
  uhid,
  lang,
}: {
  open: boolean;
  onClose: () => void;
  patientName: string;
  uhid: string;
  lang: Language;
}) {
  const [actionTaken, setActionTaken] = useState<'none' | 'called' | 'shared'>('none');

  const handleClose = () => {
    setActionTaken('none');
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={t(lang, 'emergencyTitle')}
      subtitle={`${patientName} · UHID ${uhid}`}
    >
      {actionTaken === 'none' ? (
        <div className="space-y-4">
          <div className="p-4 rounded-[20px] bg-[#FDECE9] border border-[#E5533D]/25 flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#E5533D] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-[#1D2A2A] leading-relaxed">
              {t(lang, 'emergencySubtitle')}. Our oncology triage team receives your UHID automatically.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActionTaken('called')}
            className="w-full min-h-[52px] px-4 rounded-[16px] bg-[#E5533D] hover:bg-[#CC432E] text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <PhoneCall className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{t(lang, 'callEmergency')}</span>
          </button>

          <button
            type="button"
            onClick={() => setActionTaken('shared')}
            className="w-full min-h-[52px] px-4 rounded-[16px] bg-white border border-[#D8CFC0] hover:bg-[#EFE7DA] text-[#1D2A2A] font-semibold text-sm flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
          >
            <MapPin className="w-5 h-5 text-[#E5533D] shrink-0" aria-hidden="true" />
            <span>{t(lang, 'shareLocation')}</span>
          </button>

          <button
            type="button"
            onClick={handleClose}
            className="w-full min-h-[48px] rounded-[16px] text-sm font-semibold text-[#526060] hover:bg-[#EFE7DA] transition-colors cursor-pointer"
          >
            {t(lang, 'cancel')}
          </button>
        </div>
      ) : (
        <div className="py-4 text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-[#E7F4ED] text-[#1A6B46] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1D2A2A]">
              {actionTaken === 'called'
                ? 'Connecting to Sindhu Emergency Desk'
                : 'Live Location Shared with Triage'}
            </h3>
            <p className="text-sm text-[#526060] mt-1 leading-relaxed">
              {actionTaken === 'called'
                ? 'Dialing 040-4810-9108 · HITEC City Trauma & Oncology Triage has your UHID ready.'
                : 'GPS coordinates (Madhapur, Hyderabad) and UHID SHHC.26048311 sent to our 24/7 ambulance dispatch.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-full min-h-[48px] rounded-[16px] bg-[#0F5C5A] text-white font-semibold text-sm cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </BottomSheet>
  );
}
