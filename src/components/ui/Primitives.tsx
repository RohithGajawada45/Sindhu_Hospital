import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw, WifiOff, X } from 'lucide-react';

export function StatusChip({
  status,
  label,
}: {
  status: 'Normal' | 'Review' | 'Paid' | 'Due';
  label?: string;
}) {
  const isPositive = status === 'Normal' || status === 'Paid';
  const text = label ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[10px] text-xs font-semibold tracking-tight whitespace-nowrap shrink-0 ${
        isPositive
          ? 'bg-[#E7F4ED] text-[#1A6B46]'
          : 'bg-[#FDF1D9] text-[#8C5200]'
      }`}
    >
      {isPositive ? (
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      )}
      <span>{text}</span>
    </span>
  );
}

export function SkeletonCard({ rows = 2 }: { rows?: number }) {
  return (
    <div
      className="bg-white rounded-[20px] p-4 border border-[#E5DFD5]/70 space-y-3"
      aria-busy="true"
      aria-label="Loading content"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-2/3 rounded-lg skeleton-shimmer" />
        <div className="h-6 w-16 rounded-lg skeleton-shimmer" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 rounded-lg skeleton-shimmer ${i === rows - 1 ? 'w-1/2' : 'w-5/6'}`}
        />
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="bg-white rounded-[24px] p-6 border border-[#E5DFD5] text-center flex flex-col items-center">
      <div className="w-12 h-12 rounded-[16px] bg-[#EFE7DA] text-[#0F5C5A] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-[17px] font-bold text-[#1D2A2A] mb-1">{title}</h3>
      <p className="text-sm text-[#526060] leading-relaxed max-w-[260px] mb-5">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="min-h-[48px] px-6 rounded-[16px] bg-[#0F5C5A] hover:bg-[#0B4745] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export function InlineError({
  title,
  description,
  retryLabel = 'Retry',
  onRetry,
}: {
  title: string;
  description: string;
  retryLabel?: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="bg-[#FDF1D9] border border-[#E8CFA0] rounded-[20px] p-4 flex items-start gap-3"
    >
      <AlertCircle className="w-5 h-5 text-[#8C5200] shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#1D2A2A]">{title}</p>
        <p className="text-sm text-[#526060] mt-0.5 leading-snug">{description}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 min-h-[48px] px-4 rounded-[14px] bg-white border border-[#D8C299] text-[#1D2A2A] text-sm font-semibold inline-flex items-center gap-2 hover:bg-[#FAF8F4] transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          <span>{retryLabel}</span>
        </button>
      </div>
    </div>
  );
}

export function OfflineBanner({
  message,
  retryLabel,
  onRetry,
}: {
  message: string;
  retryLabel: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="status"
      className="bg-[#EFE7DA] border-b border-[#DFD3BE] px-4 py-2.5 flex items-center justify-between gap-2 text-xs font-medium text-[#1D2A2A]"
    >
      <div className="flex items-center gap-2 min-w-0">
        <WifiOff className="w-4 h-4 text-[#8C5200] shrink-0" aria-hidden="true" />
        <span className="leading-snug">{message}</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-[36px] px-2.5 rounded-[10px] bg-white border border-[#D8CBB6] text-xs font-semibold text-[#0F5C5A] shrink-0 hover:bg-[#FAF8F4] cursor-pointer"
      >
        {retryLabel}
      </button>
    </div>
  );
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#1D2A2A]/45"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        aria-label="Close sheet backdrop"
        onClick={onClose}
        className="absolute inset-0 w-full h-full cursor-default"
      />
      <div className="relative w-full max-w-[390px] bg-[#FAF8F4] rounded-t-[24px] shadow-[0_-8px_32px_rgba(29,42,42,0.16)] max-h-[86vh] flex flex-col animate-sheet-up">
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-[#D6CEC0]" aria-hidden="true" />
        </div>
        <div className="px-5 pb-3 pt-1 flex items-start justify-between gap-3 border-b border-[#E5DFD5] shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-[#1D2A2A] leading-snug">{title}</h2>
            {subtitle && <p className="text-xs text-[#526060] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={`Close ${title}`}
            className="min-h-[48px] min-w-[48px] -mr-2 -mt-1 rounded-[14px] flex items-center justify-center text-[#526060] hover:bg-[#EFE7DA] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
