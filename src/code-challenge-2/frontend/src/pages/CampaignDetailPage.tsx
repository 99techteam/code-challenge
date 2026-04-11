import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { campaignsApi } from '../api/campaigns';
import { StatusBadge } from '../components/StatusBadge';
import { StatsBar } from '../components/StatsBar';
import { Skeleton } from '../components/Skeleton';

export function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [scheduleAt, setScheduleAt] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [actionError, setActionError] = useState('');

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.get(id!),
    enabled: !!id,
  });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['campaign', id] });
    qc.invalidateQueries({ queryKey: ['campaigns'] });
  }

  const scheduleMutation = useMutation({
    // convert datetime-local value (YYYY-MM-DDTHH:MM) to full ISO string
    mutationFn: () => campaignsApi.schedule(id!, new Date(scheduleAt).toISOString()),
    onSuccess: () => { invalidate(); setShowSchedule(false); setActionError(''); },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string; details?: { message: string }[] } } })?.response?.data;
      setActionError(msg?.details?.[0]?.message ?? msg?.error ?? 'failed to schedule');
    },
  });

  const sendMutation = useMutation({
    mutationFn: () => campaignsApi.send(id!),
    onSuccess: invalidate,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setActionError(msg ?? 'failed to send');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => campaignsApi.delete(id!),
    onSuccess: () => navigate('/campaigns'),
  });

  if (isLoading) {
    return (
      <div className="page">
        <Skeleton className="sk-h1" />
        <Skeleton className="sk-sub" />
        <Skeleton className="sk-block" />
      </div>
    );
  }

  if (error || !campaign) {
    return <div className="page"><div className="alert alert-error">Campaign not found</div></div>;
  }

  const isDraft     = campaign.status === 'draft';
  const isScheduled = campaign.status === 'scheduled';
  const isSent      = campaign.status === 'sent';

  return (
    <div className="page">
      <header className="page-header">
        <Link to="/campaigns" className="back-link">← Campaigns</Link>
        <div className="header-actions">
          <StatusBadge status={campaign.status} />
        </div>
      </header>

      <h1 className="campaign-detail-title">{campaign.name}</h1>
      <p className="campaign-detail-subject">Subject: <strong>{campaign.subject}</strong></p>

      {campaign.scheduled_at && (
        <p className="campaign-detail-meta">
          Scheduled for: {new Date(campaign.scheduled_at).toLocaleString()}
        </p>
      )}

      {actionError && <div className="alert alert-error">{actionError}</div>}

      {/* action buttons */}
      <div className="action-bar">
        {isDraft && (
          <>
            <button className="btn btn-secondary" onClick={() => { setShowSchedule(s => !s); setActionError(''); }}>
              Schedule
            </button>
            <button
              className="btn btn-primary"
              disabled={sendMutation.isPending}
              onClick={() => { if (confirm('Send this campaign now?')) sendMutation.mutate(); }}
            >
              {sendMutation.isPending ? 'Sending…' : 'Send Now'}
            </button>
            <button
              className="btn btn-danger"
              onClick={() => { if (confirm('Delete this campaign?')) deleteMutation.mutate(); }}
            >
              Delete
            </button>
          </>
        )}
        {isScheduled && (
          <button
            className="btn btn-primary"
            disabled={sendMutation.isPending}
            onClick={() => { if (confirm('Send this campaign now?')) sendMutation.mutate(); }}
          >
            {sendMutation.isPending ? 'Sending…' : 'Send Now'}
          </button>
        )}
        {isSent && <span className="sent-notice">✓ This campaign has been sent</span>}
      </div>

      {/* schedule picker */}
      {showSchedule && (
        <div className="schedule-panel">
          <label htmlFor="schedule-at">Schedule for</label>
          <input
            id="schedule-at"
            type="datetime-local"
            value={scheduleAt}
            min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
            onChange={e => setScheduleAt(e.target.value)}
          />
          <button
            className="btn btn-primary"
            disabled={!scheduleAt || scheduleMutation.isPending}
            onClick={() => scheduleMutation.mutate()}
          >
            {scheduleMutation.isPending ? 'Scheduling…' : 'Confirm Schedule'}
          </button>
        </div>
      )}

      {/* stats */}
      <section className="detail-section">
        <h2>Stats</h2>
        <StatsBar stats={campaign.stats} />
      </section>

      {/* email body preview */}
      <section className="detail-section">
        <h2>Email Body</h2>
        <div className="email-body-preview">{campaign.body}</div>
      </section>

      {/* recipients */}
      <section className="detail-section">
        <h2>Recipients ({campaign.recipients.length})</h2>
        <table className="recipients-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Status</th>
              <th>Sent At</th>
              <th>Opened At</th>
            </tr>
          </thead>
          <tbody>
            {campaign.recipients.map(r => (
              <tr key={r.id}>
                <td>{r.email}</td>
                <td>{r.name}</td>
                <td><span className={`badge badge-${r.status}`}>{r.status}</span></td>
                <td>{r.sent_at ? new Date(r.sent_at).toLocaleString() : '—'}</td>
                <td>{r.opened_at ? new Date(r.opened_at).toLocaleString() : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
