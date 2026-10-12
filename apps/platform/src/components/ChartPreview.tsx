import React from 'react';
import { LocaleMode } from '../types';

interface ChartProps {
  locale: LocaleMode;
}

export const ChartPreview: React.FC<ChartProps> = ({ locale }) => {
  const isAr = locale === 'ar';
  
  // Clean SVG responsive trend chart
  const points = [
    { label: isAr ? 'يناير' : 'Jan', val: 32 },
    { label: isAr ? 'فبراير' : 'Feb', val: 45 },
    { label: isAr ? 'مارس' : 'Mar', val: 41 },
    { label: isAr ? 'أبريل' : 'Apr', val: 62 },
    { label: isAr ? 'مايو' : 'May', val: 58 },
    { label: isAr ? 'يونيو' : 'Jun', val: 78 },
    { label: isAr ? 'يوليو' : 'Jul', val: 89 }
  ];

  const maxVal = 100;
  const svgWidth = 500;
  const svgHeight = 180;
  const padding = 30;

  const pointsString = points
    .map((p, idx) => {
      const x = padding + (idx * (svgWidth - 2 * padding)) / (points.length - 1);
      const y = svgHeight - padding - (p.val / maxVal) * (svgHeight - 2 * padding);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', maxHeight: '200px' }}>
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-base)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--accent-base)" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        <line x1={padding} y1={padding} x2={svgWidth - padding} y2={padding} stroke="var(--border-subtle)" strokeDasharray="3 3" />
        <line x1={padding} y1={svgHeight / 2} x2={svgWidth - padding} y2={svgHeight / 2} stroke="var(--border-subtle)" strokeDasharray="3 3" />
        <line x1={padding} y1={svgHeight - padding} x2={svgWidth - padding} y2={svgHeight - padding} stroke="var(--border-default)" />

        {/* Area & Trend line */}
        <polygon
          points={`${padding},${svgHeight - padding} ${pointsString} ${svgWidth - padding},${svgHeight - padding}`}
          fill="url(#chartGradient)"
        />
        <polyline
          points={pointsString}
          fill="none"
          stroke="var(--accent-base)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((p, idx) => {
          const x = padding + (idx * (svgWidth - 2 * padding)) / (points.length - 1);
          const y = svgHeight - padding - (p.val / maxVal) * (svgHeight - 2 * padding);
          return (
            <g key={idx}>
              <circle cx={x} cy={y} r="4" fill="var(--bg-surface)" stroke="var(--accent-light)" strokeWidth="2" />
              <text
                x={x}
                y={svgHeight - 10}
                fill="var(--text-tertiary)"
                fontSize="10"
                textAnchor="middle"
                fontFamily="inherit"
              >
                {p.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
