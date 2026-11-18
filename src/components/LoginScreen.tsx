import React, { useEffect, useState } from 'react';
import { ArrowRight, Fingerprint, HeartHandshake, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { validateMobileNumber, validateOtp } from '../utils/patientLogic';

interface LoginScreenProps {
  onLoginSuccess: (phone: string, biometricsEnabled: boolean) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('9848022311');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resendSeconds, setResendSeconds] = useState(30);
  const [useBiometrics, setUseBiometrics] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (step !== 'otp' || resendSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setResendSeconds((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, resendSeconds]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateMobileNumber(phone);
    if (!check.valid) {
      setError(check.error ?? 'Invalid mobile number');
      return;
    }
    setError(null);
    setStep('otp');
    setResendSeconds(30);
    setOtp('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateOtp(otp, '4829');
    if (!check.valid) {
      setError(check.error ?? 'Invalid OTP');
      return;
    }
    setError(null);
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      onLoginSuccess(phone, useBiometrics);
    }, 220);
  };

  const handleResend = () => {
    if (resendSeconds > 0) return;
    setError(null);
    setOtp('');
    setResendSeconds(30);
  };

  return (
    <div className="min-h-full flex flex-col justify-between px-5 py-8 bg-[#FAF8F4]">
      <div>
        {/* Calm brand header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-[14px] bg-[#0F5C5A] text-white flex items-center justify-center shrink-0">
            <HeartHandshake className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold text-[#1D2A2A] tracking-tight leading-tight">
              Sindhu Hospitals
            </h1>
            <p className="text-xs font-medium text-[#526060]">
              HITEC City · Oncology & Haemato-Oncology
            </p>
          </div>
        </div>

        {/* Hero welcome */}
        <div className="mb-7">
          <h2 className="text-[26px] font-extrabold text-[#1D2A2A] tracking-tight leading-[1.2]">
            {step === 'phone' ? 'Sign in to your care portal' : 'Verify your mobile number'}
          </h2>
          <p className="text-[15px] text-[#526060] mt-2 leading-relaxed">
            {step === 'phone'
              ? 'Access lab reports, appointments, prescriptions, and billing for you and your family.'
              : `Enter the 4-digit OTP sent to +91 ${phone}. Demo code: 4829.`}
          </p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
            <div className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] shadow-[0_2px_10px_rgba(29,42,42,0.04)]">
              <label htmlFor="login-mobile" className="block text-sm font-semibold text-[#1D2A2A] mb-2">
                Registered Mobile Number
              </label>
              <div className="flex items-center gap-2">
                <span className="min-h-[48px] px-3.5 rounded-[14px] bg-[#EFE7DA] text-[#1D2A2A] text-sm font-bold flex items-center shrink-0">
                  +91
                </span>
                <input
                  id="login-mobile"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ''));
                    if (error) setError(null);
                  }}
                  placeholder="10-digit mobile number"
                  className="w-full min-h-[48px] px-3.5 rounded-[14px] bg-[#FAF8F4] border border-[#DFD7CA] text-base font-semibold text-[#1D2A2A] tabular-nums focus:outline-none focus:border-[#0F5C5A]"
                />
              </div>
              {error && (
                <p role="alert" className="mt-2.5 text-sm font-medium text-[#B93822]">
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full min-h-[52px] px-5 rounded-[16px] bg-[#0F5C5A] hover:bg-[#0B4745] text-white text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Send OTP</span>
              <ArrowRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4" noValidate>
            <div className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] shadow-[0_2px_10px_rgba(29,42,42,0.04)] space-y-4">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor="login-otp" className="text-sm font-semibold text-[#1D2A2A]">
                  4-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setStep('phone');
                    setError(null);
                  }}
                  className="text-xs font-semibold text-[#0F5C5A] hover:underline cursor-pointer min-h-[36px] px-2"
                >
                  Change number
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="login-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value.replace(/\D/g, ''));
                    if (error) setError(null);
                  }}
                  placeholder="• • • •"
                  className="flex-1 min-h-[52px] px-4 rounded-[14px] bg-[#FAF8F4] border border-[#DFD7CA] text-center text-2xl font-extrabold tracking-[0.4em] text-[#1D2A2A] tabular-nums focus:outline-none focus:border-[#0F5C5A]"
                />
                <button
                  type="button"
                  onClick={() => {
                    setOtp('4829');
                    setError(null);
                  }}
                  className="min-h-[52px] px-3.5 rounded-[14px] bg-[#EFE7DA] hover:bg-[#E6DBC9] text-[#1D2A2A] text-xs font-bold whitespace-nowrap cursor-pointer"
                >
                  Fill 4829
                </button>
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-[#B93822]">
                  {error}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-medium text-[#526060] tabular-nums">
                  {resendSeconds > 0
                    ? `Resend OTP in ${resendSeconds}s`
                    : 'Didn’t receive the code?'}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendSeconds > 0}
                  className={`min-h-[44px] px-3 rounded-[12px] text-xs font-bold inline-flex items-center gap-1.5 transition-colors ${
                    resendSeconds > 0
                      ? 'text-[#8C9696] cursor-not-allowed'
                      : 'text-[#0F5C5A] hover:bg-[#EFE7DA] cursor-pointer'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Resend OTP</span>
                </button>
              </div>
            </div>

            {/* Biometrics opt-in */}
            <label className="flex items-center justify-between gap-3 bg-white rounded-[20px] p-4 border border-[#E5DFD5] cursor-pointer min-h-[60px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[12px] bg-[#EFE7DA] text-[#0F5C5A] flex items-center justify-center shrink-0">
                  <Fingerprint className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-[#1D2A2A]">
                    Use biometrics next time
                  </span>
                  <span className="block text-xs text-[#526060]">
                    Quick fingerprint or Face ID unlock on this device
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={useBiometrics}
                onChange={(e) => setUseBiometrics(e.target.checked)}
                className="w-5 h-5 accent-[#0F5C5A] rounded cursor-pointer"
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[52px] px-5 rounded-[16px] bg-[#0F5C5A] hover:bg-[#0B4745] text-white text-base font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <Lock className="w-4 h-4" aria-hidden="true" />
              <span>{submitting ? 'Signing in...' : 'Verify & Sign in'}</span>
            </button>
          </form>
        )}
      </div>

      <div className="pt-8 flex items-center justify-center gap-2 text-xs text-[#526060]">
        <ShieldCheck className="w-4 h-4 text-[#0F5C5A] shrink-0" aria-hidden="true" />
        <span>NABH accredited care · Encrypted patient portal</span>
      </div>
    </div>
  );
}
