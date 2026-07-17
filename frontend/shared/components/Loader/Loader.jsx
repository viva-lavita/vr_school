const REFERENCE_SIZE = 86;
const REFERENCE_ARC_WIDTH = 4;
const REFERENCE_GAP = 0.5;
const REFERENCE_RING_WIDTH = 8;

export default function Loader({ size = REFERENCE_SIZE, className = "" }) {
  const scale = size / REFERENCE_SIZE;
  const arcWidth = REFERENCE_ARC_WIDTH * scale;
  const gap = REFERENCE_GAP * scale;
  const ringWidth = REFERENCE_RING_WIDTH * scale;

  const center = size / 2;
  const arcRadius = center - arcWidth / 2;
  const circumference = 2 * Math.PI * arcRadius;
  const quarter = circumference / 4;

  const ringOuterEdge = center - arcWidth - gap;
  const ringRadius = ringOuterEdge - ringWidth / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`animate-spin ${className}`}
      role="status"
      aria-label="Загрузка"
    >
      <circle
        cx={center}
        cy={center}
        r={arcRadius}
        fill="none"
        strokeWidth={arcWidth}
        strokeDasharray={`${quarter} ${circumference}`}
        className="stroke-orange"
      />
      <circle
        cx={center}
        cy={center}
        r={ringRadius}
        fill="none"
        strokeWidth={ringWidth}
        className="stroke-green"
      />
    </svg>
  );
}
