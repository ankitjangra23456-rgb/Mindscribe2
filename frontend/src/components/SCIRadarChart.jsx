import React from 'react';

/**
 * Pure SVG spider/radar chart for Skill Confidence Index visualization.
 * No external charting library needed.
 */
export default function SCIRadarChart({ skills = [], size = 200 }) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.38;
  const levels = 4;
  const count = skills.length;
  if (count < 3) return null;

  // Angle for each skill axis (starting from top, clockwise)
  const angleStep = (2 * Math.PI) / count;
  const angle = (i) => -Math.PI / 2 + i * angleStep;

  // Convert polar to cartesian
  const toXY = (i, r) => ({
    x: cx + r * Math.cos(angle(i)),
    y: cy + r * Math.sin(angle(i)),
  });

  // Polygon points string for a given value ratio (0–1)
  const polyPoints = (ratio) =>
    skills
      .map((_, i) => {
        const { x, y } = toXY(i, radius * ratio);
        return `${x},${y}`;
      })
      .join(' ');

  // Data polygon
  const dataPoints = skills
    .map((s, i) => {
      const { x, y } = toXY(i, radius * (s.value / 100));
      return `${x},${y}`;
    })
    .join(' ');

  const GRID_COLOR = 'var(--border-color)';
  const AXIS_COLOR = 'var(--text-muted)';

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
      {/* Background grid rings */}
      {Array.from({ length: levels }).map((_, l) => (
        <polygon
          key={l}
          points={polyPoints((l + 1) / levels)}
          fill="none"
          stroke={GRID_COLOR}
          strokeWidth="1"
          opacity="0.5"
        />
      ))}

      {/* Axis lines */}
      {skills.map((_, i) => {
        const outer = toXY(i, radius);
        return (
          <line
            key={i}
            x1={cx} y1={cy}
            x2={outer.x} y2={outer.y}
            stroke={GRID_COLOR}
            strokeWidth="1"
            opacity="0.5"
          />
        );
      })}

      {/* Data area fill */}
      <polygon
        points={dataPoints}
        fill="rgba(59, 130, 246, 0.15)"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Data point dots */}
      {skills.map((s, i) => {
        const { x, y } = toXY(i, radius * (s.value / 100));
        return (
          <circle key={i} cx={x} cy={y} r="3.5" fill="#3b82f6" />
        );
      })}

      {/* Skill labels */}
      {skills.map((s, i) => {
        const labelR = radius + 22;
        const { x, y } = toXY(i, labelR);
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="9"
            fontWeight="700"
            fontFamily="Plus Jakarta Sans, sans-serif"
            fill={AXIS_COLOR}
          >
            {s.label}
          </text>
        );
      })}
    </svg>
  );
}
