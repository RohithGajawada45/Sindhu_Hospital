import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyBillPayment,
  calculateProfileCompletion,
  calculateReferenceBarPercent,
  cancelAppointmentList,
  filterBillsByMonth,
  formatInr,
  getCountdownLabel,
  getSeasonalHealthTip,
  rescheduleAppointmentList,
  validateMobileNumber,
  validateOtp,
} from './patientLogic';
import type { Appointment, Bill, FamilyMember, Receipt } from '../types/patient';

test('validateMobileNumber rejects invalid lengths and prefixes', () => {
  assert.equal(validateMobileNumber('').valid, false);
  assert.equal(validateMobileNumber('98765').valid, false);
  assert.equal(validateMobileNumber('1234567890').valid, false);
  const ok = validateMobileNumber('9848012345');
  assert.equal(ok.valid, true);
  assert.equal(ok.cleaned, '9848012345');
});

test('validateOtp enforces 4 digits and rejects test invalid code 0000', () => {
  assert.equal(validateOtp('12').valid, false);
  assert.equal(validateOtp('0000').valid, false);
  assert.equal(validateOtp('4829').valid, true);
});

test('calculateReferenceBarPercent maps low, mid, and high values proportionally', () => {
  const mid = calculateReferenceBarPercent(14, 13, 17);
  assert.equal(mid > 30 && mid < 45, true);
  const low = calculateReferenceBarPercent(11.4, 13, 17);
  const high = calculateReferenceBarPercent(18.5, 13, 17);
  assert.equal(low < 25, true);
  assert.equal(high > 75, true);
});

test('calculateProfileCompletion reflects missing optional fields accurately', () => {
  const member: FamilyMember = {
    id: 'm1',
    name: 'Rohith G.',
    fullName: 'Mr. Gajawada Rohith',
    relation: 'Self',
    age: 22,
    gender: 'Male',
    uhid: 'SHHC.26048311',
    dob: '04 Dec 2003',
    bloodGroup: '',
    insuranceProvider: '',
    phone: '+91 98480 22311',
    email: 'rohith.g@example.in',
    address: {
      line1: 'Plot 42, Madhapur',
      landmark: 'Near Cyber Towers',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
    },
  };
  assert.equal(calculateProfileCompletion(member), 75);
  assert.equal(calculateProfileCompletion({ ...member, bloodGroup: 'O+', insuranceProvider: 'Star Health' }), 100);
});

test('formatInr uses Indian grouping and rupee symbol', () => {
  assert.equal(formatInr(18500), '₹18,500');
  assert.equal(formatInr(142000), '₹1,42,000');
});

test('getCountdownLabel formats today, tomorrow, and future days', () => {
  assert.equal(getCountdownLabel('2026-11-18', '04:00 PM', '2026-11-18'), 'Today · 04:00 PM');
  assert.equal(getCountdownLabel('2026-11-20', '10:30 AM', '2026-11-18'), 'In 2 days · 10:30 AM');
});

test('applyBillPayment marks due bill as Paid and creates a receipt', () => {
  const bills: Bill[] = [
    {
      id: 'B1',
      memberId: 'rohith',
      title: 'Haemato-Oncology Consultation',
      category: 'OP',
      dateIso: '2026-11-14',
      dateDisplay: '14 Nov 2026',
      monthKey: '2026-11',
      amount: 1200,
      status: 'Due',
      doctorName: 'Dr. Naveen Kumar M.',
      items: [{ description: 'Consultation', qty: 1, amount: 1200 }],
    },
  ];
  const receipts: Receipt[] = [];
  const res = applyBillPayment(bills, receipts, 'B1', 'UPI · GPay');
  assert.equal(res.bills[0].status, 'Paid');
  assert.equal(res.receipts.length, 1);
  assert.equal(res.receipts[0].amount, 1200);
  assert.equal(filterBillsByMonth(res.bills, '2026-10').length, 0);
});

test('rescheduleAppointmentList and cancelAppointmentList update state cleanly', () => {
  const list: Appointment[] = [
    {
      id: 'A1',
      memberId: 'rohith',
      doctorId: 'd1',
      doctorName: 'Dr. Naveen Kumar M.',
      doctorPhoto: '/img.jpg',
      speciality: 'Medical Oncology',
      facilityName: 'Sindhu Hospitals — HITEC City',
      dateIso: '2026-11-20',
      dateLabel: 'Fri, 20 Nov 2026',
      timeSlot: '10:30 AM',
      status: 'upcoming',
      checkedIn: true,
      tokenNumber: 'B-14',
      fee: 1000,
    },
  ];
  const rescheduled = rescheduleAppointmentList(list, 'A1', '2026-11-22', 'Sun, 22 Nov 2026', '04:00 PM');
  assert.equal(rescheduled[0].timeSlot, '04:00 PM');
  assert.equal(rescheduled[0].checkedIn, false);

  const cancelled = cancelAppointmentList(rescheduled, 'A1');
  assert.equal(cancelled[0].status, 'cancelled');
});

test('getSeasonalHealthTip returns seasonally tailored Sindhu Hospitals guidance', () => {
  const nov = getSeasonalHealthTip(11);
  assert.equal(nov.id, 'tip-winter-immunity');
  assert.equal(nov.guidancePoints.length >= 2, true);

  const apr = getSeasonalHealthTip(4);
  assert.equal(apr.id, 'tip-summer-hydration');

  const aug = getSeasonalHealthTip(8);
  assert.equal(aug.id, 'tip-monsoon-hygiene');
});

