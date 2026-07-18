interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackClass?: string;
  progressClass?: string;
}

export const CircularProgress = ({
  progress,
  size = 40,
  strokeWidth = 4,
  trackClass = "text-gray-200",
  progressClass = "text-rose-500",
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, progress));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      aria-label={`Tiến độ ${Math.round(clamped)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackClass}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={progressClass}
        />
      </svg>

      <span className="absolute text-[10px] font-bold leading-none">
        {Math.round(clamped)}%
      </span>
    </div>
  );
};
