export default function DotProgress({ total, current }) {
  return (
    <div className="dot-progress">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`dot ${i < current ? "done" : ""} ${i === current ? "current" : ""}`}
        />
      ))}
    </div>
  );
}
