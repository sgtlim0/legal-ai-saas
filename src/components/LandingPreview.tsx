'use client';

import { useState } from 'react';
import { LandingVariant } from '@/lib/types';

interface LandingPreviewProps {
  variants: LandingVariant[];
}

export default function LandingPreview({ variants }: LandingPreviewProps) {
  const [selectedVariant, setSelectedVariant] = useState(0);

  if (!variants || variants.length === 0) {
    return null;
  }

  const variant = variants[selectedVariant];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Landing Page Preview</h3>
        <div className="flex items-center gap-2">
          {variants.map((_, index) => (
            <button
              key={index}
              onClick={() => setSelectedVariant(index)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedVariant === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Variant {String.fromCharCode(65 + index)}
            </button>
          ))}
        </div>
      </div>

      {/* Mini landing page preview */}
      <div className="bg-white rounded-lg p-8 text-gray-900 space-y-6">
        {/* Headline */}
        <h1 className="text-3xl md:text-4xl font-bold leading-tight">{variant.headline}</h1>

        {/* Subheadline */}
        <p className="text-xl text-gray-700">{variant.subheadline}</p>

        {/* Bullet points */}
        <ul className="space-y-3">
          {variant.bodyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                ✓
              </span>
              <span className="text-gray-700">{point}</span>
            </li>
          ))}
        </ul>

        {/* CTA button */}
        <button className="bg-blue-500 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg">
          {variant.cta}
        </button>

        {/* Compliance badges */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3">Compliance Check</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(variant.complianceCheck).map(([key, status]) => (
              <div
                key={key}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  status === 'PASS'
                    ? 'bg-green-100 text-green-700'
                    : status === 'FAIL'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠'} {key.replace(/_/g, ' ')}
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-gray-500 pt-4 border-t border-gray-200">
          This is a communication from a law firm. Prior results do not guarantee a similar outcome. Attorney advertising.
        </p>
      </div>
    </div>
  );
}
