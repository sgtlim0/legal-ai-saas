'use client';

import { useState, useEffect } from 'react';
import { PipelineRun, PipelineStage, US_STATES, PRACTICE_AREAS } from '@/lib/types';
import StatsBar from '@/components/StatsBar';
import PipelineVisualizer from '@/components/PipelineVisualizer';
import StageDetail from '@/components/StageDetail';
import LandingPreview from '@/components/LandingPreview';

export default function Home() {
  const [pipelineRun, setPipelineRun] = useState<PipelineRun | null>(null);
  const [selectedStage, setSelectedStage] = useState<PipelineStage | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [formData, setFormData] = useState({
    keyword: 'car accident lawyer',
    jurisdiction: 'California',
    practiceArea: 'Car Accident',
  });

  // Load demo data on mount
  useEffect(() => {
    loadDemoData();
  }, []);

  const loadDemoData = async () => {
    try {
      const response = await fetch('/api/demo');
      const data = await response.json();
      setPipelineRun(data);
    } catch (error) {
      console.error('Failed to load demo data:', error);
    }
  };

  const handleRunPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRunning(true);

    try {
      const response = await fetch('/api/pipeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Pipeline execution failed');
      }

      const data = await response.json();
      setPipelineRun(data);
    } catch (error) {
      console.error('Pipeline error:', error);
      alert('Failed to run pipeline. Please try again.');
    } finally {
      setIsRunning(false);
    }
  };

  const landingVariants = pipelineRun?.stages
    .find(s => s.agent === 'Landing Generator')
    ?.output as any;

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">LegalAI Pipeline Dashboard</h1>
        <p className="text-gray-400">AI-powered marketing automation for law firms</p>
      </div>

      {/* Stats Bar */}
      {pipelineRun && <StatsBar stats={pipelineRun.stats} />}

      {/* Run Pipeline Form */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Run New Pipeline</h2>
        <form onSubmit={handleRunPipeline} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="keyword" className="block text-sm font-medium text-gray-400 mb-2">
              Keyword
            </label>
            <input
              id="keyword"
              type="text"
              value={formData.keyword}
              onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="e.g. truck accident lawyer"
              required
            />
          </div>

          <div>
            <label htmlFor="jurisdiction" className="block text-sm font-medium text-gray-400 mb-2">
              Jurisdiction
            </label>
            <select
              id="jurisdiction"
              value={formData.jurisdiction}
              onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            >
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="practiceArea" className="block text-sm font-medium text-gray-400 mb-2">
              Practice Area
            </label>
            <select
              id="practiceArea"
              value={formData.practiceArea}
              onChange={(e) => setFormData({ ...formData, practiceArea: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
              required
            >
              {PRACTICE_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={isRunning}
              className="w-full md:w-auto px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-700 text-white font-semibold rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isRunning ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Running Pipeline...
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Run Pipeline
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Pipeline Visualization */}
      {pipelineRun && (
        <>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Pipeline Stages</h2>
            <PipelineVisualizer stages={pipelineRun.stages} onStageClick={setSelectedStage} />
          </div>

          {/* Landing Page Preview */}
          {landingVariants && landingVariants.variants && (
            <div className="mb-8">
              <LandingPreview variants={landingVariants.variants} />
            </div>
          )}
        </>
      )}

      {/* Stage Detail Modal */}
      {selectedStage && <StageDetail stage={selectedStage} onClose={() => setSelectedStage(null)} />}
    </div>
  );
}
