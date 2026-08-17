import React from 'react';
import { PatientDemographics } from '../types';
import { User, Calendar, Bed, Hash, Stethoscope, Flag, Building2, Sparkles, DoorOpen } from 'lucide-react';

interface PatientDemographicsFormProps {
  patient: PatientDemographics;
  onChange: (updated: PatientDemographics) => void;
  onLoadSample: (sampleKey: string) => void;
  onReset: () => void;
}

export const PatientDemographicsForm: React.FC<PatientDemographicsFormProps> = ({
  patient,
  onChange,
  onLoadSample,
  onReset,
}) => {
  const handleFieldChange = (field: keyof PatientDemographics, value: any) => {
    const updated = {
      ...patient,
      [field]: value,
    };

    // Keep wardAndBedNumber in sync
    if (field === 'wardNumber' || field === 'bedNumber') {
      const w = field === 'wardNumber' ? value : patient.wardNumber;
      const b = field === 'bedNumber' ? value : patient.bedNumber;
      updated.wardAndBedNumber = w && b ? `${w}, Bed ${b}` : w || b || '';
    }

    onChange(updated);
  };

  const setTodayAdmission = () => {
    const today = new Date().toISOString().split('T')[0];
    handleFieldChange('dateOfAdmission', today);
  };

  const wardDisplay = patient.wardNumber || (patient.wardAndBedNumber ? patient.wardAndBedNumber.split(',')[0]?.trim() : '');
  const bedDisplay = patient.bedNumber || (patient.wardAndBedNumber ? patient.wardAndBedNumber.split(',')[1]?.replace(/^Bed\s*/i, '').trim() : '');

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-200">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Inpatient Demographics & Upper-Right Label Data
            </h2>
            <p className="text-xs text-slate-500">
              Required for the hospital identification label printed on the top-right of both care plans
            </p>
          </div>
        </div>

        {/* Quick Sample Loader Chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-medium hidden sm:inline flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Presets:
          </span>
          <button
            id="load-sample-surgical-btn"
            type="button"
            onClick={() => onLoadSample('sample-1')}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 transition-all text-xs shadow-xs"
            title="Load Surgical Inpatient (Post-Cholecystectomy)"
          >
            Surgical Post-Op
          </button>
          <button
            id="load-sample-cardiac-btn"
            type="button"
            onClick={() => onLoadSample('sample-2')}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 transition-all text-xs shadow-xs"
            title="Load Cardiac Inpatient (CHF / Telemetry)"
          >
            Cardiac CHF
          </button>
          <button
            id="load-sample-neuro-btn"
            type="button"
            onClick={() => onLoadSample('sample-3')}
            className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 font-semibold border border-slate-300 transition-all text-xs shadow-xs"
            title="Load Neuro Inpatient (Stroke / Fall Risk)"
          >
            Stroke / Neuro
          </button>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Fields (8 Cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Patient Full Name */}
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-blue-600" /> Patient Full Name *
            </label>
            <input
              id="patient-full-name-input"
              type="text"
              placeholder="e.g., Eleanor Vance"
              value={patient.fullName}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 2. Patient ID / MRN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-blue-600" /> ID Number (MRN) *
            </label>
            <input
              id="patient-id-input"
              type="text"
              placeholder="e.g., MRN-8492015"
              value={patient.idNumber}
              onChange={(e) => handleFieldChange('idNumber', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono placeholder:text-slate-400"
            />
          </div>

          {/* 3. Age */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Age *
            </label>
            <input
              id="patient-age-input"
              type="number"
              min="0"
              max="130"
              placeholder="e.g., 58"
              value={patient.age}
              onChange={(e) => handleFieldChange('age', e.target.value ? parseInt(e.target.value, 10) : '')}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 4. Sex */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Sex *
            </label>
            <select
              id="patient-sex-select"
              value={patient.sex}
              onChange={(e) => handleFieldChange('sex', e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            >
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other / Undisclosed</option>
            </select>
          </div>

          {/* 5. Nationality */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Flag className="w-3.5 h-3.5 text-blue-600" /> Nationality *
            </label>
            <input
              id="patient-nationality-input"
              type="text"
              placeholder="e.g., Bahraini, British, American"
              value={patient.nationality}
              onChange={(e) => handleFieldChange('nationality', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 6. Date of Admission */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-600" /> Date of Admission *
              </label>
              <button
                type="button"
                onClick={setTodayAdmission}
                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline"
              >
                Set Today
              </button>
            </div>
            <input
              id="patient-admission-date-input"
              type="date"
              value={patient.dateOfAdmission}
              onChange={(e) => handleFieldChange('dateOfAdmission', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
            />
          </div>

          {/* 7. Ward Number (Separated) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <DoorOpen className="w-3.5 h-3.5 text-blue-600" /> Ward Number *
            </label>
            <input
              id="patient-ward-number-input"
              type="text"
              placeholder="e.g., Ward 4B / 4B"
              value={patient.wardNumber || ''}
              onChange={(e) => handleFieldChange('wardNumber', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 8. Bed Number (Separated) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Bed className="w-3.5 h-3.5 text-blue-600" /> Bed Number *
            </label>
            <input
              id="patient-bed-number-input"
              type="text"
              placeholder="e.g., 12 / Bed 12"
              value={patient.bedNumber || ''}
              onChange={(e) => handleFieldChange('bedNumber', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* 9. Caring Doctor (DR) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" /> Caring Doctor (DR) *
            </label>
            <input
              id="patient-caring-dr-input"
              type="text"
              placeholder="e.g., Dr. Michael Chen, MD"
              value={patient.caringDoctor}
              onChange={(e) => handleFieldChange('caringDoctor', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Facility Name */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" /> Hospital / Health Facility Name
            </label>
            <input
              id="patient-hospital-name-input"
              type="text"
              placeholder="e.g., Salmaniya Medical Complex"
              value={patient.hospitalName || ''}
              onChange={(e) => handleFieldChange('hospitalName', e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>
        </div>

        {/* Right Preview Column: Upper Right Patient Label Live Preview (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-start">
          <div className="p-4 bg-slate-900 text-white rounded-xl shadow-sm border border-slate-800 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Upper-Right Print Label Preview
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Kardex Sticker</span>
            </div>

            {/* The exact official inpatient label formatting */}
            <div
              id="upper-right-patient-label-preview"
              className="bg-white text-slate-900 p-3.5 rounded-lg border border-slate-300 shadow-sm font-sans text-xs space-y-2"
            >
              <div className="flex justify-between items-start border-b border-slate-200 pb-1.5">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">Patient Full Name</span>
                  <p className="font-bold text-sm text-slate-900 tracking-tight">
                    {patient.fullName || '— [Full Name Required] —'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block uppercase font-semibold">ID / MRN</span>
                  <span className="font-mono font-bold text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300 text-slate-800">
                    {patient.idNumber || 'MRN-XXXXXXX'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 text-[11px] border-b border-slate-200 pb-1.5">
                <div>
                  <span className="text-[9px] text-slate-500 block">AGE</span>
                  <span className="font-bold">{patient.age ? `${patient.age} yrs` : '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">SEX</span>
                  <span className="font-bold">{patient.sex || '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">NATIONALITY</span>
                  <span className="font-bold truncate block">{patient.nationality || '—'}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 text-[11px] border-b border-slate-200 pb-1.5">
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">WARD NO.</span>
                  <span className="font-bold text-slate-900 truncate block">{wardDisplay || '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">BED NO.</span>
                  <span className="font-bold text-blue-700 truncate block">{bedDisplay || '—'}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block uppercase font-semibold">ADMISSION</span>
                  <span className="font-bold truncate block">{patient.dateOfAdmission || '—'}</span>
                </div>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 block font-semibold">CARING DOCTOR (DR)</span>
                <span className="font-bold text-slate-900 block truncate">{patient.caringDoctor || '—'}</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
              This label will be printed at the top-right corner of both Inpatient Care Plan #1 and Care Plan #2 for quick nurse verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
