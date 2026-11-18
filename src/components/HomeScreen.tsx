import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  CalendarPlus,
  CheckCircle2,
  CreditCard,
  FileText,
  HeartPulse,
  MapPin,
  PhoneCall,
  Pill,
  ShieldAlert,
  Wallet,
} from 'lucide-react';
import type {
  Appointment,
  FamilyMember,
  LabReport,
  Language,
  RecordCategory,
  TabId,
  WalletSummary,
} from '../types/patient';
import { t } from '../i18n/translations';
import { formatInr, getCountdownLabel, getSeasonalHealthTip } from '../utils/patientLogic';
import { BottomSheet, EmptyState, InlineError, SkeletonCard, StatusChip } from './ui/Primitives';

interface HomeScreenProps {
  lang: Language;
  members: FamilyMember[];
  activeMember: FamilyMember;
  onSelectMember: (id: string) => void;
  nextAppointment?: Appointment;
  onCheckIn: (appointmentId: string) => void;
  latestReport?: LabReport;
  wallet: WalletSummary;
  dueBillsCount: number;
  unreadNotifications: number;
  loading: boolean;
  syncError: boolean;
  onRetrySync: () => void;
  onOpenNotifications: () => void;
  onOpenSos: () => void;
  onNavigateTab: (tab: TabId, options?: { recordTab?: RecordCategory; reportId?: string; careMode?: 'book' | 'my' }) => void;
}

export function HomeScreen({
  lang,
  members,
  activeMember,
  onSelectMember,
  nextAppointment,
  onCheckIn,
  latestReport,
  wallet,
  dueBillsCount,
  unreadNotifications,
  loading,
  syncError,
  onRetrySync,
  onOpenNotifications,
  onOpenSos,
  onNavigateTab,
}: HomeScreenProps) {
  const firstName = activeMember.name.split(' ')[0];
  const [tipSheetOpen, setTipSheetOpen] = useState(false);
  const seasonalTip = getSeasonalHealthTip(11);

  return (
    <div className="pb-6">
      {/* Top Bar */}
      <header className="px-5 pt-3.5 pb-2.5 flex items-center justify-between gap-2 bg-[#FAF8F4] sticky top-0 z-20 border-b border-[#E5DFD5]/60">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[#526060] truncate">
            {t(lang, 'hospitalName')} · HITEC City
          </p>
          <h1 className="text-[19px] font-extrabold text-[#1D2A2A] tracking-tight truncate">
            {t(lang, 'greetingMorning')}, {firstName}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenSos}
            aria-label="Emergency SOS"
            className="min-h-[44px] px-3 rounded-[14px] bg-[#E5533D] hover:bg-[#CC432E] text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{t(lang, 'sos')}</span>
          </button>

          <button
            type="button"
            onClick={onOpenNotifications}
            aria-label={`Notifications (${unreadNotifications} unread)`}
            className="relative min-h-[44px] min-w-[44px] rounded-[14px] bg-white border border-[#E5DFD5] text-[#1D2A2A] flex items-center justify-center hover:bg-[#EFE7DA] transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5" aria-hidden="true" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#0F5C5A] text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
                {unreadNotifications}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="px-5 pt-3.5 space-y-4">
        {/* Quiet UHID + Patient Strip & Family Switcher Chips */}
        <section aria-label="Switch patient profile" className="space-y-2">
          <div className="flex items-center justify-between text-xs text-[#526060]">
            <span>
              {activeMember.name} · {activeMember.age} yrs
            </span>
            <span className="font-semibold tabular-nums">
              {t(lang, 'uhidLabel')}: {activeMember.uhid}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {members.map((member) => {
              const isSelected = member.id === activeMember.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => onSelectMember(member.id)}
                  aria-pressed={isSelected}
                  className={`min-h-[44px] px-2.5 rounded-[14px] text-[13px] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                    isSelected
                      ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                      : 'bg-white text-[#1D2A2A] border-[#E5DFD5] hover:bg-[#EFE7DA]'
                  }`}
                >
                  {member.name}
                  <span className={`ml-1 text-[11px] font-medium ${isSelected ? 'text-white/80' : 'text-[#687676]'}`}>
                    {member.relation}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {syncError && (
          <InlineError
            title={t(lang, 'syncErrorTitle')}
            description={t(lang, 'syncErrorBody')}
            retryLabel={t(lang, 'retry')}
            onRetry={onRetrySync}
          />
        )}

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard rows={3} />
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
          </div>
        ) : (
          <>
            {/* Next Appointment Card (Primary Focal Anchor) */}
            <section aria-label={t(lang, 'nextAppointment')}>
              {nextAppointment ? (
                <div className="bg-[#0F5C5A] text-white rounded-[24px] p-5 shadow-[0_6px_20px_rgba(15,92,90,0.18)]">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/80">
                      {t(lang, 'nextAppointment')}
                    </span>
                    <span className="text-xs font-bold text-[#EFE7DA] tabular-nums">
                      {getCountdownLabel(nextAppointment.dateIso, nextAppointment.timeSlot)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 mb-4">
                    <img
                      src={nextAppointment.doctorPhoto}
                      alt={nextAppointment.doctorName}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-[16px] object-cover object-top bg-[#EFE7DA] shrink-0 border border-white/20"
                    />
                    <div className="min-w-0">
                      <h2 className="text-[18px] font-bold leading-snug truncate">
                        {nextAppointment.doctorName}
                      </h2>
                      <p className="text-sm text-white/85 truncate">{nextAppointment.speciality}</p>
                      <p className="text-xs text-white/75 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">
                          {nextAppointment.bayLocation ?? nextAppointment.facilityName}
                        </span>
                      </p>
                    </div>
                  </div>

                  {nextAppointment.checkedIn ? (
                    <div className="bg-white/14 rounded-[16px] px-4 py-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-[#AEE6C8] shrink-0" aria-hidden="true" />
                        <div>
                          <p className="text-sm font-bold">{t(lang, 'checkedIn')}</p>
                          <p className="text-xs text-white/80">
                            Token {nextAppointment.tokenNumber ?? 'B-14'} · Proceed to Wing B lounge
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onNavigateTab('care', { careMode: 'my' })}
                        className="min-h-[40px] px-3 rounded-[12px] bg-white text-[#0F5C5A] text-xs font-bold cursor-pointer shrink-0"
                      >
                        Details
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => onCheckIn(nextAppointment.id)}
                        className="flex-1 min-h-[48px] px-4 rounded-[16px] bg-white hover:bg-[#FAF8F4] text-[#0F5C5A] text-sm font-extrabold transition-colors cursor-pointer"
                      >
                        {t(lang, 'checkIn')}
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigateTab('care', { careMode: 'my' })}
                        className="min-h-[48px] px-4 rounded-[16px] bg-white/14 hover:bg-white/22 text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Manage
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <EmptyState
                  icon={<CalendarPlus className="w-6 h-6" aria-hidden="true" />}
                  title={t(lang, 'noAppointmentsTitle')}
                  description={t(lang, 'noAppointmentsBody')}
                  actionLabel={t(lang, 'bookFirstVisit')}
                  onAction={() => onNavigateTab('care', { careMode: 'book' })}
                />
              )}
            </section>

            {/* Quick Actions */}
            <section aria-label="Quick actions">
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('care', { careMode: 'book' })}
                  className="min-h-[76px] p-2 rounded-[20px] bg-white border border-[#E5DFD5] hover:bg-[#EFE7DA]/60 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-[12px] bg-[#EFE7DA] text-[#0F5C5A] flex items-center justify-center">
                    <CalendarPlus className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold text-[#1D2A2A] whitespace-nowrap">
                    {t(lang, 'book')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('records', { recordTab: 'lab' })}
                  className="min-h-[76px] p-2 rounded-[20px] bg-white border border-[#E5DFD5] hover:bg-[#EFE7DA]/60 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-[12px] bg-[#EFE7DA] text-[#0F5C5A] flex items-center justify-center">
                    <FileText className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold text-[#1D2A2A] whitespace-nowrap">
                    {t(lang, 'reports')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('billing')}
                  className="relative min-h-[76px] p-2 rounded-[20px] bg-white border border-[#E5DFD5] hover:bg-[#EFE7DA]/60 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-[12px] bg-[#EFE7DA] text-[#0F5C5A] flex items-center justify-center">
                    <CreditCard className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-bold text-[#1D2A2A] whitespace-nowrap">
                    {t(lang, 'payBill')}
                  </span>
                  {dueBillsCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8C5200]" aria-hidden="true" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onNavigateTab('records', { recordTab: 'prescriptions' })}
                  className="min-h-[76px] px-1 py-2 rounded-[20px] bg-white border border-[#E5DFD5] hover:bg-[#EFE7DA]/60 flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-[12px] bg-[#EFE7DA] text-[#0F5C5A] flex items-center justify-center">
                    <Pill className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className="text-[11px] font-bold tracking-[-0.02em] text-[#1D2A2A] whitespace-nowrap">
                    {t(lang, 'prescriptions')}
                  </span>
                </button>
              </div>
            </section>

            {/* Latest Report Card */}
            <section aria-label={t(lang, 'latestReport')}>
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-base font-bold text-[#1D2A2A]">{t(lang, 'latestReport')}</h2>
                <button
                  type="button"
                  onClick={() => onNavigateTab('records', { recordTab: 'lab' })}
                  className="min-h-[40px] px-2 text-xs font-bold text-[#0F5C5A] inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>All reports</span>
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
              </div>

              {latestReport ? (
                <button
                  type="button"
                  onClick={() =>
                    onNavigateTab('records', { recordTab: 'lab', reportId: latestReport.id })
                  }
                  className="w-full text-left bg-white rounded-[20px] p-4 border border-[#E5DFD5] shadow-[0_2px_10px_rgba(29,42,42,0.04)] hover:border-[#0F5C5A]/40 transition-colors cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#1D2A2A] leading-snug">
                        {latestReport.testName}
                      </h3>
                      <p className="text-xs text-[#526060] mt-0.5">
                        {latestReport.dateDisplay} · {latestReport.doctorName}
                      </p>
                    </div>
                    <StatusChip
                      status={latestReport.status}
                      label={latestReport.status === 'Normal' ? t(lang, 'normal') : t(lang, 'review')}
                    />
                  </div>

                  <div className="mt-3 pt-3 border-t border-[#EFE7DA] flex items-end justify-between gap-3">
                    <div>
                      <span className="block text-xs text-[#526060]">
                        {latestReport.keyMetricLabel}
                      </span>
                      <span className="text-2xl font-extrabold text-[#1D2A2A] tabular-nums">
                        {latestReport.keyValue}{' '}
                        <span className="text-sm font-semibold text-[#526060]">
                          {latestReport.unit}
                        </span>
                      </span>
                    </div>
                    <span className="text-xs font-bold text-[#0F5C5A] inline-flex items-center gap-1">
                      <span>{t(lang, 'viewReport')}</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </button>
              ) : (
                <div className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] text-sm text-[#526060]">
                  No recent lab reports uploaded for {activeMember.name}.
                </div>
              )}
            </section>

            {/* Wallet Summary */}
            <section aria-label={t(lang, 'myWallet')}>
              <div className="bg-[#EFE7DA] rounded-[20px] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[#0F5C5A]" aria-hidden="true" />
                    <h2 className="text-sm font-bold text-[#1D2A2A]">{t(lang, 'myWallet')}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('billing')}
                    className="min-h-[36px] px-2 text-xs font-bold text-[#0F5C5A] cursor-pointer"
                  >
                    View deposits
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white rounded-[16px] p-3 border border-[#E5DFD5]">
                  <div>
                    <span className="block text-[11px] font-medium text-[#526060]">
                      {t(lang, 'available')}
                    </span>
                    <span className="block text-base font-extrabold text-[#0F5C5A] tabular-nums mt-0.5">
                      {formatInr(wallet.available)}
                    </span>
                  </div>
                  <div className="border-l border-[#EFE7DA] pl-2.5">
                    <span className="block text-[11px] font-medium text-[#526060]">
                      {t(lang, 'used')}
                    </span>
                    <span className="block text-base font-extrabold text-[#1D2A2A] tabular-nums mt-0.5">
                      {formatInr(wallet.used)}
                    </span>
                  </div>
                  <div className="border-l border-[#EFE7DA] pl-2.5">
                    <span className="block text-[11px] font-medium text-[#526060]">
                      {t(lang, 'refunded')}
                    </span>
                    <span className="block text-base font-extrabold text-[#1D2A2A] tabular-nums mt-0.5">
                      {formatInr(wallet.refunded)}
                    </span>
                  </div>
                </div>
              </div>
            </section>

            {/* Daily Health Tip Card */}
            <section aria-label={t(lang, 'dailyHealthTip')}>
              <div className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] shadow-[0_2px_10px_rgba(29,42,42,0.04)] space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-[14px] bg-[#EFE7DA] text-[#0F5C5A] flex items-center justify-center shrink-0">
                    <HeartPulse className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-[#526060]">
                      {t(lang, 'dailyHealthTip')} · {seasonalTip.department}
                    </p>
                    <h2 className="text-base font-extrabold text-[#1D2A2A] leading-snug mt-0.5">
                      {seasonalTip.title}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-[#526060] leading-relaxed">
                  {seasonalTip.summary}
                </p>

                <div className="pt-1 flex items-center justify-between gap-3">
                  <span className="text-xs font-medium text-[#687676] truncate">
                    {seasonalTip.author}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTipSheetOpen(true)}
                    className="min-h-[48px] px-4 rounded-[14px] bg-[#EFE7DA] hover:bg-[#E6DBC9] text-[#0F5C5A] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <span>{t(lang, 'readMore')}</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </section>

            {/* Quick Care Desk Callout */}
            <section className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#1D2A2A]">Oncology Care Desk</p>
                <p className="text-xs text-[#526060]">HITEC City Wing B · Mon–Sat 8 AM – 8 PM</p>
              </div>
              <a
                href="tel:04048109108"
                aria-label="Call Oncology Care Desk"
                className="min-h-[48px] px-3.5 rounded-[14px] bg-[#EFE7DA] hover:bg-[#E6DBC9] text-[#0F5C5A] text-xs font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors"
              >
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
                <span>Call Desk</span>
              </a>
            </section>
          </>
        )}
      </div>

      {/* Daily Health Tip Detail Sheet */}
      <BottomSheet
        open={tipSheetOpen}
        onClose={() => setTipSheetOpen(false)}
        title={seasonalTip.title}
        subtitle={`${seasonalTip.author} · ${seasonalTip.department}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#1D2A2A] leading-relaxed">{seasonalTip.summary}</p>

          <div className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#526060]">
              Recommended Guidance ({seasonalTip.seasonLabel})
            </h3>
            <ul className="space-y-2.5 text-sm text-[#1D2A2A] leading-relaxed">
              {seasonalTip.guidancePoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#EFE7DA] text-[#0F5C5A] text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                    {idx + 1}
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                setTipSheetOpen(false);
                onNavigateTab('care', { careMode: 'book' });
              }}
              className="min-h-[48px] px-3 rounded-[16px] bg-[#0F5C5A] text-white text-xs font-bold cursor-pointer"
            >
              Book Consultation
            </button>
            <button
              type="button"
              onClick={() => setTipSheetOpen(false)}
              className="min-h-[48px] px-3 rounded-[16px] bg-[#EFE7DA] text-[#1D2A2A] text-xs font-bold cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
