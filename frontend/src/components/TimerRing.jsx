export default function TimerRing({ secondsLeft, totalSeconds }) {
  const radius = 27;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.max(secondsLeft, 0) / totalSeconds;
  const offset = circumference * (1 - ratio);
  const isLow = secondsLeft <= Math.max(5, totalSeconds * 0.25);

  return (
    <div className={`timer-ring ${isLow ? "low" : ""}`}>
      <svg width="64" height="64" viewBox="0 0 64 64">
        <circle className="track" cx="32" cy="32" r={radius} />
        <circle
          className="progress"
          cx="32"
          cy="32"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="timer-ring-label">{Math.max(secondsLeft, 0)}</div>
    </div>
  );
}
