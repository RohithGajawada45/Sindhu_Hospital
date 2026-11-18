import React from 'react';
import { Calendar, Check, CreditCard, FileText, Pill } from 'lucide-react';
import { BottomSheet } from './ui/Primitives';
import type { AppNotification, Language, TabId } from '../types/patient';
import { t } from '../i18n/translations';

interface NotificationsSheetProps {
  open: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onSelectNotification: (notif: AppNotification) => void;
  lang: Language;
}

export function NotificationsSheet({
  open,
  onClose,
  notifications,
  onMarkAllRead,
  onSelectNotification,
  lang,
}: NotificationsSheetProps) {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const getIcon = (category: AppNotification['category']) => {
    switch (category) {
      case 'report':
        return <FileText className="w-4 h-4 text-[#0F5C5A]" aria-hidden="true" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-[#0F5C5A]" aria-hidden="true" />;
      case 'billing':
        return <CreditCard className="w-4 h-4 text-[#0F5C5A]" aria-hidden="true" />;
      case 'prescription':
        return <Pill className="w-4 h-4 text-[#0F5C5A]" aria-hidden="true" />;
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={t(lang, 'notifications')}
      subtitle={unreadCount > 0 ? `${unreadCount} unread updates` : 'All caught up'}
    >
      <div className="space-y-3">
        {unreadCount > 0 && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onMarkAllRead}
              className="min-h-[48px] px-3 rounded-[14px] text-sm font-semibold text-[#0F5C5A] hover:bg-[#EFE7DA] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" aria-hidden="true" />
              <span>{t(lang, 'markAllRead')}</span>
            </button>
          </div>
        )}

        {notifications.map((notif) => (
          <button
            key={notif.id}
            type="button"
            onClick={() => {
              onSelectNotification(notif);
              onClose();
            }}
            className={`w-full text-left p-4 rounded-[20px] border transition-colors cursor-pointer flex items-start gap-3 min-h-[64px] ${
              notif.read
                ? 'bg-white border-[#E5DFD5]'
                : 'bg-[#E5F0EF]/55 border-[#0F5C5A]/25'
            }`}
          >
            <div className="w-10 h-10 rounded-[14px] bg-[#EFE7DA] flex items-center justify-center shrink-0 mt-0.5">
              {getIcon(notif.category)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-[#1D2A2A] leading-snug">{notif.title}</p>
                <span className="text-xs text-[#687676] whitespace-nowrap shrink-0">
                  {notif.timeLabel}
                </span>
              </div>
              <p className="text-sm text-[#526060] mt-1 leading-snug">{notif.body}</p>
            </div>
          </button>
        ))}
      </div>
    </BottomSheet>
  );
}
