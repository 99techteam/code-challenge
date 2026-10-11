export default function StatCard({ title, children, footer }) {
  return (
    <div className="rounded-xl border border-[color:var(--border)] p-3 bg-[var(--surface)]">
      <div className="text-xs text-[color:var(--muted)] mb-1">{title}</div>
      <div>{children}</div>
      {footer && <div className="text-[11px] text-[color:var(--muted)] mt-1">{footer}</div>}
    </div>
  );
}
