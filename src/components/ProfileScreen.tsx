import React, { useState } from 'react';
import {
  ChevronRight,
  Globe,
  LogOut,
  Phone,
  Plus,
  ShieldAlert,
  Smartphone,
  Type,
  UserPlus,
  Users,
  WifiOff,
} from 'lucide-react';
import type { EmergencyContact, FamilyMember, Language } from '../types/patient';
import { t } from '../i18n/translations';
import { calculateProfileCompletion } from '../utils/patientLogic';
import { BottomSheet } from './ui/Primitives';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

interface ProfileScreenProps {
  lang: Language;
  onChangeLang: (lang: Language) => void;
  largeText: boolean;
  onToggleLargeText: () => void;
  offlinePreview: boolean;
  onToggleOfflinePreview: () => void;
  members: FamilyMember[];
  activeMember: FamilyMember;
  onSelectMember: (id: string) => void;
  onUpdateMember: (updated: FamilyMember) => void;
  onAddFamilyMember: (member: Omit<FamilyMember, 'id' | 'uhid'>) => void;
  emergencyContacts: EmergencyContact[];
  onAddEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => void;
  onOpenSos: () => void;
  onLogout: () => void;
}

export function ProfileScreen({
  lang,
  onChangeLang,
  largeText,
  onToggleLargeText,
  offlinePreview,
  onToggleOfflinePreview,
  members,
  activeMember,
  onSelectMember,
  onUpdateMember,
  onAddFamilyMember,
  emergencyContacts,
  onAddEmergencyContact,
  onOpenSos,
  onLogout,
}: ProfileScreenProps) {
  const { state: installState, install } = useInstallPrompt();
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addEmergencyOpen, setAddEmergencyOpen] = useState(false);

  // Edit form state
  const [editEmail, setEditEmail] = useState(activeMember.email ?? '');
  const [editBlood, setEditBlood] = useState(activeMember.bloodGroup ?? '');
  const [editInsurance, setEditInsurance] = useState(activeMember.insuranceProvider ?? '');
  const [editAddress, setEditAddress] = useState(activeMember.address.line1);

  // Add family member form
  const [newName, setNewName] = useState('');
  const [newRelation, setNewRelation] = useState<FamilyMember['relation']>('Spouse');
  const [newAge, setNewAge] = useState('28');
  const [newGender, setNewGender] = useState<FamilyMember['gender']>('Female');
  const [newMemberError, setNewMemberError] = useState<string | null>(null);

  // Emergency contact form
  const [ecName, setEcName] = useState('');
  const [ecRelation, setEcRelation] = useState('Sibling');
  const [ecPhone, setEcPhone] = useState('');

  const completion = calculateProfileCompletion(activeMember);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (completion / 100) * circumference;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateMember({
      ...activeMember,
      email: editEmail.trim(),
      bloodGroup: editBlood.trim(),
      insuranceProvider: editInsurance.trim(),
      address: { ...activeMember.address, line1: editAddress.trim() },
    });
    setEditProfileOpen(false);
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setNewMemberError('Enter the family member’s full name.');
      return;
    }
    const ageNum = parseInt(newAge, 10);
    if (Number.isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
      setNewMemberError('Enter a valid age.');
      return;
    }
    setNewMemberError(null);
    const shortName = newName.trim().split(' ').slice(0, 2).join(' ');
    onAddFamilyMember({
      name: shortName,
      fullName: newName.trim(),
      relation: newRelation,
      age: ageNum,
      gender: newGender,
      dob: '15 May 1998',
      bloodGroup: 'O+',
      phone: activeMember.phone,
      address: activeMember.address,
    });
    setNewName('');
    setAddMemberOpen(false);
  };

  const handleAddEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ecName.trim() || !ecPhone.trim()) return;
    onAddEmergencyContact({
      name: ecName.trim(),
      relation: ecRelation.trim() || 'Relative',
      phone: ecPhone.trim(),
    });
    setEcName('');
    setEcPhone('');
    setAddEmergencyOpen(false);
  };

  return (
    <div className="pb-8">
      <header className="px-5 pt-4 pb-3 bg-[#FAF8F4] sticky top-0 z-20 border-b border-[#E5DFD5]/60 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-[#1D2A2A] tracking-tight">
            {t(lang, 'navProfile')}
          </h1>
          <p className="text-xs text-[#526060]">UHID {activeMember.uhid}</p>
        </div>

        <button
          type="button"
          onClick={onOpenSos}
          aria-label="Emergency SOS"
          className="min-h-[44px] px-3 rounded-[14px] bg-[#E5533D] hover:bg-[#CC432E] text-white text-xs font-extrabold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t(lang, 'sos')}</span>
        </button>
      </header>

      <div className="px-5 pt-4 space-y-5">
        {/* Profile Completion Ring Card */}
        <section className="bg-white rounded-[24px] p-4 border border-[#E5DFD5] shadow-[0_2px_10px_rgba(29,42,42,0.04)] flex items-center gap-4">
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
              <circle cx="32" cy="32" r={radius} fill="none" stroke="#EFE7DA" strokeWidth="6" />
              <circle
                cx="32"
                cy="32"
                r={radius}
                fill="none"
                stroke="#0F5C5A"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <span className="absolute text-xs font-extrabold text-[#0F5C5A] tabular-nums">
              {completion}%
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-extrabold text-[#1D2A2A] truncate">
              {activeMember.fullName}
            </h2>
            <p className="text-xs text-[#526060]">
              {activeMember.age} yrs · {activeMember.gender} ·{' '}
              {activeMember.bloodGroup || 'Add blood group'}
            </p>
            {completion < 100 ? (
              <button
                type="button"
                onClick={() => {
                  setEditEmail(activeMember.email ?? '');
                  setEditBlood(activeMember.bloodGroup ?? '');
                  setEditInsurance(activeMember.insuranceProvider ?? '');
                  setEditAddress(activeMember.address.line1);
                  setEditProfileOpen(true);
                }}
                className="mt-1.5 text-xs font-bold text-[#0F5C5A] inline-flex items-center gap-1 cursor-pointer min-h-[32px]"
              >
                <span>Complete profile ({t(lang, 'profileCompletion')})</span>
                <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            ) : (
              <p className="mt-1 text-xs font-semibold text-[#1A6B46]">All profile details complete</p>
            )}
          </div>
        </section>

        {/* Personal Info */}
        <section className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-[#1D2A2A]">{t(lang, 'personalInfo')}</h2>
            <button
              type="button"
              onClick={() => {
                setEditEmail(activeMember.email ?? '');
                setEditBlood(activeMember.bloodGroup ?? '');
                setEditInsurance(activeMember.insuranceProvider ?? '');
                setEditAddress(activeMember.address.line1);
                setEditProfileOpen(true);
              }}
              className="min-h-[40px] px-3 rounded-[12px] bg-[#EFE7DA] text-[#1D2A2A] text-xs font-bold cursor-pointer"
            >
              Edit
            </button>
          </div>
          <dl className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs">
            <div>
              <dt className="text-[#687676]">Date of Birth</dt>
              <dd className="font-bold text-[#1D2A2A] mt-0.5">{activeMember.dob}</dd>
            </div>
            <div>
              <dt className="text-[#687676]">Mobile</dt>
              <dd className="font-bold text-[#1D2A2A] mt-0.5 tabular-nums">{activeMember.phone}</dd>
            </div>
            <div>
              <dt className="text-[#687676]">Insurance</dt>
              <dd className="font-bold text-[#1D2A2A] mt-0.5">
                {activeMember.insuranceProvider || 'Not added'}
              </dd>
            </div>
            <div>
              <dt className="text-[#687676]">City</dt>
              <dd className="font-bold text-[#1D2A2A] mt-0.5">
                {activeMember.address.city}, {activeMember.address.state}
              </dd>
            </div>
          </dl>
        </section>

        {/* Family Members */}
        <section className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0F5C5A]" aria-hidden="true" />
              <h2 className="text-sm font-extrabold text-[#1D2A2A]">{t(lang, 'familyMembers')}</h2>
            </div>
            <button
              type="button"
              onClick={() => setAddMemberOpen(true)}
              className="min-h-[40px] px-3 rounded-[12px] bg-[#0F5C5A] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add</span>
            </button>
          </div>

          <div className="divide-y divide-[#EFE7DA]">
            {members.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => onSelectMember(m.id)}
                className="w-full py-3 flex items-center justify-between gap-2 text-left cursor-pointer min-h-[52px]"
              >
                <div>
                  <p className="text-sm font-bold text-[#1D2A2A]">
                    {m.name}{' '}
                    <span className="text-xs font-medium text-[#526060]">· {m.relation}</span>
                  </p>
                  <p className="text-xs text-[#687676] tabular-nums">
                    {m.age} yrs · UHID {m.uhid}
                  </p>
                </div>
                {m.id === activeMember.id && (
                  <span className="text-xs font-bold text-[#0F5C5A]">Active</span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#0F5C5A]" aria-hidden="true" />
              <h2 className="text-sm font-extrabold text-[#1D2A2A]">
                {t(lang, 'emergencyContacts')}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setAddEmergencyOpen(true)}
              className="min-h-[40px] px-3 rounded-[12px] bg-[#EFE7DA] text-[#1D2A2A] text-xs font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add</span>
            </button>
          </div>

          <div className="space-y-2">
            {emergencyContacts.map((ec) => (
              <div
                key={ec.id}
                className="flex items-center justify-between p-3 rounded-[14px] bg-[#FAF8F4]"
              >
                <div>
                  <p className="text-sm font-bold text-[#1D2A2A]">{ec.name}</p>
                  <p className="text-xs text-[#526060]">
                    {ec.relation} · {ec.phone}
                  </p>
                </div>
                <a
                  href={`tel:${ec.phone.replace(/\s+/g, '')}`}
                  aria-label={`Call ${ec.name}`}
                  className="min-h-[44px] min-w-[44px] rounded-[12px] bg-white border border-[#E5DFD5] flex items-center justify-center text-[#0F5C5A]"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Accessibility & Language */}
        <section className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Globe className="w-4 h-4 text-[#0F5C5A]" aria-hidden="true" />
              <h2 className="text-sm font-extrabold text-[#1D2A2A]">{t(lang, 'language')}</h2>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  ['en', 'English'],
                  ['te', 'తెలుగు'],
                  ['hi', 'हिन्दी'],
                ] as [Language, string][]
              ).map(([code, label]) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => onChangeLang(code)}
                  className={`min-h-[48px] px-2 rounded-[14px] text-xs font-bold border transition-colors cursor-pointer ${
                    lang === code
                      ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                      : 'bg-[#FAF8F4] text-[#1D2A2A] border-[#E5DFD5]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#EFE7DA] flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <Type className="w-4 h-4 text-[#0F5C5A] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <span className="block text-sm font-bold text-[#1D2A2A]">
                  {t(lang, 'largeText')}
                </span>
                <span className="block text-xs text-[#526060]">{t(lang, 'largeTextDesc')}</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={largeText}
              aria-label={t(lang, 'largeText')}
              onClick={onToggleLargeText}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                largeText ? 'bg-[#0F5C5A]' : 'bg-[#D6CEC0]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  largeText ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="pt-3 border-t border-[#EFE7DA] flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <WifiOff className="w-4 h-4 text-[#0F5C5A] mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <span className="block text-sm font-bold text-[#1D2A2A]">
                  {t(lang, 'offlineMode')}
                </span>
                <span className="block text-xs text-[#526060]">{t(lang, 'offlineModeDesc')}</span>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={offlinePreview}
              aria-label={t(lang, 'offlineMode')}
              onClick={onToggleOfflinePreview}
              className={`w-12 h-7 rounded-full p-1 transition-colors cursor-pointer shrink-0 ${
                offlinePreview ? 'bg-[#8C5200]' : 'bg-[#D6CEC0]'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                  offlinePreview ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Install app (PWA) */}
        {installState !== 'unavailable' && (
          <section className="bg-white rounded-[20px] border border-[#E5DFD5] shadow-[0_2px_8px_rgba(29,42,42,0.04)] p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#E5F0EF] text-[#0F5C5A] flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-sm font-bold text-[#1D2A2A]">
                {installState === 'installed' ? 'App installed' : 'Install Sindhu app'}
              </span>
              <span className="block text-xs text-[#526060] mt-0.5">
                {installState === 'installed' &&
                  'You are using Sindhu Hospitals as an app on this device.'}
                {installState === 'promptable' &&
                  'Add it to your home screen for one-tap access, even with a weak connection.'}
                {installState === 'ios' &&
                  'In Safari, tap the Share icon, then "Add to Home Screen".'}
              </span>
              {installState === 'promptable' && (
                <button
                  type="button"
                  onClick={install}
                  className="mt-3 min-h-[48px] px-5 rounded-[16px] bg-[#0F5C5A] hover:bg-[#0B4745] text-white text-sm font-bold transition-colors cursor-pointer"
                >
                  Install app
                </button>
              )}
            </div>
          </section>
        )}

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full min-h-[48px] px-4 rounded-[16px] bg-[#EFE7DA] hover:bg-[#E6DBC9] text-[#1D2A2A] text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" aria-hidden="true" />
          <span>{t(lang, 'logout')}</span>
        </button>
      </div>

      {/* Edit Personal Info Sheet */}
      <BottomSheet
        open={editProfileOpen}
        onClose={() => setEditProfileOpen(false)}
        title="Edit Personal Info"
        subtitle={activeMember.fullName}
      >
        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          <div>
            <label htmlFor="edit-blood" className="block text-xs font-bold text-[#526060] mb-1">
              Blood Group
            </label>
            <input
              id="edit-blood"
              type="text"
              value={editBlood}
              onChange={(e) => setEditBlood(e.target.value)}
              placeholder="e.g. O+"
              className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
            />
          </div>
          <div>
            <label htmlFor="edit-insurance" className="block text-xs font-bold text-[#526060] mb-1">
              Health Insurance Provider
            </label>
            <input
              id="edit-insurance"
              type="text"
              value={editInsurance}
              onChange={(e) => setEditInsurance(e.target.value)}
              placeholder="e.g. Star Health / HDFC Ergo"
              className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
            />
          </div>
          <div>
            <label htmlFor="edit-email" className="block text-xs font-bold text-[#526060] mb-1">
              Email Address
            </label>
            <input
              id="edit-email"
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
            />
          </div>
          <div>
            <label htmlFor="edit-address" className="block text-xs font-bold text-[#526060] mb-1">
              Street Address (Hyderabad)
            </label>
            <input
              id="edit-address"
              type="text"
              value={editAddress}
              onChange={(e) => setEditAddress(e.target.value)}
              className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
            />
          </div>
          <button
            type="submit"
            className="w-full min-h-[52px] rounded-[16px] bg-[#0F5C5A] text-white text-sm font-bold cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      </BottomSheet>

      {/* Add Family Member Sheet */}
      <BottomSheet
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        title={t(lang, 'addFamilyMember')}
      >
        <form onSubmit={handleAddMember} className="space-y-3.5">
          <div>
            <label htmlFor="new-member-name" className="block text-xs font-bold text-[#526060] mb-1">
              Full Name
            </label>
            <input
              id="new-member-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Kavya G."
              className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="new-member-rel" className="block text-xs font-bold text-[#526060] mb-1">
                Relationship
              </label>
              <select
                id="new-member-rel"
                value={newRelation}
                onChange={(e) => setNewRelation(e.target.value as FamilyMember['relation'])}
                className="w-full min-h-[48px] px-3 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
              >
                <option value="Spouse">Spouse</option>
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Child">Child</option>
              </select>
            </div>
            <div>
              <label htmlFor="new-member-age" className="block text-xs font-bold text-[#526060] mb-1">
                Age
              </label>
              <input
                id="new-member-age"
                type="number"
                value={newAge}
                onChange={(e) => setNewAge(e.target.value)}
                className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold tabular-nums"
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-member-gender" className="block text-xs font-bold text-[#526060] mb-1">
              Gender
            </label>
            <select
              id="new-member-gender"
              value={newGender}
              onChange={(e) => setNewGender(e.target.value as FamilyMember['gender'])}
              className="w-full min-h-[48px] px-3 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
          {newMemberError && (
            <p role="alert" className="text-xs font-semibold text-[#B93822]">
              {newMemberError}
            </p>
          )}
          <button
            type="submit"
            className="w-full min-h-[52px] rounded-[16px] bg-[#0F5C5A] text-white text-sm font-bold cursor-pointer"
          >
            Add Member
          </button>
        </form>
      </BottomSheet>

      {/* Add Emergency Contact Sheet */}
      <BottomSheet
        open={addEmergencyOpen}
        onClose={() => setAddEmergencyOpen(false)}
        title="Add Emergency Contact"
      >
        <form onSubmit={handleAddEmergency} className="space-y-3.5">
          <div>
            <label htmlFor="ec-name" className="block text-xs font-bold text-[#526060] mb-1">
              Contact Name
            </label>
            <input
              id="ec-name"
              type="text"
              value={ecName}
              onChange={(e) => setEcName(e.target.value)}
              placeholder="e.g. Karthik V."
              className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
            />
          </div>
          <div>
            <label htmlFor="ec-rel" className="block text-xs font-bold text-[#526060] mb-1">
              Relationship
            </label>
            <input
              id="ec-rel"
              type="text"
              value={ecRelation}
              onChange={(e) => setEcRelation(e.target.value)}
              className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
            />
          </div>
          <div>
            <label htmlFor="ec-phone" className="block text-xs font-bold text-[#526060] mb-1">
              Phone Number
            </label>
            <input
              id="ec-phone"
              type="tel"
              value={ecPhone}
              onChange={(e) => setEcPhone(e.target.value)}
              placeholder="+91 98480 00000"
              className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold"
            />
          </div>
          <button
            type="submit"
            className="w-full min-h-[52px] rounded-[16px] bg-[#0F5C5A] text-white text-sm font-bold cursor-pointer"
          >
            Save Contact
          </button>
        </form>
      </BottomSheet>
    </div>
  );
}
