import type { Appointment, Bill, FamilyMember, Receipt } from '../types/patient';

export function validateMobileNumber(input: string): { valid: boolean; cleaned: string; error?: string } {
  const digits = input.replace(/\D/g, '');
  if (digits.length === 0) {
    return { valid: false, cleaned: digits, error: 'Enter your 10-digit mobile number to receive an OTP.' };
  }
  if (digits.length !== 10) {
    return { valid: false, cleaned: digits, error: 'Mobile number must be exactly 10 digits.' };
  }
  if (!/^[6-9]/.test(digits)) {
    return { valid: false, cleaned: digits, error: 'Enter a valid Indian mobile number starting with 6–9.' };
  }
  return { valid: true, cleaned: digits };
}

export function validateOtp(otp: string, expectedDemoOtp = '4829'): { valid: boolean; error?: string } {
  const cleaned = otp.replace(/\D/g, '');
  if (cleaned.length < 4) {
    return { valid: false, error: 'Enter the complete 4-digit OTP sent to your phone.' };
  }
  if (cleaned === '0000' || (expectedDemoOtp && cleaned !== expectedDemoOtp && cleaned.length === 4 && cleaned === '9999')) {
    return { valid: false, error: 'Incorrect OTP. Try demo code 4829 or tap Resend OTP.' };
  }
  return { valid: true };
}

export function calculateReferenceBarPercent(value: number, min: number, max: number): number {
  const span = max - min;
  if (span <= 0) return 50;
  // Map min..max onto 25%..75% of the visual bar so low (<min) and high (>max) have visual room
  const paddedMin = min - span * 0.5;
  const paddedMax = max + span * 0.5;
  const rawPct = ((value - paddedMin) / (paddedMax - paddedMin)) * 100;
  return Math.max(4, Math.min(96, Math.round(rawPct * 10) / 10));
}

export function calculateProfileCompletion(member: FamilyMember): number {
  const fields: boolean[] = [
    Boolean(member.fullName.trim()),
    Boolean(member.dob.trim()),
    Boolean(member.phone.trim()),
    Boolean(member.email?.trim()),
    Boolean(member.bloodGroup?.trim()),
    Boolean(member.insuranceProvider?.trim()),
    Boolean(member.address.line1.trim()),
    Boolean(member.address.pincode.trim()),
  ];
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
}

export function formatInr(amount: number): string {
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

export function getCountdownLabel(dateIso: string, timeSlot: string, nowIso = '2026-11-18'): string {
  const target = new Date(`${dateIso}T00:00:00`);
  const base = new Date(`${nowIso}T00:00:00`);
  const diffDays = Math.round((target.getTime() - base.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Today · ${timeSlot}`;
  if (diffDays === 1) return `Tomorrow · ${timeSlot}`;
  if (diffDays > 1) return `In ${diffDays} days · ${timeSlot}`;
  return `${dateIso} · ${timeSlot}`;
}

export function filterBillsByMonth(bills: Bill[], monthKey: string): Bill[] {
  if (monthKey === 'all') return bills;
  return bills.filter((bill) => bill.monthKey === monthKey);
}

export function applyBillPayment(
  bills: Bill[],
  receipts: Receipt[],
  billId: string,
  methodLabel: string
): { bills: Bill[]; receipts: Receipt[]; paidBill?: Bill } {
  const target = bills.find((b) => b.id === billId);
  if (!target || target.status === 'Paid') {
    return { bills, receipts };
  }
  const updatedBills = bills.map((b) => (b.id === billId ? { ...b, status: 'Paid' as const } : b));
  const newReceipt: Receipt = {
    id: `REC-${Date.now()}`,
    memberId: target.memberId,
    title: target.title,
    dateIso: '2026-11-18',
    dateDisplay: '18 Nov 2026',
    monthKey: '2026-11',
    amount: target.amount,
    method: methodLabel,
    referenceNo: `SH${Math.floor(100000 + Math.random() * 899999)}`,
  };
  return {
    bills: updatedBills,
    receipts: [newReceipt, ...receipts],
    paidBill: { ...target, status: 'Paid' },
  };
}

export function rescheduleAppointmentList(
  appointments: Appointment[],
  appointmentId: string,
  newDateIso: string,
  newDateLabel: string,
  newTimeSlot: string
): Appointment[] {
  return appointments.map((apt) =>
    apt.id === appointmentId
      ? {
          ...apt,
          dateIso: newDateIso,
          dateLabel: newDateLabel,
          timeSlot: newTimeSlot,
          checkedIn: false,
          tokenNumber: undefined,
        }
      : apt
  );
}

export function cancelAppointmentList(appointments: Appointment[], appointmentId: string): Appointment[] {
  return appointments.map((apt) =>
    apt.id === appointmentId ? { ...apt, status: 'cancelled' as const, checkedIn: false } : apt
  );
}

export interface SeasonalHealthTip {
  id: string;
  seasonLabel: string;
  department: string;
  author: string;
  title: string;
  summary: string;
  guidancePoints: string[];
}

export function getSeasonalHealthTip(month = 11): SeasonalHealthTip {
  // Nov–Feb: Hyderabad winter / early winter transition
  if (month >= 11 || month <= 2) {
    return {
      id: 'tip-winter-immunity',
      seasonLabel: 'November · Winter Care',
      department: 'Medical Oncology',
      author: 'Dr. Naveen Kumar M.',
      title: 'Early Winter Immunity & Hydration',
      summary:
        'Cooler Hyderabad mornings bring dry air and seasonal viral shifts. Warm fluids and iron-rich cooked meals help support steady energy and blood counts.',
      guidancePoints: [
        'Sip 2–2.5 litres of warm water, clear soups, or mild herbal infusions daily to keep mucosal barriers hydrated.',
        'Pair cooked iron-rich greens and lentils with vitamin C (amla or lemon) to support healthy haemoglobin recovery.',
        'Wear a light mask in crowded indoor clinics or transit, and contact our care desk promptly if fever crosses 100.4°F.',
      ],
    };
  }

  // Mar–May: Hyderabad summer
  if (month >= 3 && month <= 5) {
    return {
      id: 'tip-summer-hydration',
      seasonLabel: 'Summer Care',
      department: 'General Medicine',
      author: 'Dr. Meera Nair',
      title: 'Heat Protection & Electrolyte Balance',
      summary:
        'Peak Hyderabad heat increases fluid loss during outpatient visits. Schedule outdoor travel before 10 AM and keep oral hydration close.',
      guidancePoints: [
        'Choose light cotton layers and carry chilled water or low-sugar buttermilk between hospital appointments.',
        'Use broad-spectrum sunscreen (SPF 30+) if your skin is sensitive after recent oncology therapy.',
      ],
    };
  }

  // Jun–Oct: Monsoon
  return {
    id: 'tip-monsoon-hygiene',
    seasonLabel: 'Monsoon Care',
    department: 'Haemato-Oncology',
    author: 'Dr. Ananya Reddy',
    title: 'Freshly Cooked Meals & Water Safety',
    summary:
      'Monsoon humidity calls for extra care with food and water hygiene to protect sensitive immunity.',
    guidancePoints: [
      'Prefer freshly cooked, warm meals at home and boiled or filtered drinking water.',
      'Wash whole fruits thoroughly and avoid pre-cut street salads when white blood cell counts are recovering.',
    ],
  };
}

