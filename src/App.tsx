import React, { useEffect, useState } from 'react';
import { Calendar, CreditCard, FileText, Home, User } from 'lucide-react';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_BILLS,
  INITIAL_EMERGENCY_CONTACTS,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECEIPTS,
  LAB_REPORTS,
  WALLET_BY_MEMBER,
} from './data/mockData';
import type {
  AppNotification,
  Appointment,
  Bill,
  EmergencyContact,
  FamilyMember,
  Language,
  Receipt,
  RecordCategory,
  TabId,
} from './types/patient';
import { t } from './i18n/translations';
import {
  applyBillPayment,
  cancelAppointmentList,
  rescheduleAppointmentList,
} from './utils/patientLogic';
import { OfflineBanner } from './components/ui/Primitives';
import { LoginScreen } from './components/LoginScreen';
import { HomeScreen } from './components/HomeScreen';
import { CareScreen } from './components/CareScreen';
import { RecordsScreen } from './components/RecordsScreen';
import { BillingScreen } from './components/BillingScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { NotificationsSheet } from './components/NotificationsSheet';
import { SosSheet } from './components/SosSheet';

export default function App() {
  const autostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(autostart);
  const [activeTab, setActiveTab] = useState<TabId>(() => {
    const q = new URLSearchParams(window.location.search).get('tab');
    return (['home', 'care', 'records', 'billing', 'profile'] as TabId[]).includes(q as TabId)
      ? (q as TabId)
      : 'home';
  });
  const [lang, setLang] = useState<Language>('en');
  const [largeText, setLargeText] = useState<boolean>(false);

  // In-memory application state (zero localStorage)
  const [members, setMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);
  const [activeMemberId, setActiveMemberId] = useState<string>(INITIAL_FAMILY_MEMBERS[0].id);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [bills, setBills] = useState<Bill[]>(INITIAL_BILLS);
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    INITIAL_EMERGENCY_CONTACTS
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);

  // Sub-navigation hints when jumping via quick actions or notifications
  const [careInitialMode, setCareInitialMode] = useState<'book' | 'my'>('book');
  const [recordsInitialTab, setRecordsInitialTab] = useState<RecordCategory>('lab');
  const [recordsInitialReportId, setRecordsInitialReportId] = useState<string | undefined>(
    undefined
  );

  // Global overlays & connectivity/loading states
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [browserOffline, setBrowserOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const [offlinePreview, setOfflinePreview] = useState(false);
  const [loadingContent, setLoadingContent] = useState(false);
  const [syncError, setSyncError] = useState(false);

  const isOffline = browserOffline || offlinePreview;

  useEffect(() => {
    const root = document.documentElement;
    if (largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
  }, [largeText]);

  useEffect(() => {
    const onOffline = () => setBrowserOffline(true);
    const onOnline = () => {
      setBrowserOffline(false);
      setSyncError(false);
    };
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  const activeMember = members.find((m) => m.id === activeMemberId) ?? members[0];
  const wallet = WALLET_BY_MEMBER[activeMember.id] ?? { available: 0, used: 0, refunded: 0 };

  const memberUpcomingAppointments = appointments.filter(
    (a) => a.memberId === activeMember.id && a.status === 'upcoming'
  );
  const nextAppointment = memberUpcomingAppointments[0];
  const latestReport = LAB_REPORTS.find((r) => r.memberId === activeMember.id);
  const dueBillsCount = bills.filter(
    (b) => b.memberId === activeMember.id && b.status === 'Due'
  ).length;
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  const triggerBriefSkeleton = () => {
    setLoadingContent(true);
    window.setTimeout(() => {
      setLoadingContent(false);
    }, 240);
  };

  const handleSelectMember = (id: string) => {
    if (id === activeMemberId) return;
    setActiveMemberId(id);
    setRecordsInitialReportId(undefined);
    triggerBriefSkeleton();
  };

  const handleNavigateTab = (
    tab: TabId,
    options?: { recordTab?: RecordCategory; reportId?: string; careMode?: 'book' | 'my' }
  ) => {
    if (options?.careMode) setCareInitialMode(options.careMode);
    if (options?.recordTab) setRecordsInitialTab(options.recordTab);
    setRecordsInitialReportId(options?.reportId);
    setActiveTab(tab);
  };

  const handleRetryConnectivity = () => {
    if (offlinePreview) {
      setOfflinePreview(false);
    }
    setSyncError(false);
    triggerBriefSkeleton();
  };

  const handleCheckIn = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === appointmentId ? { ...a, checkedIn: true, tokenNumber: 'B-14' } : a
      )
    );
  };

  const handleCreateAppointment = (apt: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...apt,
      id: `apt-${Date.now()}`,
    };
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handleReschedule = (
    id: string,
    dateIso: string,
    dateLabel: string,
    timeSlot: string
  ) => {
    setAppointments((prev) =>
      rescheduleAppointmentList(prev, id, dateIso, dateLabel, timeSlot)
    );
  };

  const handleCancel = (id: string) => {
    setAppointments((prev) => cancelAppointmentList(prev, id));
  };

  const handlePayBill = (billId: string, methodLabel: string) => {
    const res = applyBillPayment(bills, receipts, billId, methodLabel);
    setBills(res.bills);
    setReceipts(res.receipts);
  };

  const handleUpdateMember = (updated: FamilyMember) => {
    setMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  };

  const handleAddFamilyMember = (member: Omit<FamilyMember, 'id' | 'uhid'>) => {
    const newMember: FamilyMember = {
      ...member,
      id: `mem-${Date.now()}`,
      uhid: `SHHC.260${Math.floor(10000 + Math.random() * 89999)}`,
    };
    setMembers((prev) => [...prev, newMember]);
  };

  const handleAddEmergencyContact = (contact: Omit<EmergencyContact, 'id'>) => {
    setEmergencyContacts((prev) => [...prev, { ...contact, id: `ec-${Date.now()}` }]);
  };

  const navItems: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t(lang, 'navHome'), icon: <Home className="w-5 h-5" aria-hidden="true" /> },
    { id: 'care', label: t(lang, 'navCare'), icon: <Calendar className="w-5 h-5" aria-hidden="true" /> },
    { id: 'records', label: t(lang, 'navRecords'), icon: <FileText className="w-5 h-5" aria-hidden="true" /> },
    { id: 'billing', label: t(lang, 'navBilling'), icon: <CreditCard className="w-5 h-5" aria-hidden="true" /> },
    { id: 'profile', label: t(lang, 'navProfile'), icon: <User className="w-5 h-5" aria-hidden="true" /> },
  ];

  return (
    <div className="min-h-screen w-full bg-[#F1ECE2] flex justify-center sm:py-6">
      {/* 390px Mobile-First Prototype Shell centered on Desktop */}
      <div className="w-full sm:max-w-[390px] h-[100dvh] sm:h-[844px] pt-[max(env(safe-area-inset-top,0px),var(--safe-area-inset-top,0px))] sm:pt-0 bg-[#FAF8F4] sm:rounded-[32px] sm:border sm:border-[#DFD8CA] sm:shadow-[0_20px_50px_rgba(29,42,42,0.10)] flex flex-col overflow-hidden relative">
        {isOffline && (
          <OfflineBanner
            message={t(lang, 'offlineBanner')}
            retryLabel={t(lang, 'retry')}
            onRetry={handleRetryConnectivity}
          />
        )}

        {!isAuthenticated ? (
          <main className="flex-1 overflow-y-auto">
            <LoginScreen
              onLoginSuccess={() => {
                setIsAuthenticated(true);
                setActiveTab('home');
                triggerBriefSkeleton();
              }}
            />
          </main>
        ) : (
          <>
            <main className="flex-1 overflow-y-auto">
              {activeTab === 'home' && (
                <HomeScreen
                  lang={lang}
                  members={members}
                  activeMember={activeMember}
                  onSelectMember={handleSelectMember}
                  nextAppointment={nextAppointment}
                  onCheckIn={handleCheckIn}
                  latestReport={latestReport}
                  wallet={wallet}
                  dueBillsCount={dueBillsCount}
                  unreadNotifications={unreadNotifications}
                  loading={loadingContent}
                  syncError={syncError}
                  onRetrySync={handleRetryConnectivity}
                  onOpenNotifications={() => setNotificationsOpen(true)}
                  onOpenSos={() => setSosOpen(true)}
                  onNavigateTab={handleNavigateTab}
                />
              )}

              {activeTab === 'care' && (
                <CareScreen
                  lang={lang}
                  activeMember={activeMember}
                  appointments={appointments}
                  initialMode={careInitialMode}
                  isOffline={isOffline}
                  loading={loadingContent}
                  unreadNotifications={unreadNotifications}
                  onOpenNotifications={() => setNotificationsOpen(true)}
                  onCreateAppointment={handleCreateAppointment}
                  onRescheduleAppointment={handleReschedule}
                  onCancelAppointment={handleCancel}
                  onCheckIn={handleCheckIn}
                />
              )}

              {activeTab === 'records' && (
                <RecordsScreen
                  lang={lang}
                  activeMember={activeMember}
                  initialTab={recordsInitialTab}
                  initialReportId={recordsInitialReportId}
                  loading={loadingContent}
                  unreadNotifications={unreadNotifications}
                  onOpenNotifications={() => setNotificationsOpen(true)}
                />
              )}

              {activeTab === 'billing' && (
                <BillingScreen
                  lang={lang}
                  activeMember={activeMember}
                  bills={bills}
                  receipts={receipts}
                  wallet={wallet}
                  isOffline={isOffline}
                  loading={loadingContent}
                  unreadNotifications={unreadNotifications}
                  onOpenNotifications={() => setNotificationsOpen(true)}
                  onPayBill={handlePayBill}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen
                  lang={lang}
                  onChangeLang={setLang}
                  largeText={largeText}
                  onToggleLargeText={() => setLargeText((v) => !v)}
                  offlinePreview={offlinePreview}
                  onToggleOfflinePreview={() => {
                    const next = !offlinePreview;
                    setOfflinePreview(next);
                    setSyncError(next);
                  }}
                  members={members}
                  activeMember={activeMember}
                  onSelectMember={handleSelectMember}
                  onUpdateMember={handleUpdateMember}
                  onAddFamilyMember={handleAddFamilyMember}
                  emergencyContacts={emergencyContacts}
                  onAddEmergencyContact={handleAddEmergencyContact}
                  onOpenSos={() => setSosOpen(true)}
                  onLogout={() => {
                    setIsAuthenticated(false);
                    setActiveTab('home');
                  }}
                />
              )}
            </main>

            {/* Bottom Tab Navigation (5 tabs, >=48px touch targets, <=15% height) */}
            <nav
              aria-label="Primary navigation"
              className="shrink-0 bg-white border-t border-[#E5DFD5] px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0px),var(--safe-area-inset-bottom,0px))] grid grid-cols-5 items-center z-30"
            >
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === 'records') setRecordsInitialReportId(undefined);
                      setActiveTab(item.id);
                    }}
                    aria-current={isActive ? 'page' : undefined}
                    className={`min-h-[52px] rounded-[14px] flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'text-[#0F5C5A] bg-[#E5F0EF]/60'
                        : 'text-[#526060] hover:text-[#1D2A2A]'
                    }`}
                  >
                    {item.icon}
                    <span className="text-[11px] font-bold leading-none whitespace-nowrap">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </>
        )}

        {/* Notifications Sheet */}
        <NotificationsSheet
          open={notificationsOpen}
          onClose={() => setNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onSelectNotification={(notif) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
            );
            handleNavigateTab(notif.targetTab, {
              recordTab: notif.category === 'report' ? 'lab' : undefined,
              reportId: notif.targetId,
              careMode: notif.category === 'appointment' ? 'my' : undefined,
            });
          }}
          lang={lang}
        />

        {/* SOS Confirm Sheet */}
        <SosSheet
          open={sosOpen}
          onClose={() => setSosOpen(false)}
          patientName={activeMember.name}
          uhid={activeMember.uhid}
          lang={lang}
        />
      </div>
    </div>
  );
}
