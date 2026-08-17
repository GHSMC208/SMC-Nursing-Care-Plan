import React, { useState, useMemo } from 'react';
import { NandaItem } from '../types';
import { NANDA_DATABASE, NANDA_DOMAINS } from '../data/nandaData';
import { Search, X, Check, BookOpen, Sparkles, Filter, ChevronRight, ShieldAlert, HeartPulse, Activity, Droplets, Zap, Brain, HelpCircle, Wind } from 'lucide-react';

interface NandaSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNanda: (
    item: NandaItem,
    selectedRelatedFactors: string[],
    selectedOutcomes: string[],
    selectedInterventions: string[]
  ) => void;
  currentDiagnosis?: string;
}

export const NandaSearchModal: React.FC<NandaSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectNanda,
  currentDiagnosis = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All Domains');
  const [activeItem, setActiveItem] = useState<NandaItem>(NANDA_DATABASE[0]);

  // Selected suggestions for the active item
  const [selectedFactors, setSelectedFactors] = useState<string[]>([]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [selectedInterventions, setSelectedInterventions] = useState<string[]>([]);

  // When active item changes, reset selected items to default all or first ones
  const handleSelectActiveItem = (item: NandaItem) => {
    setActiveItem(item);
    setSelectedFactors(item.suggestedRelatedFactors);
    setSelectedOutcomes(item.suggestedExpectedOutcomes);
    setSelectedInterventions(item.suggestedInterventions);
  };

  // Filter diagnoses
  const filteredList = useMemo(() => {
    return NANDA_DATABASE.filter((item) => {
      const matchesDomain =
        selectedDomain === 'All Domains' || item.domain === selectedDomain;
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.diagnosis.toLowerCase().includes(query) ||
        (item.code && item.code.includes(query)) ||
        item.domain.toLowerCase().includes(query) ||
        item.definition.toLowerCase().includes(query) ||
        item.suggestedRelatedFactors.some((f) => f.toLowerCase().includes(query)) ||
        item.suggestedInterventions.some((i) => i.toLowerCase().includes(query));

      return matchesDomain && matchesSearch;
    });
  }, [searchTerm, selectedDomain]);

  // Initialize selection when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const match = NANDA_DATABASE.find(
        (n) => n.diagnosis.toLowerCase() === currentDiagnosis.toLowerCase()
      );
      const initial = match || NANDA_DATABASE[0];
      handleSelectActiveItem(initial);
    }
  }, [isOpen, currentDiagnosis]);

  if (!isOpen) return null;

  const toggleFactor = (factor: string) => {
    setSelectedFactors((prev) =>
      prev.includes(factor) ? prev.filter((f) => f !== factor) : [...prev, factor]
    );
  };

  const toggleOutcome = (outcome: string) => {
    setSelectedOutcomes((prev) =>
      prev.includes(outcome) ? prev.filter((o) => o !== outcome) : [...prev, outcome]
    );
  };

  const toggleIntervention = (intervention: string) => {
    setSelectedInterventions((prev) =>
      prev.includes(intervention)
        ? prev.filter((i) => i !== intervention)
        : [...prev, intervention]
    );
  };

  const handleApply = () => {
    onSelectNanda(
      activeItem,
      selectedFactors.length > 0 ? selectedFactors : activeItem.suggestedRelatedFactors,
      selectedOutcomes.length > 0 ? selectedOutcomes : activeItem.suggestedExpectedOutcomes,
      selectedInterventions.length > 0
        ? selectedInterventions
        : activeItem.suggestedInterventions
    );
    onClose();
  };

  const getDomainIcon = (domain: string) => {
    switch (domain) {
      case 'Comfort & Pain':
        return <HeartPulse className="w-4 h-4 text-rose-600" />;
      case 'Safety & Protection':
        return <ShieldAlert className="w-4 h-4 text-amber-600" />;
      case 'Cardiopulmonary & Oxygenation':
        return <Wind className="w-4 h-4 text-sky-600" />;
      case 'Nutrition & Hydration':
        return <Droplets className="w-4 h-4 text-cyan-600" />;
      case 'Activity & Rest':
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'Neuro & Coping':
        return <Brain className="w-4 h-4 text-purple-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div
      id="nanda-search-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="nanda-search-modal-container"
        className="relative w-full max-w-5xl h-[88vh] bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                NANDA-I Nursing Diagnoses Taxonomy
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Search & Auto-Populate
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Select an evidence-based NANDA diagnosis and choose tailored etiology, outcomes, and interventions
              </p>
            </div>
          </div>
          <button
            id="close-nanda-modal-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Domain Filter Bar */}
        <div className="px-6 py-3 border-b border-slate-200 bg-white flex flex-col gap-2">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="nanda-search-input"
              type="text"
              placeholder="Search by diagnosis name, code (e.g. 00132), symptom, or keyword (pain, gas exchange, falls, wound)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 py-0.5 rounded bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>

          {/* Domain Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-400 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Domain:
            </span>
            {NANDA_DOMAINS.map((domain) => {
              const isSelected = selectedDomain === domain;
              return (
                <button
                  key={domain}
                  onClick={() => setSelectedDomain(domain)}
                  className={`px-3 py-1 rounded-full font-medium whitespace-nowrap transition-all text-xs ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Main Body: 2 columns */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden bg-slate-50">
          {/* Left Column: Diagnosis List (5 Cols) */}
          <div className="md:col-span-5 border-r border-slate-200 overflow-y-auto bg-white p-3 space-y-2">
            <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-500">
              <span>Matching Diagnoses ({filteredList.length})</span>
              <span className="text-[11px] text-slate-400">Click to select</span>
            </div>

            {filteredList.length === 0 ? (
              <div className="text-center py-12 px-4">
                <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">No NANDA diagnoses match your search</p>
                <p className="text-xs text-slate-500 mt-1">
                  Try searching for keywords like "pain", "infection", "mobility", "respiratory", or "fluid".
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedDomain('All Domains');
                  }}
                  className="mt-3 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-lg border border-blue-200"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              filteredList.map((item) => {
                const isActive = activeItem.diagnosis === item.diagnosis;
                return (
                  <button
                    key={item.diagnosis}
                    id={`nanda-item-${item.code || item.diagnosis.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => handleSelectActiveItem(item)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex flex-col gap-1.5 ${
                      isActive
                        ? 'bg-blue-50/90 border-blue-500 ring-1 ring-blue-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {getDomainIcon(item.domain)}
                        <span className="font-bold text-sm text-slate-900 leading-tight">
                          {item.diagnosis}
                        </span>
                      </div>
                      {item.code && (
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          #{item.code}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-medium text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {item.domain}
                      </span>
                      {item.classCategory && (
                        <span className="text-slate-400">• {item.classCategory}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.definition}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Diagnosis Inspection & Builder (7 Cols) */}
          <div className="md:col-span-7 flex flex-col h-full overflow-hidden bg-slate-50/70">
            {activeItem ? (
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Active Diagnosis Overview Banner */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                        {activeItem.domain}
                      </span>
                      {activeItem.code && (
                        <span className="text-xs font-mono text-slate-500 font-semibold">
                          Code: {activeItem.code}
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{activeItem.diagnosis}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <strong className="text-slate-700">Definition: </strong>
                    {activeItem.definition}
                  </p>
                </div>

                {/* Section 1: Related Factors (Etiology) */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                      1. Related Factors (Etiologies / "Related to...")
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {selectedFactors.length} selected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Select the contributing pathophysiology, surgical causes, or conditions to include in this care plan:
                  </p>
                  <div className="space-y-1.5">
                    {activeItem.suggestedRelatedFactors.map((factor, idx) => {
                      const isChecked = selectedFactors.includes(factor);
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-medium'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleFactor(factor)}
                            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="leading-snug">{factor}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Expected Outcomes (NOC) */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      2. Expected Outcomes (NOC / Measurable SMART Goals)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {selectedOutcomes.length} selected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Select measurable goals and target criteria to evaluate patient progress:
                  </p>
                  <div className="space-y-1.5">
                    {activeItem.suggestedExpectedOutcomes.map((outcome, idx) => {
                      const isChecked = selectedOutcomes.includes(outcome);
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-medium'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleOutcome(outcome)}
                            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="leading-snug">{outcome}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Section 3: Nursing Interventions (NIC) */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      3. Nursing Interventions & Rationales (NIC)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {selectedInterventions.length} selected
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Select independent, collaborative, and assessment nursing actions:
                  </p>
                  <div className="space-y-1.5">
                    {activeItem.suggestedInterventions.map((intervention, idx) => {
                      const isChecked = selectedInterventions.includes(intervention);
                      return (
                        <label
                          key={idx}
                          className={`flex items-start gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-blue-50/70 border-blue-300 text-blue-950 font-medium'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleIntervention(intervention)}
                            className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="leading-snug">{intervention}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 text-center text-slate-400">
                Select a diagnosis from the left column to view suggestions.
              </div>
            )}

            {/* Footer Apply Actions */}
            <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between gap-3 shadow-xs">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                Cancel
              </button>
              <button
                id="apply-nanda-to-plan-btn"
                type="button"
                onClick={handleApply}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs hover:shadow transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Apply Selected NANDA to Care Plan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
