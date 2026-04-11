import type { Campaign } from '../api/campaigns';

const CONFIG: Record<Campaign['status'], { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'badge badge-draft'     },
  scheduled: { label: 'Scheduled', className: 'badge badge-scheduled' },
  sending:   { label: 'Sending',   className: 'badge badge-sending'   },
  sent:      { label: 'Sent',      className: 'badge badge-sent'      },
};

export function StatusBadge({ status }: { status: Campaign['status'] }) {
  const { label, className } = CONFIG[status] ?? CONFIG.draft;
  return <span className={className}>{label}</span>;
}
