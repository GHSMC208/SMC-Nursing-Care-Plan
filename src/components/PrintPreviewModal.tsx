import React, { useState } from 'react';
import { PatientDemographics, NursingCarePlan } from '../types';
import { PrintableCarePlan } from './PrintableCarePlan';
import { Printer, X, ZoomIn, ZoomOut, Maximize2, FileText, CheckCircle2 } from 'lucide-react';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientDemographics;
  carePlan1: NursingCarePlan;
  carePlan2: NursingCarePlan;
  printScope: 'both' | 'plan1' | 'plan2';
  onPrintScopeChange: (scope: 'both' | 'plan1' | 'plan2') => void;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  patient,
  carePlan1,
  carePlan2,
  printScope,
  onPrintScopeChange,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="print-preview-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="print-preview-modal-container"
        className="relative w-full max-w-6xl max-h-[96vh] bg-slate-900 rounded-xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden text-slate-100 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-900 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Inpatient Care Plans — A4 Print Preview
              </h2>
              <p className="text-xs text-slate-400">
                Standard A4 (210 × 297mm) formatted clinical charts with upper-right label
              </p>
            </div>
          </div>

          {/* Scope Selector, Zoom & Print Trigger */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Scope Selection */}
            <div className="bg-slate-800 p-1 rounded-lg border border-slate-700 flex items-center text-xs">
              <button
                type="button"
                onClick={() => onPrintScopeChange('both')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  printScope === 'both'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Both Plans (2 Pages)
              </button>
              <button
                type="button"
                onClick={() => onPrintScopeChange('plan1')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  printScope === 'plan1'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Plan 1 Only
              </button>
              <button
                type="button"
                onClick={() => onPrintScopeChange('plan2')}
                className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                  printScope === 'plan2'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Plan 2 Only
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="hidden md:flex items-center bg-slate-800 rounded-lg border border-slate-700 p-1 text-xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                className="p-1.5 rounded text-slate-400 hover:text-white transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-slate-300 font-mono text-[11px] min-w-[45px] text-center">
                {zoomLevel}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(130, z + 10))}
                className="p-1.5 rounded text-slate-400 hover:text-white transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(100)}
                className="px-2 py-1 rounded text-[10px] text-slate-400 hover:text-white transition-colors font-medium border-l border-slate-700 ml-1"
                title="Reset to 100% standard A4 scale"
              >
                100%
              </button>
            </div>

            <button
              id="confirm-print-btn"
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Print Instruction Subbar */}
        <div className="bg-slate-800/90 px-6 py-2 border-b border-slate-700 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
            <span>
              <strong>Print Setting Tip:</strong> Select paper size <span className="text-blue-300 font-bold">A4</span> and ensure{' '}
              <span className="text-blue-300 font-bold">"Background Graphics"</span> is enabled in the print dialog.
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>Dimensions: 210mm × 297mm</span>
            <span>•</span>
            <span className="text-blue-400 font-bold">
              {printScope === 'both' ? '2 Pages Total' : '1 Page Total'}
            </span>
          </div>
        </div>

        {/* Paper Canvas Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950/90 space-y-10 flex flex-col items-center">
          <div
            className="w-full flex flex-col items-center space-y-10 transition-transform origin-top duration-150"
            style={{ transform: zoomLevel !== 100 ? `scale(${zoomLevel / 100})` : undefined }}
          >
            {(printScope === 'both' || printScope === 'plan1') && (
              <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-[210mm] text-xs font-bold text-slate-400 mb-2 flex items-center justify-between px-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    PAGE 1: NURSING CARE PLAN #1
                  </span>
                  <span className="text-blue-400 font-mono text-[11px]">Upper-Right Inpatient Label Included</span>
                </div>
                <div className="w-full max-w-[210mm] bg-white rounded-xs shadow-2xl overflow-hidden border border-slate-700">
                  <PrintableCarePlan
                    patient={patient}
                    carePlan={carePlan1}
                    planNumber={1}
                    totalPlans={printScope === 'both' ? 2 : 1}
                  />
                </div>
              </div>
            )}

            {(printScope === 'both' || printScope === 'plan2') && (
              <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-[210mm] text-xs font-bold text-slate-400 mb-2 flex items-center justify-between px-1">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    PAGE 2: NURSING CARE PLAN #2
                  </span>
                  <span className="text-blue-400 font-mono text-[11px]">Upper-Right Inpatient Label Included</span>
                </div>
                <div className="w-full max-w-[210mm] bg-white rounded-xs shadow-2xl overflow-hidden border border-slate-700">
                  <PrintableCarePlan
                    patient={patient}
                    carePlan={carePlan2}
                    planNumber={2}
                    totalPlans={printScope === 'both' ? 2 : 1}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
