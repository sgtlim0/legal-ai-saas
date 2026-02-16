'use client';

import { PipelineStage } from '@/lib/types';

interface PipelineVisualizerProps {
  stages: PipelineStage[];
  onStageClick: (stage: PipelineStage) => void;
}

const stageIcons: Record<string, string> = {
  'Intent Scorer': '🎯',
  'Landing Generator': '📄',
  'Lead Qualifier': '✓',
  'Conversion Script': '💬',
  'Follow-up Sequence': '📧',
  'Revenue Analytics': '📊',
};

export default function PipelineVisualizer({ stages, onStageClick }: PipelineVisualizerProps) {
  return (
    <div className="relative">
      {/* Stage cards container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
        {stages.map((stage, index) => {
          const icon = stageIcons[stage.agent] || '⚡';
          const isRunning = stage.status === 'running';
          const isCompleted = stage.status === 'completed';
          const isFailed = stage.status === 'failed';

          return (
            <div key={stage.agent} className="relative">
              {/* Stage card */}
              <button
                onClick={() => onStageClick(stage)}
                className={`w-full bg-gray-900 border rounded-xl p-6 text-left transition-all hover:border-gray-600 ${
                  isRunning
                    ? 'border-blue-500 shadow-lg shadow-blue-500/20 animate-pulse-soft'
                    : isCompleted
                    ? 'border-green-500'
                    : isFailed
                    ? 'border-red-500'
                    : 'border-gray-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{icon}</div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{stage.agent}</h3>
                      <p className="text-xs text-gray-500">Stage {index + 1}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      isRunning
                        ? 'bg-blue-500 bg-opacity-20 text-blue-400'
                        : isCompleted
                        ? 'bg-green-500 bg-opacity-20 text-green-400'
                        : isFailed
                        ? 'bg-red-500 bg-opacity-20 text-red-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {stage.status === 'pending' && 'Pending'}
                    {stage.status === 'running' && 'Running...'}
                    {stage.status === 'completed' && 'Completed'}
                    {stage.status === 'failed' && 'Failed'}
                  </div>
                </div>

                {/* Duration */}
                {stage.startedAt && stage.completedAt ? (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">Duration</p>
                    <p className="text-sm text-gray-300">
                      {Math.round((new Date(stage.completedAt).getTime() - new Date(stage.startedAt).getTime()) / 1000)}s
                    </p>
                  </div>
                ) : null}

                {/* Output preview */}
                {stage.output ? (
                  <div className="mt-4 pt-4 border-t border-gray-800">
                    <p className="text-xs text-gray-500 mb-2">Output Preview</p>
                    <div className="bg-gray-800 rounded-lg p-3 max-h-24 overflow-hidden relative">
                      <pre className="text-xs text-gray-400 line-clamp-3">
                        {typeof stage.output === 'string'
                          ? stage.output.substring(0, 100)
                          : JSON.stringify(stage.output, null, 2).substring(0, 100)}
                      </pre>
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-800 to-transparent" />
                    </div>
                  </div>
                ) : null}

                {/* Click to expand hint */}
                <div className="mt-4 text-xs text-gray-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  Click to view details
                </div>
              </button>

              {/* Arrow connector (not on last item, hidden on mobile) */}
              {index < stages.length - 1 && (index + 1) % 3 !== 0 ? (
                <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
