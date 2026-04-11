import type { CampaignStats } from '../api/campaigns';

export function StatsBar({ stats }: { stats: CampaignStats }) {
  return (
    <div className="stats-grid">
      <StatCard label="Total"     value={stats.total}   />
      <StatCard label="Sent"      value={stats.sent}    />
      <StatCard label="Failed"    value={stats.failed}  />
      <StatCard label="Opened"    value={stats.opened}  />
      <RateCard label="Send Rate" rate={stats.send_rate} color="var(--blue)" />
      <RateCard label="Open Rate" rate={stats.open_rate} color="var(--green)" />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function RateCard({ label, rate, color }: { label: string; rate: number; color: string }) {
  return (
    <div className="stat-card">
      <span className="stat-value">{rate}%</span>
      <span className="stat-label">{label}</span>
      <div className="rate-bar-track">
        <div className="rate-bar-fill" style={{ width: `${rate}%`, background: color }} />
      </div>
    </div>
  );
}
