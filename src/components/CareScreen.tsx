import React, { useMemo, useState } from 'react';
import {
  Award,
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Stethoscope,
} from 'lucide-react';
import { BOOKING_DATES, DOCTORS, FACILITIES, SPECIALITIES, TIME_SLOTS } from '../data/mockData';
import type { Appointment, Doctor, FamilyMember, Language } from '../types/patient';
import { t } from '../i18n/translations';
import { formatInr } from '../utils/patientLogic';
import { BottomSheet, EmptyState, InlineError, SkeletonCard } from './ui/Primitives';

interface CareScreenProps {
  lang: Language;
  activeMember: FamilyMember;
  appointments: Appointment[];
  initialMode?: 'book' | 'my';
  isOffline: boolean;
  loading: boolean;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  onCreateAppointment: (apt: Omit<Appointment, 'id'>) => void;
  onRescheduleAppointment: (id: string, dateIso: string, dateLabel: string, timeSlot: string) => void;
  onCancelAppointment: (id: string) => void;
  onCheckIn: (id: string) => void;
}

export function CareScreen({
  lang,
  activeMember,
  appointments,
  initialMode = 'book',
  isOffline,
  loading,
  unreadNotifications,
  onOpenNotifications,
  onCreateAppointment,
  onRescheduleAppointment,
  onCancelAppointment,
  onCheckIn,
}: CareScreenProps) {
  const [mode, setMode] = useState<'book' | 'my'>(initialMode);
  const [myTab, setMyTab] = useState<'upcoming' | 'past'>('upcoming');

  // Booking wizard state
  const [facilityId, setFacilityId] = useState<string>(FACILITIES[0].id);
  const [speciality, setSpeciality] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor>(DOCTORS[0]);
  const [selectedDateIso, setSelectedDateIso] = useState<string>(BOOKING_DATES[2].dateIso);
  const [selectedTime, setSelectedTime] = useState<string>('10:15 AM');
  const [visitNote, setVisitNote] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [offlineBookError, setOfflineBookError] = useState(false);

  // Reschedule / Cancel sheets
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDateIso, setRescheduleDateIso] = useState<string>(BOOKING_DATES[3].dateIso);
  const [rescheduleTime, setRescheduleTime] = useState<string>('02:30 PM');
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);

  const filteredDoctors = useMemo(() => {
    return DOCTORS.filter((doc) => {
      const matchSpec = speciality === 'All' || doc.speciality === speciality;
      const matchFacility = doc.facilityId === facilityId || speciality !== 'All';
      return matchSpec && matchFacility;
    });
  }, [facilityId, speciality]);

  const selectedFacility = FACILITIES.find((f) => f.id === facilityId) ?? FACILITIES[0];
  const selectedDateObj =
    BOOKING_DATES.find((d) => d.dateIso === selectedDateIso) ?? BOOKING_DATES[0];

  const memberAppointments = appointments.filter((a) => a.memberId === activeMember.id);
  const upcomingAppointments = memberAppointments.filter((a) => a.status === 'upcoming');
  const pastAppointments = memberAppointments.filter(
    (a) => a.status === 'past' || a.status === 'cancelled'
  );

  const handleConfirmBooking = () => {
    if (isOffline) {
      setOfflineBookError(true);
      setReviewOpen(false);
      return;
    }
    setOfflineBookError(false);
    onCreateAppointment({
      memberId: activeMember.id,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorPhoto: selectedDoctor.photoUrl,
      speciality: selectedDoctor.speciality,
      facilityName: selectedFacility.name,
      dateIso: selectedDateObj.dateIso,
      dateLabel: selectedDateObj.label,
      timeSlot: selectedTime,
      status: 'upcoming',
      checkedIn: false,
      bayLocation: 'Wing B · Oncology Consultation Suite',
      fee: selectedDoctor.fee,
      notes: visitNote.trim() || undefined,
    });
    setReviewOpen(false);
    setBookingConfirmed(true);
    setVisitNote('');
  };

  return (
    <div className="pb-6">
      {/* Sticky Header */}
      <header className="px-5 pt-4 pb-3 bg-[#FAF8F4] sticky top-0 z-20 border-b border-[#E5DFD5]/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-[#1D2A2A] tracking-tight">
              {t(lang, 'navCare')}
            </h1>
            <p className="text-xs text-[#526060]">
              Booking for <span className="font-semibold text-[#1D2A2A]">{activeMember.name}</span>
            </p>
          </div>

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

        {/* Segmented Control */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#EFE7DA] rounded-[16px]" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'book'}
            onClick={() => {
              setMode('book');
              setBookingConfirmed(false);
            }}
            className={`min-h-[44px] rounded-[12px] text-sm font-bold transition-colors cursor-pointer ${
              mode === 'book' ? 'bg-white text-[#1D2A2A] shadow-sm' : 'text-[#526060]'
            }`}
          >
            {t(lang, 'bookAppointment')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'my'}
            onClick={() => setMode('my')}
            className={`min-h-[44px] rounded-[12px] text-sm font-bold transition-colors cursor-pointer ${
              mode === 'my' ? 'bg-white text-[#1D2A2A] shadow-sm' : 'text-[#526060]'
            }`}
          >
            {t(lang, 'myAppointments')} ({upcomingAppointments.length})
          </button>
        </div>
      </header>

      <div className="px-5 pt-4 space-y-5">
        {loading ? (
          <div className="space-y-4">
            <SkeletonCard rows={3} />
            <SkeletonCard rows={2} />
          </div>
        ) : mode === 'book' ? (
          bookingConfirmed ? (
            <div className="bg-white rounded-[24px] p-6 border border-[#E5DFD5] text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#E7F4ED] text-[#1A6B46] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-[#1D2A2A]">Appointment Confirmed</h2>
                <p className="text-sm text-[#526060] mt-1">
                  {selectedDoctor.name} · {selectedDateObj.label} at {selectedTime}
                </p>
              </div>
              <div className="bg-[#FAF8F4] rounded-[16px] p-4 text-left text-sm space-y-1.5 border border-[#E5DFD5]">
                <p className="flex justify-between">
                  <span className="text-[#526060]">Patient</span>
                  <span className="font-bold text-[#1D2A2A]">{activeMember.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[#526060]">Facility</span>
                  <span className="font-semibold text-[#1D2A2A] text-right">{selectedFacility.area}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-[#526060]">Consultation Fee</span>
                  <span className="font-bold text-[#0F5C5A] tabular-nums">
                    {formatInr(selectedDoctor.fee)}
                  </span>
                </p>
              </div>
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setBookingConfirmed(false);
                    setMode('my');
                    setMyTab('upcoming');
                  }}
                  className="w-full min-h-[48px] rounded-[16px] bg-[#0F5C5A] text-white text-sm font-bold cursor-pointer"
                >
                  View My Appointments
                </button>
                <button
                  type="button"
                  onClick={() => setBookingConfirmed(false)}
                  className="w-full min-h-[48px] rounded-[16px] bg-[#EFE7DA] text-[#1D2A2A] text-sm font-semibold cursor-pointer"
                >
                  Book another visit
                </button>
              </div>
            </div>
          ) : (
            <>
              {offlineBookError && (
                <InlineError
                  title="Cannot confirm booking while offline"
                  description="Reconnect to Sindhu Hospitals to lock in a live consultation slot."
                  onRetry={() => {
                    if (!isOffline) setOfflineBookError(false);
                  }}
                />
              )}

              {/* Step 1: Facility */}
              <section className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#526060] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#0F5C5A]" aria-hidden="true" />
                  <span>1. Choose Facility</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {FACILITIES.map((fac) => {
                    const active = fac.id === facilityId;
                    return (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => setFacilityId(fac.id)}
                        className={`text-left p-3.5 rounded-[16px] border transition-colors cursor-pointer min-h-[56px] ${
                          active
                            ? 'bg-white border-[#0F5C5A] ring-1 ring-[#0F5C5A]'
                            : 'bg-white border-[#E5DFD5] hover:bg-[#EFE7DA]/40'
                        }`}
                      >
                        <p className="text-sm font-bold text-[#1D2A2A]">{fac.name}</p>
                        <p className="text-xs text-[#526060] mt-0.5">{fac.address}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Step 2: Speciality */}
              <section className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526060] flex items-center gap-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-[#0F5C5A]" aria-hidden="true" />
                  <span>2. Speciality</span>
                </span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {SPECIALITIES.map((spec) => {
                    const active = spec === speciality;
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => setSpeciality(spec)}
                        className={`min-h-[44px] px-3.5 rounded-[14px] text-xs font-bold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                            : 'bg-white text-[#1D2A2A] border-[#E5DFD5] hover:bg-[#EFE7DA]'
                        }`}
                      >
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Step 3: Doctor Cards */}
              <section className="space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526060]">
                  3. Select Specialist
                </span>
                <div className="space-y-3">
                  {filteredDoctors.map((doc) => {
                    const active = selectedDoctor.id === doc.id;
                    return (
                      <button
                        key={doc.id}
                        type="button"
                        onClick={() => setSelectedDoctor(doc)}
                        aria-pressed={active}
                        className={`w-full text-left p-4 rounded-[20px] border transition-colors cursor-pointer ${
                          active
                            ? 'bg-white border-[#0F5C5A] ring-1 ring-[#0F5C5A] shadow-[0_4px_14px_rgba(15,92,90,0.08)]'
                            : 'bg-white border-[#E5DFD5] hover:border-[#0F5C5A]/40'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <img
                            src={doc.photoUrl}
                            alt={doc.name}
                            referrerPolicy="no-referrer"
                            className="w-16 h-16 rounded-[16px] object-cover object-top bg-[#EFE7DA] shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="text-base font-extrabold text-[#1D2A2A] leading-snug">
                                {doc.name}
                              </h3>
                              <span className="text-sm font-extrabold text-[#0F5C5A] tabular-nums shrink-0">
                                {formatInr(doc.fee)}
                              </span>
                            </div>
                            <p className="text-xs font-semibold text-[#0F5C5A] mt-0.5">
                              {doc.speciality}
                            </p>
                            <p className="text-xs text-[#526060] mt-0.5">{doc.qualification}</p>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-[#526060]">
                              <span className="inline-flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-[#0F5C5A]" aria-hidden="true" />
                                <span>{doc.experienceYears} yrs exp</span>
                              </span>
                              <span className="inline-flex items-center gap-1 font-semibold text-[#1D2A2A]">
                                <Clock className="w-3.5 h-3.5 text-[#0F5C5A]" aria-hidden="true" />
                                <span>Next: {doc.nextSlotLabel}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Step 4: Date Strip */}
              <section className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526060]">
                  4. Pick Date (November 2026)
                </span>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                  {BOOKING_DATES.map((d) => {
                    const active = d.dateIso === selectedDateIso;
                    return (
                      <button
                        key={d.dateIso}
                        type="button"
                        onClick={() => setSelectedDateIso(d.dateIso)}
                        className={`min-w-[62px] min-h-[68px] px-3 py-2 rounded-[16px] flex flex-col items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                          active
                            ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                            : 'bg-white text-[#1D2A2A] border-[#E5DFD5] hover:bg-[#EFE7DA]'
                        }`}
                      >
                        <span className={`text-[11px] font-semibold ${active ? 'text-white/80' : 'text-[#526060]'}`}>
                          {d.dayShort}
                        </span>
                        <span className="text-lg font-extrabold tabular-nums leading-tight">
                          {d.dayNum}
                        </span>
                        <span className={`text-[10px] font-medium ${active ? 'text-white/80' : 'text-[#687676]'}`}>
                          {d.monthShort}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Step 5: Time-slot Chips */}
              <section className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#526060]">
                  5. Choose Time Slot
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const active = slot.time === selectedTime;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`min-h-[48px] px-2 rounded-[14px] text-xs font-bold tabular-nums border transition-colors ${
                          !slot.available
                            ? 'bg-[#EFE7DA]/50 text-[#8C9696] border-[#E5DFD5] cursor-not-allowed line-through'
                            : active
                            ? 'bg-[#0F5C5A] text-white border-[#0F5C5A] cursor-pointer'
                            : 'bg-white text-[#1D2A2A] border-[#E5DFD5] hover:bg-[#EFE7DA] cursor-pointer'
                        }`}
                      >
                        {slot.time}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Primary CTA */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setReviewOpen(true)}
                  className="w-full min-h-[52px] px-5 rounded-[16px] bg-[#0F5C5A] hover:bg-[#0B4745] text-white text-base font-bold transition-colors cursor-pointer"
                >
                  Review & Book ({formatInr(selectedDoctor.fee)})
                </button>
              </div>
            </>
          )
        ) : (
          /* My Appointments Tab */
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMyTab('upcoming')}
                className={`min-h-[44px] px-4 rounded-[14px] text-sm font-bold border transition-colors cursor-pointer ${
                  myTab === 'upcoming'
                    ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                    : 'bg-white text-[#1D2A2A] border-[#E5DFD5]'
                }`}
              >
                {t(lang, 'upcoming')} ({upcomingAppointments.length})
              </button>
              <button
                type="button"
                onClick={() => setMyTab('past')}
                className={`min-h-[44px] px-4 rounded-[14px] text-sm font-bold border transition-colors cursor-pointer ${
                  myTab === 'past'
                    ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                    : 'bg-white text-[#1D2A2A] border-[#E5DFD5]'
                }`}
              >
                {t(lang, 'past')} ({pastAppointments.length})
              </button>
            </div>

            {myTab === 'upcoming' ? (
              upcomingAppointments.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="w-6 h-6" aria-hidden="true" />}
                  title={t(lang, 'noAppointmentsTitle')}
                  description={t(lang, 'noAppointmentsBody')}
                  actionLabel={t(lang, 'bookFirstVisit')}
                  onAction={() => setMode('book')}
                />
              ) : (
                <div className="space-y-3">
                  {upcomingAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={apt.doctorPhoto}
                          alt={apt.doctorName}
                          referrerPolicy="no-referrer"
                          className="w-14 h-14 rounded-[14px] object-cover object-top bg-[#EFE7DA] shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-extrabold text-[#1D2A2A] leading-snug">
                            {apt.doctorName}
                          </h3>
                          <p className="text-xs font-semibold text-[#0F5C5A]">{apt.speciality}</p>
                          <p className="text-xs text-[#526060] mt-1 tabular-nums">
                            {apt.dateLabel} · {apt.timeSlot}
                          </p>
                          <p className="text-xs text-[#526060] flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{apt.bayLocation ?? apt.facilityName}</span>
                          </p>
                        </div>
                      </div>

                      {apt.checkedIn && (
                        <div className="px-3 py-2 rounded-[12px] bg-[#E7F4ED] text-[#1A6B46] text-xs font-bold flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                          <span>Checked in · Token {apt.tokenNumber ?? 'B-14'}</span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 pt-1">
                        {!apt.checkedIn && (
                          <button
                            type="button"
                            onClick={() => onCheckIn(apt.id)}
                            className="min-h-[48px] px-2 rounded-[14px] bg-[#0F5C5A] text-white text-xs font-bold cursor-pointer"
                          >
                            {t(lang, 'checkIn')}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleTarget(apt);
                            setRescheduleDateIso(apt.dateIso);
                            setRescheduleTime(apt.timeSlot);
                          }}
                          className={`${apt.checkedIn ? 'col-span-2' : ''} min-h-[48px] px-2 rounded-[14px] bg-[#EFE7DA] text-[#1D2A2A] text-xs font-bold cursor-pointer`}
                        >
                          {t(lang, 'reschedule')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCancelTarget(apt)}
                          className="min-h-[48px] px-2 rounded-[14px] bg-white border border-[#E5DFD5] text-[#526060] hover:text-[#1D2A2A] text-xs font-semibold cursor-pointer"
                        >
                          {t(lang, 'cancel')}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : pastAppointments.length === 0 ? (
              <EmptyState
                icon={<Calendar className="w-6 h-6" aria-hidden="true" />}
                title="No past visits recorded"
                description="Completed and cancelled consultations for 2026 will appear here."
              />
            ) : (
              <div className="space-y-3">
                {pastAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] flex items-start justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-[#1D2A2A]">{apt.doctorName}</h3>
                      <p className="text-xs text-[#526060] mt-0.5">
                        {apt.speciality} · {apt.dateLabel}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-[10px] text-xs font-semibold shrink-0 ${
                        apt.status === 'cancelled'
                          ? 'bg-[#EFE7DA] text-[#526060]'
                          : 'bg-[#E7F4ED] text-[#1A6B46]'
                      }`}
                    >
                      {apt.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review & Confirm Booking Sheet */}
      <BottomSheet
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title="Review Appointment"
        subtitle={selectedFacility.name}
      >
        <div className="space-y-4">
          <div className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] flex items-center gap-3">
            <img
              src={selectedDoctor.photoUrl}
              alt={selectedDoctor.name}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-[14px] object-cover object-top shrink-0"
            />
            <div>
              <h3 className="text-base font-bold text-[#1D2A2A]">{selectedDoctor.name}</h3>
              <p className="text-xs text-[#0F5C5A] font-semibold">{selectedDoctor.speciality}</p>
              <p className="text-xs text-[#526060] mt-0.5 tabular-nums">
                {selectedDateObj.label} · {selectedTime}
              </p>
            </div>
          </div>

          <div>
            <label htmlFor="visit-note" className="block text-xs font-bold text-[#526060] mb-1.5">
              Optional note for doctor (e.g. recent lab values)
            </label>
            <textarea
              id="visit-note"
              rows={2}
              value={visitNote}
              onChange={(e) => setVisitNote(e.target.value)}
              placeholder="Share symptoms or questions for your visit..."
              className="w-full p-3 rounded-[14px] bg-white border border-[#E5DFD5] text-sm text-[#1D2A2A] focus:outline-none focus:border-[#0F5C5A]"
            />
          </div>

          <div className="bg-[#EFE7DA] rounded-[16px] p-3.5 flex items-center justify-between">
            <span className="text-sm font-semibold text-[#1D2A2A]">Consultation Fee</span>
            <span className="text-lg font-extrabold text-[#0F5C5A] tabular-nums">
              {formatInr(selectedDoctor.fee)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleConfirmBooking}
            className="w-full min-h-[52px] rounded-[16px] bg-[#0F5C5A] hover:bg-[#0B4745] text-white text-base font-bold transition-colors cursor-pointer"
          >
            Confirm Booking
          </button>
        </div>
      </BottomSheet>

      {/* Reschedule Sheet */}
      <BottomSheet
        open={Boolean(rescheduleTarget)}
        onClose={() => setRescheduleTarget(null)}
        title="Reschedule Visit"
        subtitle={rescheduleTarget?.doctorName}
      >
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-bold text-[#526060] mb-2">New Date</span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {BOOKING_DATES.map((d) => (
                <button
                  key={d.dateIso}
                  type="button"
                  onClick={() => setRescheduleDateIso(d.dateIso)}
                  className={`min-w-[60px] min-h-[60px] px-2.5 rounded-[14px] border flex flex-col items-center justify-center shrink-0 cursor-pointer ${
                    rescheduleDateIso === d.dateIso
                      ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                      : 'bg-white text-[#1D2A2A] border-[#E5DFD5]'
                  }`}
                >
                  <span className="text-[11px]">{d.dayShort}</span>
                  <span className="text-base font-bold tabular-nums">{d.dayNum}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-xs font-bold text-[#526060] mb-2">New Time Slot</span>
            <div className="grid grid-cols-3 gap-2">
              {TIME_SLOTS.filter((s) => s.available).map((slot) => (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => setRescheduleTime(slot.time)}
                  className={`min-h-[48px] rounded-[14px] text-xs font-bold border tabular-nums cursor-pointer ${
                    rescheduleTime === slot.time
                      ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                      : 'bg-white text-[#1D2A2A] border-[#E5DFD5]'
                  }`}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!rescheduleTarget) return;
              const dateObj =
                BOOKING_DATES.find((d) => d.dateIso === rescheduleDateIso) ?? BOOKING_DATES[0];
              onRescheduleAppointment(
                rescheduleTarget.id,
                dateObj.dateIso,
                dateObj.label,
                rescheduleTime
              );
              setRescheduleTarget(null);
            }}
            className="w-full min-h-[52px] rounded-[16px] bg-[#0F5C5A] text-white text-sm font-bold cursor-pointer"
          >
            Save New Time
          </button>
        </div>
      </BottomSheet>

      {/* Cancel Confirm Sheet */}
      <BottomSheet
        open={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        title="Cancel Appointment?"
        subtitle={cancelTarget ? `${cancelTarget.doctorName} · ${cancelTarget.dateLabel}` : undefined}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#526060] leading-relaxed">
            Your slot will be released immediately. Any advance wallet hold is returned automatically.
          </p>
          <button
            type="button"
            onClick={() => {
              if (cancelTarget) onCancelAppointment(cancelTarget.id);
              setCancelTarget(null);
            }}
            className="w-full min-h-[48px] rounded-[16px] bg-[#0F5C5A] text-white text-sm font-bold cursor-pointer"
          >
            Yes, Cancel Visit
          </button>
          <button
            type="button"
            onClick={() => setCancelTarget(null)}
            className="w-full min-h-[48px] rounded-[16px] bg-[#EFE7DA] text-[#1D2A2A] text-sm font-semibold cursor-pointer"
          >
            Keep Appointment
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
