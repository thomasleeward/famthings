export function Progress({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-line">
      <div className="h-full rounded-full bg-success" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}
