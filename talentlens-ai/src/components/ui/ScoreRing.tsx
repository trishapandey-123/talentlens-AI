type ScoreRingProps = {
  score: number | undefined; // 0-100, undefined = not scored yet
  size?: number; // px
};

// STRONG matches SHORTLIST_THRESHOLD in convex/screening.ts
const STRONG = 70;
const FAIR = 40;

function toneFor(score: number | undefined) {
  if (score === undefined) return "stroke-slate-300";
  if (score >= STRONG) return "stroke-teal-600";
  if (score >= FAIR) return "stroke-amber-500";
  return "stroke-rose-500";
}

export default function ScoreRing({ score, size = 48 }: ScoreRingProps) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = score === undefined ? 0 : Math.min(100, Math.max(0, Math.round(score)));

  return (
    <div
      role="img"
      aria-label={score === undefined ? "Not scored yet" : `ATS score ${value} out of 100`}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-slate-200"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          className={toneFor(score)}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-semibold tabular-nums text-slate-900">
        {score === undefined ? "–" : value}
      </span>
    </div>
  );
}
