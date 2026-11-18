import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Bell,
  Check,
  Download,
  FileText,
  Pill,
  Scan,
  Share2,
  Stethoscope,
} from 'lucide-react';
import {
  DISCHARGE_SUMMARIES,
  IMAGING_REPORTS,
  LAB_REPORTS,
  PRESCRIPTIONS,
} from '../data/mockData';
import type {
  FamilyMember,
  ImagingReport,
  LabReport,
  Language,
  Prescription,
  RecordCategory,
} from '../types/patient';
import { t } from '../i18n/translations';
import { calculateReferenceBarPercent } from '../utils/patientLogic';
import { BottomSheet, EmptyState, SkeletonCard, StatusChip } from './ui/Primitives';

interface RecordsScreenProps {
  lang: Language;
  activeMember: FamilyMember;
  initialTab?: RecordCategory;
  initialReportId?: string;
  loading: boolean;
  unreadNotifications: number;
  onOpenNotifications: () => void;
}

export function RecordsScreen({
  lang,
  activeMember,
  initialTab = 'lab',
  initialReportId,
  loading,
  unreadNotifications,
  onOpenNotifications,
}: RecordsScreenProps) {
  const [activeTab, setActiveTab] = useState<RecordCategory>(initialTab);
  const [selectedLabReport, setSelectedLabReport] = useState<LabReport | null>(null);
  const [selectedImaging, setSelectedImaging] = useState<ImagingReport | null>(null);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [shareTargetTitle, setShareTargetTitle] = useState<string | null>(null);
  const [downloadedId, setDownloadedId] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    if (initialReportId) {
      const found = LAB_REPORTS.find(
        (r) => r.id === initialReportId && r.memberId === activeMember.id
      );
      if (found) setSelectedLabReport(found);
    }
  }, [initialReportId, activeMember.id]);

  const memberLabs = useMemo(
    () => LAB_REPORTS.filter((r) => r.memberId === activeMember.id),
    [activeMember.id]
  );

  // Group lab reports by dateDisplay
  const groupedLabs = useMemo(() => {
    const map = new Map<string, LabReport[]>();
    memberLabs.forEach((rep) => {
      const existing = map.get(rep.dateDisplay) ?? [];
      existing.push(rep);
      map.set(rep.dateDisplay, existing);
    });
    return Array.from(map.entries());
  }, [memberLabs]);

  const memberImaging = IMAGING_REPORTS.filter((r) => r.memberId === activeMember.id);
  const memberDischarge = DISCHARGE_SUMMARIES.filter((r) => r.memberId === activeMember.id);
  const memberRx = PRESCRIPTIONS.filter((r) => r.memberId === activeMember.id);

  const handleDownload = (id: string) => {
    setDownloadedId(id);
    window.setTimeout(() => {
      setDownloadedId((curr) => (curr === id ? null : curr));
    }, 2000);
  };

  // Report Detail View (in-screen drilldown with clean Back header)
  if (selectedLabReport) {
    const markerPct = calculateReferenceBarPercent(
      selectedLabReport.keyValue,
      selectedLabReport.referenceMin,
      selectedLabReport.referenceMax
    );

    // SVG Trend chart dimensions
    const trend = selectedLabReport.trend;
    const minVal = Math.min(...trend.map((p) => p.value), selectedLabReport.referenceMin) * 0.9;
    const maxVal = Math.max(...trend.map((p) => p.value), selectedLabReport.referenceMax) * 1.08;
    const width = 300;
    const height = 104;
    const padX = 24;
    const padY = 18;
    const pts = trend.map((pt, idx) => {
      const x =
        trend.length === 1
          ? width / 2
          : padX + (idx / (trend.length - 1)) * (width - padX * 2);
      const normY = (pt.value - minVal) / Math.max(0.01, maxVal - minVal);
      const y = height - padY - normY * (height - padY * 2);
      return { ...pt, x, y };
    });
    const polylinePoints = pts.map((p) => `${p.x},${p.y}`).join(' ');

    return (
      <div className="pb-8">
        <header className="px-5 pt-3.5 pb-3 bg-[#FAF8F4] sticky top-0 z-20 border-b border-[#E5DFD5] flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedLabReport(null)}
            aria-label="Back to reports"
            className="min-h-[48px] min-w-[48px] -ml-2 rounded-[14px] flex items-center justify-center text-[#1D2A2A] hover:bg-[#EFE7DA] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-base font-extrabold text-[#1D2A2A] leading-snug">
              {selectedLabReport.testName}
            </h1>
            <p className="text-xs text-[#526060]">
              {selectedLabReport.dateDisplay} · {selectedLabReport.doctorName}
            </p>
          </div>
        </header>

        <div className="px-5 pt-4 space-y-5">
          {/* Primary Metric + Reference Range Bar */}
          <section className="bg-white rounded-[24px] p-5 border border-[#E5DFD5] shadow-[0_2px_10px_rgba(29,42,42,0.04)] space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-[#526060]">
                  {selectedLabReport.keyMetricLabel}
                </p>
                <p className="text-[32px] font-extrabold text-[#1D2A2A] tabular-nums leading-tight mt-0.5">
                  {selectedLabReport.keyValue}{' '}
                  <span className="text-base font-semibold text-[#526060]">
                    {selectedLabReport.unit}
                  </span>
                </p>
              </div>
              <div className="text-right flex flex-col items-end gap-1.5">
                <StatusChip
                  status={selectedLabReport.status}
                  label={selectedLabReport.status === 'Normal' ? t(lang, 'normal') : t(lang, 'review')}
                />
                <span className="text-xs font-bold text-[#1D2A2A] tabular-nums">
                  Ref: {selectedLabReport.referenceRangeText}
                </span>
              </div>
            </div>

            {/* Visual Reference-Range Bar */}
            <div>
              <div className="relative h-3 rounded-full bg-[#EFE7DA] overflow-visible">
                {/* Normal middle zone mapped from 25% to 75% */}
                <div
                  className="absolute top-0 bottom-0 left-[25%] right-[25%] rounded-full bg-[#1A6B46]/25"
                  aria-hidden="true"
                />
                {/* Marker */}
                <div
                  style={{ left: `${markerPct}%` }}
                  className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full border-2 border-white shadow-sm ${
                    selectedLabReport.status === 'Normal' ? 'bg-[#1A6B46]' : 'bg-[#9A5B00]'
                  }`}
                  aria-label={`Result marker at ${selectedLabReport.keyValue} ${selectedLabReport.unit}`}
                />
              </div>
              <div className="flex justify-between text-[11px] text-[#687676] mt-1.5 tabular-nums">
                <span>Low</span>
                <span>
                  Normal ({selectedLabReport.referenceMin}–{selectedLabReport.referenceMax})
                </span>
                <span>High</span>
              </div>
            </div>

            {/* One-line plain-language explanation */}
            <p className="text-sm text-[#1D2A2A] leading-relaxed pt-2 border-t border-[#EFE7DA]">
              {selectedLabReport.plainExplanation}
            </p>
          </section>

          {/* 2026 Trend Chart */}
          <section className="bg-white rounded-[24px] p-5 border border-[#E5DFD5] space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1D2A2A]">{t(lang, 'trendTitle')}</h2>
              <span className="text-xs text-[#526060]">{selectedLabReport.unit}</span>
            </div>

            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-28 overflow-visible"
              role="img"
              aria-label={`2026 trend for ${selectedLabReport.keyMetricLabel}`}
            >
              <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="#EFE7DA" strokeWidth="1" />
              <polyline
                fill="none"
                stroke="#0F5C5A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={polylinePoints}
              />
              {pts.map((p, idx) => (
                <g key={idx}>
                  <circle cx={p.x} cy={p.y} r="4.5" fill="#FFFFFF" stroke="#0F5C5A" strokeWidth="2.5" />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className="fill-[#1D2A2A] text-[10px] font-bold"
                  >
                    {p.value}
                  </text>
                  <text
                    x={p.x}
                    y={height - 2}
                    textAnchor="middle"
                    className="fill-[#687676] text-[10px]"
                  >
                    {p.dateLabel}
                  </text>
                </g>
              ))}
            </svg>
          </section>

          {/* Sub-results breakdown if present */}
          {selectedLabReport.subResults && (
            <section className="bg-white rounded-[24px] p-5 border border-[#E5DFD5] space-y-3">
              <h2 className="text-sm font-bold text-[#1D2A2A]">Detailed Parameters</h2>
              <div className="divide-y divide-[#EFE7DA]">
                {selectedLabReport.subResults.map((item) => (
                  <div key={item.label} className="py-2.5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#1D2A2A]">{item.label}</p>
                      <p className="text-xs text-[#526060] tabular-nums">Ref: {item.range}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-extrabold text-[#1D2A2A] tabular-nums">
                        {item.value}
                      </p>
                      <span
                        className={`text-[11px] font-bold ${
                          item.status === 'Normal' ? 'text-[#1A6B46]' : 'text-[#8C5200]'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Calm doctor reassurance note */}
          <div className="bg-[#EFE7DA] rounded-[20px] p-4 flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-[#0F5C5A] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm font-semibold text-[#1D2A2A] leading-relaxed">
              {t(lang, 'doctorDiscussNote')}
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDownload(selectedLabReport.id)}
              className="min-h-[48px] px-4 rounded-[16px] bg-[#0F5C5A] text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              {downloadedId === selectedLabReport.id ? (
                <>
                  <Check className="w-4 h-4" aria-hidden="true" />
                  <span>Saved PDF</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Download</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShareTargetTitle(selectedLabReport.testName)}
              className="min-h-[48px] px-4 rounded-[16px] bg-white border border-[#E5DFD5] text-[#1D2A2A] text-sm font-bold flex items-center justify-center gap-2 cursor-pointer"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Sticky Header */}
      <header className="px-5 pt-4 pb-3 bg-[#FAF8F4] sticky top-0 z-20 border-b border-[#E5DFD5]/60">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-xl font-extrabold text-[#1D2A2A] tracking-tight">
              {t(lang, 'navRecords')}
            </h1>
            <p className="text-xs text-[#526060]">
              {activeMember.name} · UHID {activeMember.uhid}
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
        <div className="grid grid-cols-4 gap-1 p-1 bg-[#EFE7DA] rounded-[16px]" role="tablist">
          {(
            [
              ['lab', t(lang, 'tabLab')],
              ['imaging', t(lang, 'tabImaging')],
              ['discharge', t(lang, 'tabDischarge')],
              ['prescriptions', t(lang, 'tabPrescriptions')],
            ] as [RecordCategory, string][]
          ).map(([tabKey, label]) => (
            <button
              key={tabKey}
              type="button"
              role="tab"
              aria-selected={activeTab === tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`min-h-[44px] px-1 rounded-[12px] text-xs font-bold whitespace-nowrap truncate transition-colors cursor-pointer ${
                activeTab === tabKey
                  ? 'bg-white text-[#1D2A2A] shadow-sm'
                  : 'text-[#526060] hover:text-[#1D2A2A]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="px-5 pt-4 space-y-5">
        {loading ? (
          <div className="space-y-3">
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
            <SkeletonCard rows={2} />
          </div>
        ) : activeTab === 'lab' ? (
          groupedLabs.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-6 h-6" aria-hidden="true" />}
              title="No lab reports yet"
              description={`Diagnostic test results for ${activeMember.name} will appear here as soon as they are verified.`}
            />
          ) : (
            groupedLabs.map(([dateDisplay, reports]) => (
              <section key={dateDisplay} className="space-y-2.5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#526060]">
                  {dateDisplay}
                </h2>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] shadow-[0_2px_10px_rgba(29,42,42,0.04)] space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="text-base font-extrabold text-[#1D2A2A] leading-snug">
                            {report.testName}
                          </h3>
                          <p className="text-xs text-[#526060] mt-0.5">
                            {report.doctorName} · {report.timeDisplay}
                          </p>
                        </div>
                        <StatusChip
                          status={report.status}
                          label={report.status === 'Normal' ? t(lang, 'normal') : t(lang, 'review')}
                        />
                      </div>

                      <div className="flex items-baseline justify-between bg-[#FAF8F4] rounded-[14px] px-3.5 py-2.5">
                        <span className="text-xs font-medium text-[#526060]">
                          {report.keyMetricLabel}
                        </span>
                        <span className="text-lg font-extrabold text-[#1D2A2A] tabular-nums">
                          {report.keyValue}{' '}
                          <span className="text-xs font-semibold text-[#526060]">
                            {report.unit}
                          </span>
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedLabReport(report)}
                          className="min-h-[48px] px-3 rounded-[14px] bg-[#0F5C5A] hover:bg-[#0B4745] text-white text-xs font-bold cursor-pointer"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(report.id)}
                          className="min-h-[48px] px-3 rounded-[14px] bg-[#EFE7DA] hover:bg-[#E6DBC9] text-[#1D2A2A] text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {downloadedId === report.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#1A6B46]" aria-hidden="true" />
                              <span>Saved</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-3.5 h-3.5" aria-hidden="true" />
                              <span>Download</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShareTargetTitle(report.testName)}
                          className="min-h-[48px] px-3 rounded-[14px] bg-white border border-[#E5DFD5] hover:bg-[#FAF8F4] text-[#1D2A2A] text-xs font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )
        ) : activeTab === 'imaging' ? (
          memberImaging.length === 0 ? (
            <EmptyState
              icon={<Scan className="w-6 h-6" aria-hidden="true" />}
              title="No imaging studies"
              description={`PET-CT, MRI, or X-ray studies for ${activeMember.name} will appear here.`}
            />
          ) : (
            <div className="space-y-3">
              {memberImaging.map((img) => (
                <div
                  key={img.id}
                  className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-extrabold text-[#1D2A2A]">{img.testName}</h3>
                      <p className="text-xs text-[#526060] mt-0.5">
                        {img.modality} · {img.dateDisplay} · {img.doctorName}
                      </p>
                    </div>
                    <StatusChip status={img.status} />
                  </div>
                  <p className="text-sm text-[#526060] leading-relaxed">{img.summary}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedImaging(img)}
                    className="w-full min-h-[48px] rounded-[14px] bg-[#0F5C5A] text-white text-xs font-bold cursor-pointer"
                  >
                    View Findings
                  </button>
                </div>
              ))}
            </div>
          )
        ) : activeTab === 'discharge' ? (
          memberDischarge.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-6 h-6" aria-hidden="true" />}
              title="No discharge summaries"
              description={`Daycare or inpatient summaries for ${activeMember.name} will appear here.`}
            />
          ) : (
            <div className="space-y-3">
              {memberDischarge.map((dis) => (
                <div
                  key={dis.id}
                  className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] space-y-2.5"
                >
                  <h3 className="text-base font-extrabold text-[#1D2A2A]">{dis.title}</h3>
                  <p className="text-xs text-[#526060]">
                    {dis.dateDisplay} · {dis.stayDuration} · {dis.doctorName}
                  </p>
                  <p className="text-sm text-[#1D2A2A] leading-relaxed">{dis.summary}</p>
                  <p className="text-xs font-semibold text-[#0F5C5A] pt-1">
                    Recommended follow-up: {dis.followUpDate}
                  </p>
                </div>
              ))}
            </div>
          )
        ) : memberRx.length === 0 ? (
          <EmptyState
            icon={<Pill className="w-6 h-6" aria-hidden="true" />}
            title="No prescriptions yet"
            description={`Active e-prescriptions for ${activeMember.name} will be listed here.`}
          />
        ) : (
          <div className="space-y-3">
            {memberRx.map((rx) => (
              <div
                key={rx.id}
                className="bg-white rounded-[20px] p-4 border border-[#E5DFD5] space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1D2A2A]">{rx.doctorName}</h3>
                    <p className="text-xs text-[#526060] mt-0.5">
                      {rx.speciality} · {rx.dateDisplay}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#0F5C5A] tabular-nums">
                    {rx.medications.length} medicines
                  </span>
                </div>
                <p className="text-sm text-[#526060]">{rx.diagnosisNote}</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRx(rx)}
                    className="min-h-[48px] rounded-[14px] bg-[#0F5C5A] text-white text-xs font-bold cursor-pointer"
                  >
                    View Medicines
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(rx.id)}
                    className="min-h-[48px] rounded-[14px] bg-[#EFE7DA] text-[#1D2A2A] text-xs font-bold cursor-pointer"
                  >
                    {downloadedId === rx.id ? 'Saved PDF' : 'Download Rx'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Imaging Detail Sheet */}
      <BottomSheet
        open={Boolean(selectedImaging)}
        onClose={() => setSelectedImaging(null)}
        title={selectedImaging?.testName ?? ''}
        subtitle={
          selectedImaging ? `${selectedImaging.dateDisplay} · ${selectedImaging.doctorName}` : undefined
        }
      >
        {selectedImaging && (
          <div className="space-y-4">
            <div className="bg-white rounded-[16px] p-4 border border-[#E5DFD5] space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#526060]">
                Radiologist Findings
              </p>
              <p className="text-sm text-[#1D2A2A] leading-relaxed">{selectedImaging.findings}</p>
            </div>
            <div className="bg-[#EFE7DA] rounded-[16px] p-4 text-sm font-semibold text-[#1D2A2A]">
              {t(lang, 'doctorDiscussNote')}
            </div>
          </div>
        )}
      </BottomSheet>

      {/* Prescription Detail Sheet */}
      <BottomSheet
        open={Boolean(selectedRx)}
        onClose={() => setSelectedRx(null)}
        title="Prescription Details"
        subtitle={selectedRx ? `${selectedRx.doctorName} · ${selectedRx.dateDisplay}` : undefined}
      >
        {selectedRx && (
          <div className="space-y-3">
            {selectedRx.medications.map((med) => (
              <div
                key={med.name}
                className="bg-white rounded-[18px] p-4 border border-[#E5DFD5] space-y-1.5"
              >
                <p className="text-sm font-extrabold text-[#1D2A2A]">{med.name}</p>
                <p className="text-xs font-semibold text-[#0F5C5A]">
                  {med.dosage} · {med.frequency} · {med.duration}
                </p>
                <p className="text-xs text-[#526060]">{med.instruction}</p>
              </div>
            ))}
          </div>
        )}
      </BottomSheet>

      {/* Share Sheet */}
      <BottomSheet
        open={Boolean(shareTargetTitle)}
        onClose={() => setShareTargetTitle(null)}
        title="Share Report Safely"
        subtitle={shareTargetTitle ?? undefined}
      >
        <div className="space-y-3">
          <p className="text-sm text-[#526060] leading-relaxed">
            Generate a temporary, read-only link for a consulting specialist or family caregiver.
          </p>
          <button
            type="button"
            onClick={() => setShareTargetTitle(null)}
            className="w-full min-h-[48px] rounded-[16px] bg-[#0F5C5A] text-white text-sm font-bold cursor-pointer"
          >
            Copy Secure Link (Valid 48h)
          </button>
          <button
            type="button"
            onClick={() => setShareTargetTitle(null)}
            className="w-full min-h-[48px] rounded-[16px] bg-[#EFE7DA] text-[#1D2A2A] text-sm font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
