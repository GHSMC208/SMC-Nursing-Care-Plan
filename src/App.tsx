import React, { useState, useEffect } from 'react';
import { PatientDemographics, NursingCarePlan, InpatientRecord, NandaItem } from './types';
import { SAMPLE_PATIENTS } from './data/samplePatients';
import { PatientDemographicsForm } from './components/PatientDemographicsForm';
import { CarePlanEditor } from './components/CarePlanEditor';
import { NandaSearchModal } from './components/NandaSearchModal';
import { PrintableCarePlan } from './components/PrintableCarePlan';
import { PrintPreviewModal } from './components/PrintPreviewModal';
import { SavedRecordsModal } from './components/SavedRecordsModal';
import governmentHospitalsLogo from './assets/images/bahrain_gov_hospitals_logo_1787046319692.jpg';
import {
  FileSpreadsheet,
  Printer,
  Eye,
  Plus,
  Save,
  RotateCcw,
  BookOpen,
  CheckCircle,
  FolderOpen,
  Sparkles,
  Download,
  Upload,
  ArrowRightLeft,
  Columns,
  Layers,
  Heart,
  Stethoscope,
  Info
} from 'lucide-react';

const STORAGE_KEY = 'inpatient_nursing_care_plans_records';

export default function App() {
  // Current active patient demographics
  const [patient, setPatient] = useState<PatientDemographics>(SAMPLE_PATIENTS[0].patient);

  // Care Plan 1 (Priority 1)
  const [carePlan1, setCarePlan1] = useState<NursingCarePlan>(SAMPLE_PATIENTS[0].carePlan1);

  // Care Plan 2 (Priority 2)
  const [carePlan2, setCarePlan2] = useState<NursingCarePlan>(SAMPLE_PATIENTS[0].carePlan2);

  // Active Tab for editing on mobile/single view: 'demographics' | 'plan1' | 'plan2' | 'split' | 'preview'
  const [activeTab, setActiveTab] = useState<'demographics' | 'plan1' | 'plan2' | 'split' | 'preview'>('demographics');

  // NANDA Search Modal State
  const [nandaModalOpen, setNandaModalOpen] = useState(false);
  const [nandaTargetPlan, setNandaTargetPlan] = useState<1 | 2>(1);

  // Print Preview Modal and print scope
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [printScope, setPrintScope] = useState<'both' | 'plan1' | 'plan2'>('both');

  // Saved Inpatients List
  const [savedRecords, setSavedRecords] = useState<InpatientRecord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: InpatientRecord[] = JSON.parse(stored);
        // Ensure hospital name and separate ward & bed numbers are initialized
        return parsed.map((r) => {
          let wardNumber = r.patient.wardNumber || '';
          let bedNumber = r.patient.bedNumber || '';
          if (!wardNumber && !bedNumber && r.patient.wardAndBedNumber) {
            const parts = r.patient.wardAndBedNumber.split(',');
            wardNumber = parts[0]?.trim() || '';
            bedNumber = parts[1]?.replace(/^Bed\s*/i, '').trim() || '';
          }
          return {
            ...r,
            patient: {
              ...r.patient,
              wardNumber,
              bedNumber,
              wardAndBedNumber: r.patient.wardAndBedNumber || (wardNumber && bedNumber ? `${wardNumber}, Bed ${bedNumber}` : wardNumber || bedNumber),
              hospitalName: r.patient.hospitalName || 'Salmaniya Medical Complex',
            },
          };
        });
      }
    } catch (e) {
      console.error('Failed to load records from localStorage', e);
    }
    return SAMPLE_PATIENTS;
  });

  const [recordsModalOpen, setRecordsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save to localStorage whenever savedRecords change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedRecords));
    } catch (e) {
      console.error('Failed to persist to localStorage', e);
    }
  }, [savedRecords]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Load a record from saved records
  const handleLoadRecord = (record: InpatientRecord) => {
    setPatient(record.patient);
    setCarePlan1(record.carePlan1);
    setCarePlan2(record.carePlan2);
    showToast(`Loaded care plan: ${record.patient.fullName}`);
  };

  // Delete a record from saved records
  const handleDeleteRecord = (id: string) => {
    setSavedRecords((prev) => prev.filter((r) => r.id !== id));
    showToast('Record deleted from saved list');
  };

  // Import records
  const handleImportRecords = (newRecords: InpatientRecord[]) => {
    setSavedRecords((prev) => {
      const existingIds = new Set(prev.map((r) => r.id));
      const filteredNew = newRecords.filter((r) => !existingIds.has(r.id));
      return [...filteredNew, ...prev];
    });
    showToast(`Imported ${newRecords.length} care plan records`);
  };

  // Reset presets
  const handleResetPresets = () => {
    setSavedRecords(SAMPLE_PATIENTS);
    showToast('Sample inpatient presets restored');
  };

  // Open NANDA search modal for a specific plan
  const handleOpenNandaSearch = (planNum: 1 | 2) => {
    setNandaTargetPlan(planNum);
    setNandaModalOpen(true);
  };

  // When NANDA is selected from modal
  const handleApplyNanda = (
    item: NandaItem,
    selectedRelatedFactors: string[],
    selectedOutcomes: string[],
    selectedInterventions: string[]
  ) => {
    const formattedFactors = selectedRelatedFactors.join('\n• ');
    const formattedOutcomes = selectedOutcomes.join('\n• ');
    const formattedInterventions = selectedInterventions
      .map((text, idx) => `${idx + 1}. ${text}`)
      .join('\n');

    const updater = (prev: NursingCarePlan): NursingCarePlan => ({
      ...prev,
      diagnosis: item.diagnosis,
      nandaCode: item.code || '',
      domain: item.domain,
      relatedFactors: `• ${formattedFactors}`,
      expectedOutcome: `• ${formattedOutcomes}`,
      interventions: formattedInterventions,
      dateOfOnset: prev.dateOfOnset || patient.dateOfAdmission || new Date().toISOString().split('T')[0],
    });

    if (nandaTargetPlan === 1) {
      setCarePlan1(updater);
      showToast(`Applied "${item.diagnosis}" to Care Plan #1`);
    } else {
      setCarePlan2(updater);
      showToast(`Applied "${item.diagnosis}" to Care Plan #2`);
    }
  };

  // Swap Plan 1 and Plan 2 priority
  const handleSwapPlans = () => {
    const temp1 = { ...carePlan1, planNumber: 2 as 1 | 2 };
    const temp2 = { ...carePlan2, planNumber: 1 as 1 | 2 };
    setCarePlan1(temp2);
    setCarePlan2(temp1);
    showToast('Swapped Priority between Care Plan #1 and #2');
  };

  // Load a sample preset
  const handleLoadSample = (sampleId: string) => {
    const found = SAMPLE_PATIENTS.find((s) => s.id === sampleId);
    if (found) {
      setPatient(found.patient);
      setCarePlan1(found.carePlan1);
      setCarePlan2(found.carePlan2);
      showToast(`Loaded inpatient preset: ${found.patient.fullName}`);
    }
  };

  // Create new blank inpatient record
  const handleNewRecord = () => {
    const today = new Date().toISOString().split('T')[0];
    setPatient({
      fullName: '',
      idNumber: '',
      age: '',
      sex: 'Female',
      nationality: '',
      dateOfAdmission: today,
      wardNumber: '',
      bedNumber: '',
      wardAndBedNumber: '',
      caringDoctor: '',
      hospitalName: patient.hospitalName || 'Salmaniya Medical Complex',
      departmentUnit: patient.departmentUnit || 'Inpatient Nursing Care Unit',
    });

    setCarePlan1({
      id: `cp1-${Date.now()}`,
      planNumber: 1,
      title: 'Priority Nursing Care Plan #1',
      nandaCode: '',
      diagnosis: '',
      domain: '',
      dateOfOnset: today,
      relatedFactors: '',
      expectedOutcome: '',
      interventions: '',
      evaluation: '',
      status: 'Active',
    });

    setCarePlan2({
      id: `cp2-${Date.now()}`,
      planNumber: 2,
      title: 'Secondary Nursing Care Plan #2',
      nandaCode: '',
      diagnosis: '',
      domain: '',
      dateOfOnset: today,
      relatedFactors: '',
      expectedOutcome: '',
      interventions: '',
      evaluation: '',
      status: 'Active',
    });

    setActiveTab('demographics');
    showToast('New blank inpatient care plan initialized');
  };

  // Save current inpatient record to local records
  const handleSaveCurrentRecord = () => {
    if (!patient.fullName.trim()) {
      showToast('Please enter Patient Full Name before saving');
      setActiveTab('demographics');
      return;
    }

    const currentId = `rec-${Date.now()}`;
    const newRecord: InpatientRecord = {
      id: currentId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      patient,
      carePlan1,
      carePlan2,
    };

    setSavedRecords((prev) => [newRecord, ...prev.filter((r) => r.patient.idNumber !== patient.idNumber)]);
    showToast(`Saved care plan for ${patient.fullName}`);
  };

  // Direct print trigger
  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="toast-notification"
          className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <CheckCircle className="w-4 h-4 text-blue-400" />
          {toastMessage}
        </div>
      )}

      {/* Top Application Navigation Bar (Hidden on Print) */}
      <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Title */}
          <div className="flex items-center gap-3">
            <img
              src={governmentHospitalsLogo}
              alt="Government Hospitals Logo"
              className="w-10 h-10 object-contain shrink-0 rounded-lg bg-white p-0.5 border border-slate-200 shadow-xs"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight flex items-center gap-2">
                Inpatient Care Plan Suite
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200 hidden sm:inline">
                  Government Hospitals • SMC
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Standard NANDA-I taxonomy • Upper-right patient label • Print-ready A4 documentation
              </p>
            </div>
          </div>

          {/* Action Buttons Toolbar */}
          <div className="flex items-center gap-2">
            <button
              id="saved-records-btn"
              type="button"
              onClick={() => setRecordsModalOpen(true)}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="View and manage saved inpatient care plans"
            >
              <FolderOpen className="w-4 h-4 text-blue-600" />
              <span className="hidden sm:inline">Saved Drafts</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
                {savedRecords.length}
              </span>
            </button>

            <button
              id="new-care-plan-btn"
              type="button"
              onClick={handleNewRecord}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="Create New Blank Care Plan"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">New Patient</span>
            </button>

            <button
              id="save-care-plan-btn"
              type="button"
              onClick={handleSaveCurrentRecord}
              className="px-3 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-300 transition-all flex items-center gap-1.5 shadow-xs"
              title="Save to local patient records"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Save Draft</span>
            </button>

            <button
              id="preview-print-modal-btn"
              type="button"
              onClick={() => setPrintPreviewOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
              title="Open Printable Care Plans Preview"
            >
              <Eye className="w-4 h-4 text-blue-400" />
              <span className="hidden sm:inline">Print Preview</span>
            </button>

            <button
              id="instant-print-btn"
              type="button"
              onClick={handleDirectPrint}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs hover:shadow transition-all flex items-center gap-2"
              title="Send directly to browser print / save PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Print 2 Plans</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area (Hidden on Print) */}
      <main className="no-print flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Active Patient Summary Banner & View Mode Switcher */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
              Pt
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  {patient.fullName || 'Unnamed Inpatient'}
                </span>
                {patient.idNumber && (
                  <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                    {patient.idNumber}
                  </span>
                )}
                {patient.wardAndBedNumber && (
                  <span className="text-xs text-blue-800 font-medium bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {patient.wardAndBedNumber}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Admitted: {patient.dateOfAdmission || 'Not set'} • Caring DR: {patient.caringDoctor || 'Not set'}
              </p>
            </div>
          </div>

          {/* Navigation View Mode Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              id="nav-tab-demographics"
              type="button"
              onClick={() => setActiveTab('demographics')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'demographics'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Inpatient Details & Label
            </button>

            <button
              id="nav-tab-plan1"
              type="button"
              onClick={() => setActiveTab('plan1')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'plan1'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Care Plan #1</span>
              {carePlan1.diagnosis && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-200"></span>
              )}
            </button>

            <button
              id="nav-tab-plan2"
              type="button"
              onClick={() => setActiveTab('plan2')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'plan2'
                  ? 'bg-slate-900 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Care Plan #2</span>
              {carePlan2.diagnosis && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
              )}
            </button>

            <button
              id="nav-tab-split"
              type="button"
              onClick={() => setActiveTab('split')}
              className={`hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'split'
                  ? 'bg-slate-800 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View both Care Plans side-by-side"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual Split View</span>
            </button>

            <button
              id="nav-tab-preview"
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md font-semibold transition-all ${
                activeTab === 'preview'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="View full A4 Printable Sheets"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>A4 Print View</span>
            </button>
          </div>
        </div>

        {/* View Section 1: Demographics */}
        {activeTab === 'demographics' && (
          <div className="space-y-6">
            <PatientDemographicsForm
              patient={patient}
              onChange={setPatient}
              onLoadSample={handleLoadSample}
              onReset={handleNewRecord}
            />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveTab('plan1')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <span>Proceed to Care Plan #1 Editor</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>
        )}

        {/* View Section 2: Care Plan 1 */}
        {activeTab === 'plan1' && (
          <div className="space-y-6">
            <CarePlanEditor
              plan={carePlan1}
              planNumber={1}
              onChange={setCarePlan1}
              onOpenNandaSearch={() => handleOpenNandaSearch(1)}
              onSwapWithOtherPlan={handleSwapPlans}
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('demographics')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs"
              >
                ← Edit Inpatient Label Details
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('plan2')}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <span>Proceed to Care Plan #2</span>
                <span className="font-mono">→</span>
              </button>
            </div>
          </div>
        )}

        {/* View Section 3: Care Plan 2 */}
        {activeTab === 'plan2' && (
          <div className="space-y-6">
            <CarePlanEditor
              plan={carePlan2}
              planNumber={2}
              onChange={setCarePlan2}
              onOpenNandaSearch={() => handleOpenNandaSearch(2)}
              onSwapWithOtherPlan={handleSwapPlans}
            />

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setActiveTab('plan1')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg shadow-xs"
              >
                ← Back to Care Plan #1
              </button>

              <button
                type="button"
                onClick={() => setPrintPreviewOpen(true)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Open Printable Care Plans</span>
              </button>
            </div>
          </div>
        )}

        {/* View Section 4: Dual Split View (Large screens) */}
        {activeTab === 'split' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CarePlanEditor
                plan={carePlan1}
                planNumber={1}
                onChange={setCarePlan1}
                onOpenNandaSearch={() => handleOpenNandaSearch(1)}
                onSwapWithOtherPlan={handleSwapPlans}
              />
              <CarePlanEditor
                plan={carePlan2}
                planNumber={2}
                onChange={setCarePlan2}
                onOpenNandaSearch={() => handleOpenNandaSearch(2)}
                onSwapWithOtherPlan={handleSwapPlans}
              />
            </div>
          </div>
        )}

        {/* View Section 5: Inline A4 Print Preview */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            {/* Control Bar for Print View */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-xs font-bold text-slate-800">
                  Standard A4 (210 × 297mm) Inpatient Documentation Sheets
                </span>
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                  • 2 Continuous Pages with Upper-Right Patient Labels
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setPrintScope('both')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      printScope === 'both' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Both Plans (2 Pages)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintScope('plan1')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      printScope === 'plan1' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Plan 1 Only
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintScope('plan2')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${
                      printScope === 'plan2' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600'
                    }`}
                  >
                    Plan 2 Only
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print A4 Sheets</span>
                </button>
              </div>
            </div>

            {/* Rendered A4 sheets */}
            <div className="space-y-8 flex flex-col items-center">
              {(printScope === 'both' || printScope === 'plan1') && (
                <div className="w-full max-w-[210mm]">
                  <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between px-1">
                    <span>PAGE 1: NURSING CARE PLAN #1</span>
                    <span className="text-blue-700 font-mono text-[11px]">Upper-Right Patient Label Included</span>
                  </div>
                  <div className="bg-white rounded-xs shadow-md border border-slate-200 overflow-hidden">
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
                <div className="w-full max-w-[210mm]">
                  <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between px-1">
                    <span>PAGE 2: NURSING CARE PLAN #2</span>
                    <span className="text-blue-700 font-mono text-[11px]">Upper-Right Patient Label Included</span>
                  </div>
                  <div className="bg-white rounded-xs shadow-md border border-slate-200 overflow-hidden">
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
        )}
      </main>

      {/* Modals */}
      <NandaSearchModal
        isOpen={nandaModalOpen}
        onClose={() => setNandaModalOpen(false)}
        onSelectNanda={handleApplyNanda}
        currentDiagnosis={nandaTargetPlan === 1 ? carePlan1.diagnosis : carePlan2.diagnosis}
      />

      <PrintPreviewModal
        isOpen={printPreviewOpen}
        onClose={() => setPrintPreviewOpen(false)}
        patient={patient}
        carePlan1={carePlan1}
        carePlan2={carePlan2}
        printScope={printScope}
        onPrintScopeChange={setPrintScope}
      />

      <SavedRecordsModal
        isOpen={recordsModalOpen}
        onClose={() => setRecordsModalOpen(false)}
        savedRecords={savedRecords}
        currentPatientIdNumber={patient.idNumber}
        onLoadRecord={handleLoadRecord}
        onDeleteRecord={handleDeleteRecord}
        onImportRecords={handleImportRecords}
        onResetPresets={handleResetPresets}
        onNewPatient={handleNewRecord}
      />

      {/* DEDICATED PRINT-ONLY CONTAINER */}
      {/* This is permanently rendered for browser print (@media print) to ensure crisp 2-page printout with upper-right labels */}
      <div className="hidden print:block print-only-container">
        {(printScope === 'both' || printScope === 'plan1') && (
          <PrintableCarePlan
            patient={patient}
            carePlan={carePlan1}
            planNumber={1}
            totalPlans={printScope === 'both' ? 2 : 1}
          />
        )}
        {(printScope === 'both' || printScope === 'plan2') && (
          <PrintableCarePlan
            patient={patient}
            carePlan={carePlan2}
            planNumber={2}
            totalPlans={printScope === 'both' ? 2 : 1}
          />
        )}
      </div>
    </div>
  );
}
