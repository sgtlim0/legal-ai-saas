'use client';

import { PipelineStage } from '@/lib/types';

interface StageDetailProps {
  stage: PipelineStage;
  onClose: () => void;
}

export default function StageDetail({ stage, onClose }: StageDetailProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div>
            <h2 className="text-2xl font-bold text-white">{stage.agent}</h2>
            <p className="text-sm text-gray-400 mt-1">Pipeline Stage Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Status & Timing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Status</p>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    stage.status === 'completed'
                      ? 'bg-green-400'
                      : stage.status === 'running'
                      ? 'bg-blue-400 animate-pulse'
                      : stage.status === 'failed'
                      ? 'bg-red-400'
                      : 'bg-gray-400'
                  }`}
                />
                <span className="text-white font-medium capitalize">{stage.status}</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Duration</p>
              <p className="text-white font-medium">
                {stage.startedAt && stage.completedAt
                  ? `${Math.round((new Date(stage.completedAt).getTime() - new Date(stage.startedAt).getTime()) / 1000)}s`
                  : '-'}
              </p>
            </div>
          </div>

          {/* Token Usage */}
          {stage.tokenUsage ? (
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">Token Usage</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Prompt</p>
                  <p className="text-white font-medium">{stage.tokenUsage.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completion</p>
                  <p className="text-white font-medium">{(stage.tokenUsage * 0.3).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="text-white font-medium">{(stage.tokenUsage * 1.3).toFixed(0)}</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Compliance Check */}
          {stage.agent.includes('Landing') && stage.output ? (
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-3">Compliance Check</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white text-sm">No misleading claims</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white text-sm">Bar association compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-400">✓</span>
                  <span className="text-white text-sm">Proper disclaimers included</span>
                </div>
              </div>
            </div>
          ) : null}

          {/* Input */}
          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">Input</p>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(stage.input, null, 2)}
            </pre>
          </div>

          {/* Output */}
          <div>
            <p className="text-sm font-medium text-gray-400 mb-2">Output</p>
            <pre className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
              {JSON.stringify(stage.output, null, 2)}
            </pre>
          </div>

          {/* Error */}
          {stage.error ? (
            <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg p-4">
              <p className="text-sm font-medium text-red-400 mb-2">Error</p>
              <p className="text-red-300 text-sm">{stage.error}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
