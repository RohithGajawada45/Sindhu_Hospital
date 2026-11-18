import React, { useMemo, useState } from 'react';
import {
  Bell,
  CheckCircle2,
  CreditCard,
  Landmark,
  Receipt as ReceiptIcon,
  Smartphone,
  Wallet,
} from 'lucide-react';
import { DEPOSITS } from '../data/mockData';
import type {
  Bill,
  BillingTab,
  FamilyMember,
  Language,
  Receipt,
  WalletSummary,
} from '../types/patient';
import { t } from '../i18n/translations';
import { filterBillsByMonth, formatInr } from '../utils/patientLogic';
import {
  BottomSheet,
  EmptyState,
  InlineError,
  SkeletonCard,
  StatusChip,
} from './ui/Primitives';

interface BillingScreenProps {
  lang: Language;
  activeMember: FamilyMember;
  bills: Bill[];
  receipts: Receipt[];
  wallet: WalletSummary;
  isOffline: boolean;
  loading: boolean;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  onPayBill: (billId: string, methodLabel: string) => void;
}

const MONTH_FILTERS = [
  { key: 'all', label: 'All 2026' },
  { key: '2026-11', label: 'Nov 2026' },
  { key: '2026-10', label: 'Oct 2026' },
  { key: '2026-09', label: 'Sep 2026' },
];

export function BillingScreen({
  lang,
  activeMember,
  bills,
  receipts,
  wallet,
  isOffline,
  loading,
  unreadNotifications,
  onOpenNotifications,
  onPayBill,
}: BillingScreenProps) {
  const [tab, setTab] = useState<BillingTab>('bills');
  const [monthFilter, setMonthFilter] = useState<string>('all');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [paySheetBill, setPaySheetBill] = useState<Bill | null>(null);
  const [payMethod, setPayMethod] = useState<'upi' | 'card'>('upi');
  const [upiApp, setUpiApp] = useState<'Google Pay' | 'PhonePe' | 'UPI ID'>('Google Pay');
  const [upiId, setUpiId] = useState('rohith@okicici');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [paySuccessReceipt, setPaySuccessReceipt] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const memberBills = useMemo(
    () =>
      filterBillsByMonth(
        bills.filter((b) => b.memberId === activeMember.id),
        monthFilter
      ),
    [bills, activeMember.id, monthFilter]
  );

  const memberReceipts = useMemo(
    () =>
      receipts.filter(
        (r) => r.memberId === activeMember.id && (monthFilter === 'all' || r.monthKey === monthFilter)
      ),
    [receipts, activeMember.id, monthFilter]
  );

  const memberDeposits = useMemo(
    () =>
      DEPOSITS.filter(
        (d) => d.memberId === activeMember.id && (monthFilter === 'all' || d.monthKey === monthFilter)
      ),
    [activeMember.id, monthFilter]
  );

  const handleCompletePayment = () => {
    if (!paySheetBill) return;
    if (isOffline) {
      setPayError('You appear to be offline. Reconnect to complete payment.');
      return;
    }
    if (payMethod === 'upi' && upiApp === 'UPI ID' && !upiId.includes('@')) {
      setPayError('Enter a valid UPI ID (e.g. name@bank).');
      return;
    }
    setPayError(null);
    const label = payMethod === 'upi' ? `UPI · ${upiApp}` : 'Card ending 8812';
    onPayBill(paySheetBill.id, label);
    setPaySuccessReceipt(`${paySheetBill.title} (${formatInr(paySheetBill.amount)})`);
    setPaySheetBill(null);
    setSelectedBill(null);
  };

  return (
    <div className="pb-6">
      <header className="px-5 pt-4 pb-3 bg-[#FAF8F4] sticky top-0 z-20 border-b border-[#E5DFD5]/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-[#1D2A2A] tracking-tight">
              {t(lang, 'navBilling')}
            </h1>
            <p className="text-xs text-[#526060]">
              {activeMember.name} · Available wallet{' '}
              <span className="font-bold text-[#0F5C5A] tabular-nums">
                {formatInr(wallet.available)}
              </span>
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

        {/* Segmented Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#EFE7DA] rounded-[16px]" role="tablist">
          {(
            [
              ['bills', t(lang, 'bills')],
              ['receipts', t(lang, 'receipts')],
              ['deposits', t(lang, 'deposits')],
            ] as [BillingTab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={`min-h-[44px] rounded-[12px] text-xs font-bold transition-colors cursor-pointer ${
                tab === key ? 'bg-white text-[#1D2A2A] shadow-sm' : 'text-[#526060]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 pt-4 space-y-4">
        {/* Month filter strip */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
          {MONTH_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setMonthFilter(f.key)}
              className={`min-h-[40px] px-3.5 rounded-[12px] text-xs font-bold whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                monthFilter === f.key
                  ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                  : 'bg-white text-[#1D2A2A] border-[#E5DFD5]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {paySuccessReceipt && (
          <div className="bg-[#E7F4ED] border border-[#1A6B46]/25 rounded-[18px] p-4 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-[#1A6B46] shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[#1D2A2A]">Payment Successful</p>
              <p className="text-xs text-[#526060] mt-0.5">
                {paySuccessReceipt} — receipt added under Receipts.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setPaySuccessReceipt(null)}
              className="text-xs font-bold text-[#1A6B46] min-h-[36px] px-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
          </div>
        ) : tab === 'bills' ? (
          memberBills.length === 0 ? (
            <EmptyState
              icon={<ReceiptIcon className="w-6 h-6" aria-hidden="true" />}
              title="No bills for this period"
              description={`No outpatient, lab, or daycare bills match the selected filter for ${activeMember.name}.`}
              actionLabel={monthFilter !== 'all' ? 'Show all 2026 bills' : undefined}
              onAction={monthFilter !== 'all' ? () => setMonthFilter('all') : undefined}
            />
          ) : (
            <div className="space-y-3">
              {memberBills.map((bill) => (
                <div
                  key={bill.id}
                  className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] shadow-[0_2px_10px_rgba(29,42,42,0.04)] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="text-base font-extrabold text-[#1D2A2A] leading-snug">
                        {bill.title}
                      </h2>
                      <p className="text-xs text-[#526060] mt-0.5">
                        {bill.category} · {bill.dateDisplay} · {bill.doctorName}
                      </p>
                    </div>
                    <StatusChip
                      status={bill.status}
                      label={bill.status === 'Paid' ? t(lang, 'paid') : t(lang, 'due')}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EFE7DA]">
                    <div>
                      <span className="block text-[11px] text-[#526060]">Total Amount</span>
                      <span className="text-xl font-extrabold text-[#1D2A2A] tabular-nums">
                        {formatInr(bill.amount)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedBill(bill)}
                        className="min-h-[48px] px-4 rounded-[14px] bg-[#EFE7DA] text-[#1D2A2A] text-xs font-bold cursor-pointer"
                      >
                        View Items
                      </button>
                      {bill.status === 'Due' && (
                        <button
                          type="button"
                          onClick={() => {
                            setPayError(null);
                            setPaySheetBill(bill);
                          }}
                          className="min-h-[48px] px-4 rounded-[14px] bg-[#0F5C5A] hover:bg-[#0B4745] text-white text-xs font-bold cursor-pointer"
                        >
                          {t(lang, 'payNow')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : tab === 'receipts' ? (
          memberReceipts.length === 0 ? (
            <EmptyState
              icon={<Landmark className="w-6 h-6" aria-hidden="true" />}
              title="No receipts found"
              description={`Completed payment receipts for ${activeMember.name} will appear here.`}
              actionLabel={monthFilter !== 'all' ? 'Reset date filter' : undefined}
              onAction={monthFilter !== 'all' ? () => setMonthFilter('all') : undefined}
            />
          ) : (
            <div className="space-y-3">
              {memberReceipts.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h2 className="text-sm font-extrabold text-[#1D2A2A] truncate">{rec.title}</h2>
                    <p className="text-xs text-[#526060] mt-0.5">
                      {rec.dateDisplay} · {rec.method}
                    </p>
                    <p className="text-[11px] text-[#687676] tabular-nums mt-0.5">
                      Ref: {rec.referenceNo}
                    </p>
                  </div>
                  <span className="text-base font-extrabold text-[#1A6B46] tabular-nums shrink-0">
                    {formatInr(rec.amount)}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : memberDeposits.length === 0 ? (
          <EmptyState
            icon={<Wallet className="w-6 h-6" aria-hidden="true" />}
            title="No deposits or refunds"
            description={`Hospital advance deposits and refund entries for ${activeMember.name} appear here.`}
          />
        ) : (
          <div className="space-y-3">
            {memberDeposits.map((dep) => (
              <div
                key={dep.id}
                className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-xs font-bold text-[#0F5C5A]">{dep.type}</span>
                  <h2 className="text-sm font-bold text-[#1D2A2A] mt-0.5">{dep.note}</h2>
                  <p className="text-xs text-[#526060] mt-0.5">{dep.dateDisplay}</p>
                </div>
                <span className="text-base font-extrabold text-[#1D2A2A] tabular-nums shrink-0">
                  {formatInr(dep.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bill Detail Sheet */}
      <BottomSheet
        open={Boolean(selectedBill)}
        onClose={() => setSelectedBill(null)}
        title={selectedBill?.title ?? 'Bill Summary'}
        subtitle={
          selectedBill ? `${selectedBill.dateDisplay} · ${selectedBill.doctorName}` : undefined
        }
      >
        {selectedBill && (
          <div className="space-y-4">
            <div className="bg-white rounded-[18px] p-4 border border-[#E5DFD5] divide-y divide-[#EFE7DA]">
              {selectedBill.items.map((item) => (
                <div key={item.description} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1D2A2A]">{item.description}</p>
                    <p className="text-xs text-[#526060]">Qty: {item.qty}</p>
                  </div>
                  <span className="text-sm font-bold text-[#1D2A2A] tabular-nums shrink-0">
                    {formatInr(item.amount)}
                  </span>
                </div>
              ))}
              <div className="pt-3 flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#1D2A2A]">Total</span>
                <span className="text-lg font-extrabold text-[#0F5C5A] tabular-nums">
                  {formatInr(selectedBill.amount)}
                </span>
              </div>
            </div>

            {selectedBill.status === 'Due' ? (
              <button
                type="button"
                onClick={() => {
                  setPayError(null);
                  setPaySheetBill(selectedBill);
                }}
                className="w-full min-h-[52px] rounded-[16px] bg-[#0F5C5A] text-white text-base font-bold cursor-pointer"
              >
                {t(lang, 'payNow')} · {formatInr(selectedBill.amount)}
              </button>
            ) : (
              <div className="p-3.5 rounded-[16px] bg-[#E7F4ED] text-[#1A6B46] text-sm font-bold text-center">
                This bill has been paid in full
              </div>
            )}
          </div>
        )}
      </BottomSheet>

      {/* Pay Now Sheet (UPI / Card) */}
      <BottomSheet
        open={Boolean(paySheetBill)}
        onClose={() => setPaySheetBill(null)}
        title="Complete Payment"
        subtitle={paySheetBill ? `${paySheetBill.title} · ${formatInr(paySheetBill.amount)}` : undefined}
      >
        {paySheetBill && (
          <div className="space-y-4">
            {payError && (
              <InlineError
                title="Payment paused"
                description={payError}
                onRetry={() => {
                  if (!isOffline) setPayError(null);
                }}
              />
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPayMethod('upi')}
                className={`min-h-[48px] px-3 rounded-[14px] border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  payMethod === 'upi'
                    ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                    : 'bg-white text-[#1D2A2A] border-[#E5DFD5]'
                }`}
              >
                <Smartphone className="w-4 h-4" aria-hidden="true" />
                <span>UPI</span>
              </button>
              <button
                type="button"
                onClick={() => setPayMethod('card')}
                className={`min-h-[48px] px-3 rounded-[14px] border text-sm font-bold flex items-center justify-center gap-2 cursor-pointer ${
                  payMethod === 'card'
                    ? 'bg-[#0F5C5A] text-white border-[#0F5C5A]'
                    : 'bg-white text-[#1D2A2A] border-[#E5DFD5]'
                }`}
              >
                <CreditCard className="w-4 h-4" aria-hidden="true" />
                <span>Debit / Credit Card</span>
              </button>
            </div>

            {payMethod === 'upi' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {(['Google Pay', 'PhonePe', 'UPI ID'] as const).map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setUpiApp(app)}
                      className={`min-h-[48px] px-2 rounded-[14px] text-xs font-bold border cursor-pointer ${
                        upiApp === app
                          ? 'bg-[#EFE7DA] border-[#0F5C5A] text-[#0F5C5A]'
                          : 'bg-white border-[#E5DFD5] text-[#1D2A2A]'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>

                {upiApp === 'UPI ID' && (
                  <div>
                    <label htmlFor="upi-id-input" className="block text-xs font-bold text-[#526060] mb-1">
                      Enter UPI ID
                    </label>
                    <input
                      id="upi-id-input"
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-white border border-[#E5DFD5] text-sm font-semibold text-[#1D2A2A]"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 bg-white p-4 rounded-[18px] border border-[#E5DFD5]">
                <label htmlFor="card-num-input" className="block text-xs font-bold text-[#526060]">
                  Saved Card
                </label>
                <input
                  id="card-num-input"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-[#FAF8F4] border border-[#E5DFD5] text-sm font-bold tabular-nums text-[#1D2A2A]"
                />
                <p className="text-xs text-[#526060]">Expires 09/29 · Secured 256-bit checkout</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleCompletePayment}
              className="w-full min-h-[52px] rounded-[16px] bg-[#0F5C5A] hover:bg-[#0B4745] text-white text-base font-bold cursor-pointer"
            >
              Pay {formatInr(paySheetBill.amount)}
            </button>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
